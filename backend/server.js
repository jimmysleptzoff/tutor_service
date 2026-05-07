require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.json());
const PASSWORD_ROUNDS = 10;

/** Human-readable DB errors for the API (MySQL often returns ECONNREFUSED when the server is off). */
function dbFriendlyMessage(err) {
  if (!err) return "Database error";
  const e = Array.isArray(err.errors) && err.errors[0] ? err.errors[0] : err;
  const code = e.code || err.code;
  if (code === "ECONNREFUSED") {
    return "Cannot connect to MySQL. Start MySQL (default port 3306), then try again.";
  }
  if (code === "ER_ACCESS_DENIED_ERROR" || String(code || "").includes("ACCESS_DENIED")) {
    return "MySQL rejected the login. Check DB_USER and DB_PASSWORD in backend/.env.";
  }
  if (code === "ER_BAD_DB_ERROR") {
    const name = process.env.DB_NAME || "tutorScheduler";
    return `Unknown database "${name}". Create it or fix DB_NAME in backend/.env.`;
  }
  return e.sqlMessage || e.message || err.sqlMessage || err.message || "Database error";
}

// Pool (not single connection) — better for concurrent dashboard tabs during demos.
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  /** Must be MySQL port (3306), not the Express API port — a common mix-up we documented in .env.example */
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "tutorScheduler",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

function toPublicUser(row, role, idField) {
  if (!row) return null;
  return {
    studentId: Number(row[idField]),
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    role: String(role || "").toLowerCase(),
  };
}

function authConfig(role) {
  const normalized = String(role || "").toLowerCase();
  if (normalized === "student") return { table: "student", idField: "studentId", role: "student" };
  if (normalized === "tutor") return { table: "tutor", idField: "tutorId", role: "tutor" };
  if (normalized === "admin") return { table: "admin", idField: "adminId", role: "admin" };
  return null;
}


// ================= AUTH + ACCOUNT LOOKUPS =================

// Student profile lookup used by the UI shell; never returns password hash.
app.get("/users/:studentId", (req, res) => {
  const studentId = Number(req.params.studentId);

  const sql = "SELECT studentId, firstName, lastName, email FROM student WHERE studentId = ?";

  db.query(sql, [studentId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        message: dbFriendlyMessage(err),
      });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(toPublicUser(result[0], "student", "studentId"));
  });
});

// Login supports all three account tables; "role" determines where we authenticate.
app.post("/auth/login", (req, res) => {
  const { studentId: rawStudentId, role: rawRole, password } = req.body || {};
  const loginId = Number(rawStudentId);
  const role = String(rawRole || "").toLowerCase().trim();
  const cfg = authConfig(role);

  if (!Number.isFinite(loginId) || !cfg || !password) {
    return res.status(400).json({ message: "Valid ID, role, and password are required." });
  }

  db.query(
    `SELECT ${cfg.idField}, firstName, lastName, email, passwordHash FROM ${cfg.table} WHERE ${cfg.idField} = ?`,
    [loginId],
    async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: dbFriendlyMessage(err) });
      }
      if (result.length === 0) {
        return res.status(401).json({ message: "Invalid credentials." });
      }

      const user = result[0];
      if (!user.passwordHash) {
        return res.status(400).json({
          message: "This account has no passwordHash in the database.",
        });
      }

      const ok = await bcrypt.compare(String(password), String(user.passwordHash));
      if (!ok) {
        return res.status(401).json({ message: "Invalid credentials." });
      }

      return res.json(toPublicUser(user, cfg.role, cfg.idField));
    }
  );
});

// Self-serve signup is student-only.
app.post("/users", (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const rawStudentId = req.body.studentId;

  if (rawStudentId === undefined || rawStudentId === null || String(rawStudentId).trim() === "") {
    return res.status(400).json({ message: "Student ID is required" });
  }

  const studentId = Number(rawStudentId);
  if (!Number.isFinite(studentId)) {
    return res.status(400).json({ message: "Student ID must be a valid number" });
  }

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "First name, last name, email, and password are required" });
  }
  if (String(password).length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters." });
  }

  db.query(
    "SELECT * FROM student WHERE studentId = ?",
    [studentId],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          message: dbFriendlyMessage(err),
        });
      }

      if (result.length > 0) {
        const existing = result[0];
        return res.status(400).json({ message: "A student account with this ID already exists. Use Login instead." });
      }

      bcrypt.hash(String(password), PASSWORD_ROUNDS, (hashErr, passwordHash) => {
        if (hashErr) {
          console.error(hashErr);
          return res.status(500).json({ message: "Failed to hash password." });
        }
        const sql = `
          INSERT INTO student (studentId, firstName, lastName, email, passwordHash)
          VALUES (?, ?, ?, ?, ?)
        `;

        db.query(
          sql,
          [studentId, firstName, lastName, email, passwordHash],
          (insertErr) => {
            if (insertErr) {
              console.error(insertErr);
              return res.status(500).json({
                message: dbFriendlyMessage(insertErr),
              });
            }

            res.json({
              studentId,
              firstName,
              lastName,
              email,
              role: "student",
            });
          }
        );
      });
    }
  );
});


// ================= GET APPOINTMENTS =================
app.get("/appointments", (req, res) => {
  const sql = `
    SELECT 
      a.appointmentId,
      a.studentId,
      a.tutorId,
      a.courseNum,
      a.startDateTime,
      a.status,
      a.notes,
      a.location,
      a.mode,
      CONCAT(t.firstName, ' ', t.lastName) AS tutorName
    FROM appointment_info a
    JOIN tutor t ON a.tutorId = t.tutorId
    ORDER BY a.startDateTime ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: dbFriendlyMessage(err) });
    }
    res.json(results);
  });
});

// ================= AGGREGATE REPORTS =================
app.get("/reports/appointments-by-course", (req, res) => {
  const sql = `
    SELECT
      courseNum,
      COUNT(*) AS totalAppointments
    FROM appointment_info
    GROUP BY courseNum
    ORDER BY totalAppointments DESC, courseNum ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: dbFriendlyMessage(err) });
    }
    return res.json(results);
  });
});


// ================= CREATE APPOINTMENT =================
app.post("/appointments", (req, res) => {
  const {
    studentId,
    tutorId,
    courseNum,
    startDateTime,
    notes,
    location,
    mode,
  } = req.body;

  if (!studentId || !tutorId || !courseNum || !startDateTime) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // check conflict (same tutor + same time)
  db.query(
    "SELECT * FROM appointment_info WHERE tutorId = ? AND startDateTime = ? AND status != 'cancelled'",
    [tutorId, startDateTime],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send(err);
      }

      if (result.length > 0) {
        return res
          .status(400)
          .json({ message: "Tutor already booked at this time" });
      }

      // insert if no conflict
      db.query(
        `INSERT INTO appointment_info
        (studentId, tutorId, courseNum, startDateTime, lengthMinutes, location, status, notes, mode)
        VALUES (?, ?, ?, ?, 60, ?, 'scheduled', ?, ?)`,
        [
          Number(studentId),
          Number(tutorId),
          courseNum,
          startDateTime,
          location || "Online",
          notes || "",
          mode || "online",
        ],
        (err) => {
          if (err) {
            console.error(err);
            return res.status(500).send(err);
          }

          res.json({ success: true });
        }
      );
    }
  );
});

// ================= DELETE APPOINTMENT =================
app.delete("/appointments/:id", (req, res) => {
  db.query(
    "DELETE FROM appointment_info WHERE appointmentId = ?",
    [req.params.id],
    err => {
      if (err) return res.status(500).send(err);
      res.json({ success: true });
    }
  );
});


// ================= CANCEL APPOINTMENT =================
app.put("/appointments/:id/cancel", (req, res) => {
  db.query(
    "UPDATE appointment_info SET status = 'cancelled' WHERE appointmentId = ?",
    [req.params.id],
    err => {
      if (err) return res.status(500).send(err);
      res.json({ success: true });
    }
  );
});


// ================= UPDATE NOTES =================
app.put("/appointments/:id/notes", (req, res) => {
  const { notes } = req.body;

  db.query(
    "UPDATE appointment_info SET notes = ? WHERE appointmentId = ?",
    [notes, req.params.id],
    err => {
      if (err) return res.status(500).send(err);
      res.json({ success: true });
    }
  );
});


// ================= GET TUTORS =================
app.get("/tutors", (req, res) => {
  db.query(
    "SELECT tutorId, firstName, lastName, email, major, courseNum, CONCAT(firstName, ' ', lastName) AS name FROM tutor",
    (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: dbFriendlyMessage(err) });
    }
    res.json(results);
    }
  );
});


// API port (frontend dev `proxy` in package.json should match this default unless you override PORT).
const PORT = Number(process.env.PORT || 5001);

app.listen(PORT, "0.0.0.0", () =>
  console.log(`API listening on http://0.0.0.0:${PORT} (try http://127.0.0.1:${PORT}/tutors)`)
);