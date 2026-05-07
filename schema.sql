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