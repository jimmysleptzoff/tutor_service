CREATE DATABASE tutorScheduler;
USE tutorScheduler;

CREATE TABLE users (
  studentId INT PRIMARY KEY,
  firstName VARCHAR(50),
  lastName VARCHAR(50),
  email VARCHAR(100),
  role VARCHAR(20)
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
  lengthMinutes INT DEFAULT 60,
  location VARCHAR(100),
  mode VARCHAR(20),
  status VARCHAR(20) DEFAULT 'scheduled',
  notes TEXT
);

DELETE FROM tutor;

INSERT INTO tutor (name, subject, courseNum)
VALUES

-- CS COURSES
('Alex Carter', 'Computer Science', 'CS101'),
('Jordan Lee', 'Computer Science', 'CS101'),
('Emily Chen', 'Computer Science', 'CS201'),
('Ryan Park', 'Computer Science', 'CS201'),
('Kevin Tran', 'Computer Science', 'CS301'),

-- MATH COURSES
('Maya Patel', 'Mathematics', 'MATH155'),
('Sarah Kim', 'Mathematics', 'MATH155'),
('Daniel Garcia', 'Mathematics', 'MATH200'),
('Olivia Brown', 'Mathematics', 'MATH200'),
('Liam Wilson', 'Mathematics', 'MATH250'),

-- CHEMISTRY
('Sophia Nguyen', 'Chemistry', 'CHEM101'),
('Ethan Davis', 'Chemistry', 'CHEM101'),
('Noah Martinez', 'Chemistry', 'CHEM115'),

-- BIOLOGY
('Ava Thompson', 'Biology', 'BIO101'),
('Isabella Moore', 'Biology', 'BIO201'),

-- PHYSICS
('James Anderson', 'Physics', 'PHYS101'),
('Benjamin Clark', 'Physics', 'PHYS201'),

-- STATISTICS
('Lucas White', 'Statistics', 'STAT200'),
('Mia Harris', 'Statistics', 'STAT200'),

-- ENGINEERING
('Charlotte Lewis', 'Engineering', 'ENGR101');