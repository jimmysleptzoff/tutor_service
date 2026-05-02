CREATE DATABASE tutorScheduler;
USE tutorScheduler;

CREATE TABLE student (
  studentId INT PRIMARY KEY,
  firstName VARCHAR(50),
  lastName VARCHAR(50),
  email VARCHAR(100)
);

CREATE TABLE tutor (
  tutorId INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  subject VARCHAR(100),
  courseNum VARCHAR(20)
);

CREATE TABLE appointment_info (
  appointmentId INT AUTO_INCREMENT PRIMARY KEY,
  studentId INT,
  tutorId INT,
  courseNum VARCHAR(20),
  startDateTime DATETIME,
  lengthMinutes INT,
  location VARCHAR(100),
  status VARCHAR(20),
  notes TEXT
);