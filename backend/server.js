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

// ================= CREATE =================
app.post("/appointments", (req, res) => {
  const { studentId, tutorId, courseNum, startDateTime } = req.body;

  const sql = `
    INSERT INTO appointment_info
    (studentId, tutorId, courseNum, startDateTime, lengthMinutes, location, status)
    VALUES (?, ?, ?, ?, 60, 'Online', 'scheduled')
  `;

  db.query(sql, [studentId, tutorId, courseNum, startDateTime], err => {
    if (err) return res.status(500).send(err);
    res.json({ success: true });
  });
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

// ================= NOTES =================
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

app.listen(5000, () => console.log("Server running on port 5000"));