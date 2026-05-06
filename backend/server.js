/**
 * Tutor Service — Express API (group project)
 * ------------------------------------------
 * What this file does:
 * - Loads MySQL config from `backend/.env` (see `.env.example` in this folder — copy to `.env`).
 * - Exposes REST routes for users (login/signup), appointments (CRUD-ish), tutors list, cancel/delete.
 * - Returns **JSON** with `{ message: "..." }` on errors so the React app can show friendly text.
 *
 * Ops notes we fixed during the project:
 * - Default **PORT 5001** (macOS often uses 5000 for AirPlay — avoids silent clashes).
 * - Listens on **0.0.0.0** so LAN devices can hit the API during demos.
 * - `dbFriendlyMessage` maps MySQL error codes to actionable hints for classmates grading the stack.
 */
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
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "tutorScheduler",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

function toPublicUser(row) {
  if (!row) return null;
  return {
    studentId: Number(row.studentId),
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    role: String(row.role || "").toLowerCase(),
  };
}

// Backward-safe migration for existing local DBs created before password auth.
// Some MySQL variants don't support `ADD COLUMN IF NOT EXISTS`, so we check first.
db.query("SHOW COLUMNS FROM users LIKE 'passwordHash'", (checkErr, rows) => {
  if (checkErr) {
    console.error("users.passwordHash check failed:", checkErr.message || checkErr);
    return;
  }

  if (Array.isArray(rows) && rows.length > 0) return;

  db.query("ALTER TABLE users ADD COLUMN passwordHash VARCHAR(255) NULL", (alterErr) => {
    if (alterErr) {
      console.error("users.passwordHash migration failed:", alterErr.message || alterErr);
    } else {
      console.log("Applied migration: users.passwordHash");
    }
  });
});


// ================= USERS (LOGIN SYSTEM) =================

// GET USER (legacy lookup for debug/admin; does NOT return passwordHash)
app.get("/users/:studentId", (req, res) => {
  const studentId = Number(req.params.studentId);

  const sql = "SELECT studentId, firstName, lastName, email, role FROM users WHERE studentId = ?";

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

    res.json(toPublicUser(result[0]));
  });
});

// AUTH LOGIN (studentId + role + password)
app.post("/auth/login", (req, res) => {
  const { studentId: rawStudentId, role: rawRole, password } = req.body || {};
  const studentId = Number(rawStudentId);
  const role = String(rawRole || "").toLowerCase().trim();

  if (!Number.isFinite(studentId) || !role || !password) {
    return res.status(400).json({ message: "Student ID, role, and password are required." });
  }

  db.query(
    "SELECT studentId, firstName, lastName, email, role, passwordHash FROM users WHERE studentId = ?",
    [studentId],
    async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: dbFriendlyMessage(err) });
      }
      if (result.length === 0) {
        return res.status(401).json({ message: "Invalid credentials." });
      }

      const user = result[0];
      if (String(user.role || "").toLowerCase() !== role) {
        return res.status(401).json({ message: "Invalid credentials." });
      }

      if (!user.passwordHash) {
        return res.status(400).json({
          message:
            "This account has no password yet. Please sign up again with a password to migrate it.",
        });
      }

      const ok = await bcrypt.compare(String(password), String(user.passwordHash));
      if (!ok) {
        return res.status(401).json({ message: "Invalid credentials." });
      }

      return res.json(toPublicUser(user));
    }
  );
});

// CREATE USER (SIGNUP)
app.post("/users", (req, res) => {
  const { firstName, lastName, email, role, password } = req.body;
  const rawStudentId = req.body.studentId;

  if (rawStudentId === undefined || rawStudentId === null || String(rawStudentId).trim() === "") {
    return res.status(400).json({ message: "Student ID is required" });
  }

  const studentId = Number(rawStudentId);
  if (!Number.isFinite(studentId)) {
    return res.status(400).json({ message: "Student ID must be a valid number" });
  }

  if (!firstName || !lastName || !email || !role || !password) {
    return res.status(400).json({ message: "First name, last name, email, role, and password are required" });
  }
  if (String(password).length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters." });
  }

  db.query(
    "SELECT * FROM users WHERE studentId = ?",
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
        if (existing.passwordHash) {
          return res.status(400).json({ message: "An account with this student ID already exists. Use Login instead." });
        }

        // Migration path: legacy rows created before passwords can be upgraded in-place.
        return bcrypt.hash(String(password), PASSWORD_ROUNDS, (rehashErr, migratedHash) => {
          if (rehashErr) {
            console.error(rehashErr);
            return res.status(500).json({ message: "Failed to hash password." });
          }

          db.query(
            `UPDATE users
             SET firstName = ?, lastName = ?, email = ?, role = ?, passwordHash = ?
             WHERE studentId = ?`,
            [firstName, lastName, email, String(role).toLowerCase(), migratedHash, studentId],
            (updateErr) => {
              if (updateErr) {
                console.error(updateErr);
                return res.status(500).json({ message: dbFriendlyMessage(updateErr) });
              }

              return res.json({
                studentId,
                firstName,
                lastName,
                email,
                role: String(role).toLowerCase(),
              });
            }
          );
        });
      }

      bcrypt.hash(String(password), PASSWORD_ROUNDS, (hashErr, passwordHash) => {
        if (hashErr) {
          console.error(hashErr);
          return res.status(500).json({ message: "Failed to hash password." });
        }
        const sql = `
          INSERT INTO users (studentId, firstName, lastName, email, role, passwordHash)
          VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(
          sql,
          [studentId, firstName, lastName, email, String(role).toLowerCase(), passwordHash],
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
              role: String(role).toLowerCase(),
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
      t.name AS tutorName
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

// ================= DELETE =================
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


// ================= CANCEL =================
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
  db.query("SELECT * FROM tutor", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: dbFriendlyMessage(err) });
    }
    res.json(results);
  });
});


// API port (frontend dev `proxy` in package.json should match this default unless you override PORT).
const PORT = Number(process.env.PORT || 5001);

app.listen(PORT, "0.0.0.0", () =>
  console.log(`API listening on http://0.0.0.0:${PORT} (try http://127.0.0.1:${PORT}/tutors)`)
);