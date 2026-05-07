CREATE DATABASE IF NOT EXISTS tutorScheduler;
USE tutorScheduler;

CREATE TABLE IF NOT EXISTS student (
  studentId INT NOT NULL,
  firstName VARCHAR(50) NOT NULL,
  lastName VARCHAR(50) NOT NULL,
  username VARCHAR(50) DEFAULT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  passwordHash VARCHAR(255) NOT NULL,
  PRIMARY KEY (studentId)
);

CREATE TABLE IF NOT EXISTS course (
  courseNum VARCHAR(20) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  level INT NOT NULL DEFAULT 100,
  professorName VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (courseNum)
);

CREATE TABLE IF NOT EXISTS tutor (
  tutorId INT NOT NULL,
  firstName VARCHAR(50) NOT NULL,
  lastName VARCHAR(50) NOT NULL,
  username VARCHAR(50) DEFAULT NULL UNIQUE,
  email VARCHAR(100) DEFAULT NULL,
  major VARCHAR(100) DEFAULT NULL,
  passwordHash VARCHAR(255) NOT NULL,
  courseNum VARCHAR(20) NOT NULL,
  PRIMARY KEY (tutorId),
  INDEX (courseNum),
  FOREIGN KEY (courseNum) REFERENCES course(courseNum)
);

CREATE TABLE IF NOT EXISTS admin (
  adminId INT NOT NULL,
  firstName VARCHAR(50) NOT NULL,
  lastName VARCHAR(50) NOT NULL,
  username VARCHAR(50) DEFAULT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  passwordHash VARCHAR(255) NOT NULL,
  PRIMARY KEY (adminId)
);

CREATE TABLE IF NOT EXISTS notes (
  noteId INT NOT NULL AUTO_INCREMENT,
  topics TEXT NOT NULL,
  recommendations TEXT,
  PRIMARY KEY (noteId)
);

CREATE TABLE IF NOT EXISTS appointment_info (
  appointmentId INT NOT NULL AUTO_INCREMENT,
  studentId INT NOT NULL,
  tutorId INT NOT NULL,
  courseNum VARCHAR(20) NOT NULL,
  startDateTime DATETIME NOT NULL,
  lengthMinutes INT NOT NULL DEFAULT 60,
  location VARCHAR(100) DEFAULT 'Online',
  mode ENUM('online', 'in_person') NOT NULL DEFAULT 'online',
  status ENUM('scheduled', 'cancelled') NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  noteId INT DEFAULT NULL,
  PRIMARY KEY (appointmentId),
  INDEX (tutorId, startDateTime),
  FOREIGN KEY (studentId) REFERENCES student(studentId),
  FOREIGN KEY (tutorId) REFERENCES tutor(tutorId),
  FOREIGN KEY (courseNum) REFERENCES course(courseNum),
  FOREIGN KEY (noteId) REFERENCES notes(noteId)
);

DELETE FROM course;
INSERT INTO course (courseNum, subject, level, professorName) VALUES
('CS101', 'Computer Science', 100, 'Dr. Adams'),
('CS201', 'Computer Science', 200, 'Dr. Brooks'),
('CS301', 'Computer Science', 300, 'Dr. Carter'),
('MATH155', 'Mathematics', 100, 'Dr. Patel'),
('MATH200', 'Mathematics', 200, 'Dr. Garcia'),
('MATH250', 'Mathematics', 200, 'Dr. Wilson'),
('CHEM101', 'Chemistry', 100, 'Dr. Nguyen'),
('CHEM115', 'Chemistry', 100, 'Dr. Davis'),
('BIO101', 'Biology', 100, 'Dr. Thompson'),
('BIO201', 'Biology', 200, 'Dr. Moore'),
('PHYS101', 'Physics', 100, 'Dr. Anderson'),
('PHYS201', 'Physics', 200, 'Dr. Clark'),
('STAT200', 'Statistics', 200, 'Dr. White'),
('ENGR101', 'Engineering', 100, 'Dr. Lewis');

DELETE FROM tutor;
INSERT INTO tutor (tutorId, firstName, lastName, email, major, passwordHash, courseNum) VALUES
(1001, 'Alex', 'Carter', 'alex.carter@school.edu', 'Computer Science', '$2b$10$Skgv557oH6pG3x1xLDzE4.2oi3y2TxyI8RnyPg0kYAhQ/.HHHLD02', 'CS101'),
(1002, 'Jordan', 'Lee', 'jordan.lee@school.edu', 'Computer Science', '$2b$10$Skgv557oH6pG3x1xLDzE4.2oi3y2TxyI8RnyPg0kYAhQ/.HHHLD02', 'CS101'),
(1003, 'Emily', 'Chen', 'emily.chen@school.edu', 'Computer Science', '$2b$10$Skgv557oH6pG3x1xLDzE4.2oi3y2TxyI8RnyPg0kYAhQ/.HHHLD02', 'CS201'),
(1004, 'Ryan', 'Park', 'ryan.park@school.edu', 'Computer Science', '$2b$10$Skgv557oH6pG3x1xLDzE4.2oi3y2TxyI8RnyPg0kYAhQ/.HHHLD02', 'CS201'),
(1005, 'Kevin', 'Tran', 'kevin.tran@school.edu', 'Computer Science', '$2b$10$Skgv557oH6pG3x1xLDzE4.2oi3y2TxyI8RnyPg0kYAhQ/.HHHLD02', 'CS301'),
(1006, 'Maya', 'Patel', 'maya.patel@school.edu', 'Mathematics', '$2b$10$Skgv557oH6pG3x1xLDzE4.2oi3y2TxyI8RnyPg0kYAhQ/.HHHLD02', 'MATH155'),
(1007, 'Sarah', 'Kim', 'sarah.kim@school.edu', 'Mathematics', '$2b$10$Skgv557oH6pG3x1xLDzE4.2oi3y2TxyI8RnyPg0kYAhQ/.HHHLD02', 'MATH155'),
(1008, 'Daniel', 'Garcia', 'daniel.garcia@school.edu', 'Mathematics', '$2b$10$Skgv557oH6pG3x1xLDzE4.2oi3y2TxyI8RnyPg0kYAhQ/.HHHLD02', 'MATH200'),
(1009, 'Olivia', 'Brown', 'olivia.brown@school.edu', 'Mathematics', '$2b$10$Skgv557oH6pG3x1xLDzE4.2oi3y2TxyI8RnyPg0kYAhQ/.HHHLD02', 'MATH200'),
(1010, 'Liam', 'Wilson', 'liam.wilson@school.edu', 'Mathematics', '$2b$10$Skgv557oH6pG3x1xLDzE4.2oi3y2TxyI8RnyPg0kYAhQ/.HHHLD02', 'MATH250'),
(1011, 'Sophia', 'Nguyen', 'sophia.nguyen@school.edu', 'Chemistry', '$2b$10$Skgv557oH6pG3x1xLDzE4.2oi3y2TxyI8RnyPg0kYAhQ/.HHHLD02', 'CHEM101'),
(1012, 'Ethan', 'Davis', 'ethan.davis@school.edu', 'Chemistry', '$2b$10$Skgv557oH6pG3x1xLDzE4.2oi3y2TxyI8RnyPg0kYAhQ/.HHHLD02', 'CHEM101'),
(1013, 'Noah', 'Martinez', 'noah.martinez@school.edu', 'Chemistry', '$2b$10$Skgv557oH6pG3x1xLDzE4.2oi3y2TxyI8RnyPg0kYAhQ/.HHHLD02', 'CHEM115'),
(1014, 'Ava', 'Thompson', 'ava.thompson@school.edu', 'Biology', '$2b$10$Skgv557oH6pG3x1xLDzE4.2oi3y2TxyI8RnyPg0kYAhQ/.HHHLD02', 'BIO101'),
(1015, 'Isabella', 'Moore', 'isabella.moore@school.edu', 'Biology', '$2b$10$Skgv557oH6pG3x1xLDzE4.2oi3y2TxyI8RnyPg0kYAhQ/.HHHLD02', 'BIO201'),
(1016, 'James', 'Anderson', 'james.anderson@school.edu', 'Physics', '$2b$10$Skgv557oH6pG3x1xLDzE4.2oi3y2TxyI8RnyPg0kYAhQ/.HHHLD02', 'PHYS101'),
(1017, 'Benjamin', 'Clark', 'benjamin.clark@school.edu', 'Physics', '$2b$10$Skgv557oH6pG3x1xLDzE4.2oi3y2TxyI8RnyPg0kYAhQ/.HHHLD02', 'PHYS201'),
(1018, 'Lucas', 'White', 'lucas.white@school.edu', 'Statistics', '$2b$10$Skgv557oH6pG3x1xLDzE4.2oi3y2TxyI8RnyPg0kYAhQ/.HHHLD02', 'STAT200'),
(1019, 'Mia', 'Harris', 'mia.harris@school.edu', 'Statistics', '$2b$10$Skgv557oH6pG3x1xLDzE4.2oi3y2TxyI8RnyPg0kYAhQ/.HHHLD02', 'STAT200'),
(1020, 'Charlotte', 'Lewis', 'charlotte.lewis@school.edu', 'Engineering', '$2b$10$Skgv557oH6pG3x1xLDzE4.2oi3y2TxyI8RnyPg0kYAhQ/.HHHLD02', 'ENGR101');

DELETE FROM admin;
INSERT INTO admin (adminId, firstName, lastName, username, email, passwordHash) VALUES
(9001, 'Admin', 'User', 'admin', 'admin@school.edu', '$2b$10$Ya/otcpOWsrjtYpgxtypGeiMrddMjijj0nYx1D0XU5Iw3mCbWh5jC');