CREATE DATABASE IF NOT EXISTS tutorScheduler;
USE tutorScheduler;

CREATE TABLE student (
    studentId INT NOT NULL UNIQUE,
    firstName VARCHAR(20) NOT NULL,
    lastName VARCHAR(20) NOT NULL,
    username VARCHAR(15) NOT NULL UNIQUE,
    email VARCHAR(50) NOT NULL UNIQUE,
    PRIMARY KEY (studentId)
);

CREATE TABLE tutor (
    tutorId INT NOT NULL UNIQUE,
    firstName VARCHAR(20) NOT NULL,
    lastName VARCHAR(20) NOT NULL,
    username VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(50) NOT NULL UNIQUE,
    major VARCHAR(20) NOT NULL,
    PRIMARY KEY (tutorId)
);

CREATE TABLE course (
    courseNum VARCHAR(15) NOT NULL UNIQUE,
    subject VARCHAR(15) NOT NULL,
    level INT NOT NULL,
    professorName VARCHAR(20) NOT NULL,
    PRIMARY KEY (courseNum)
);

CREATE TABLE appointment_info (
    appointmentId INT NOT NULL UNIQUE,
    studentId INT NOT NULL,
    tutorId INT NOT NULL,
    courseNum VARCHAR(15) NOT NULL,
    startDateTime DATETIME NOT NULL,
    lengthMinutes INT NOT NULL,
    location VARCHAR(50) NOT NULL,
    notes TEXT,
    PRIMARY KEY (appointmentId),
    FOREIGN KEY (studentId) REFERENCES student(studentId),
    FOREIGN KEY (tutorId) REFERENCES tutor(tutorId),
    FOREIGN KEY (courseNum) REFERENCES course(courseNum)
);

CREATE TABLE notes (
    noteId INT NOT NULL UNIQUE,
    topics TEXT NOT NULL,
    recommendations TEXT,
    PRIMARY KEY (noteId)
);