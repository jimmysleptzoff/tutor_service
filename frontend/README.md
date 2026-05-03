## Setup

### 1. Database

Run:
database.sql

Make sure your database name matches:
tutorScheduler

---

### 2. Backend

Update your database credentials in:
server.js

Then run:
node server.js

Server runs on:
http://localhost:5000

---
### 3. Frontend

In the frontend directory:

npm install
npm start

App runs on:
http://localhost:3000

---

## Usage

### Student
- Log in with student ID
- Book tutoring sessions
- Add notes, location, and mode
- Cancel sessions

### Tutor
- View assigned sessions
- Cancel sessions

### Admin
- View all appointments
- Search and filter sessions
- Cancel or delete sessions

---

## Project Structure

/frontend
/src
/pages
App.tsx

/backend
server.js
database.sql

---

## Notes

- No password authentication (ID-based login only)
- Built for demonstration purposes