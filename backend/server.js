const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "tutorScheduler",
});

db.connect(err => {
  if (err) console.error(err);
  else console.log("MySQL connected");
});


// ================= USERS (LOGIN SYSTEM) =================

// GET USER (LOGIN)
app.get("/users/:studentId", (req, res) => {
  const studentId = Number(req.params.studentId);

  const sql = "SELECT * FROM users WHERE studentId = ?";

  db.query(sql, [studentId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        message: err.sqlMessage || err.message || "Database error",
      });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result[0]);
  });
});

// CREATE USER (SIGNUP)
app.post("/users", (req, res) => {
  const { firstName, lastName, email, role } = req.body;
  const rawStudentId = req.body.studentId;

  if (rawStudentId === undefined || rawStudentId === null || String(rawStudentId).trim() === "") {
    return res.status(400).json({ message: "Student ID is required" });
  }

  const studentId = Number(rawStudentId);
  if (!Number.isFinite(studentId)) {
    return res.status(400).json({ message: "Student ID must be a valid number" });
  }

  if (!firstName || !lastName || !email || !role) {
    return res.status(400).json({ message: "First name, last name, email, and role are required" });
  }

  db.query(
    "SELECT * FROM users WHERE studentId = ?",
    [studentId],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          message: err.sqlMessage || err.message || "Database error while checking user",
        });
      }

      if (result.length > 0) {
        return res.status(400).json({ message: "An account with this student ID already exists. Use Login instead." });
      }

      const sql = `
        INSERT INTO users (studentId, firstName, lastName, email, role)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.query(
        sql,
        [studentId, firstName, lastName, email, role],
        (insertErr) => {
          if (insertErr) {
            console.error(insertErr);
            return res.status(500).json({
              message:
                insertErr.sqlMessage ||
                insertErr.message ||
                "Could not create account (check database connection and users table)",
            });
          }

          res.json({
            studentId,
            firstName,
            lastName,
            email,
            role,
          });
        }
      );
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
    if (err) return res.status(500).send(err);
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
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});


app.listen(5000, "0.0.0.0", () =>
  console.log("API listening on http://0.0.0.0:5000 (try http://127.0.0.1:5000/tutors)")
);