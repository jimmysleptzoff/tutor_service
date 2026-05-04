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

const app = express();
app.use(cors());
app.use(express.json());

/** Human-readable DB errors for the API (MySQL often returns ECONNREFUSED when the server is off). */
function dbFriendlyMessage(err) {
  if (!err) return "Database error";
  const e = Array.isArray(err.errors) && err.errors[0] ? err.errors[0] : err;
  const code = e.code || err.code;
  if (code === "ECONNREFUSED") {
    return "Cannot connect to MySQL. Start MySQL (default port 3306), then try again.";
  }
  if (code === "ER_ACCESS_DENIED_ERROR") {
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


// ================= USERS (LOGIN SYSTEM) =================

// GET USER (LOGIN)
app.get("/users/:studentId", (req, res) => {
  const studentId = Number(req.params.studentId);

  const sql = "SELECT * FROM users WHERE studentId = ?";

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
          message: dbFriendlyMessage(err),
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
              message: dbFriendlyMessage(insertErr),
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