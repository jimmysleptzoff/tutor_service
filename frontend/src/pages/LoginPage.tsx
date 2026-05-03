import { useState } from "react";

export default function LoginPage({ setUser }: any) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [role, setRole] = useState("student");

  const [studentId, setStudentId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    const res = await fetch(
      `http://localhost:5000/users/${studentId}`
    );

    if (!res.ok) {
      setError("User not found. Please sign up.");
      return;
    }

    const data = await res.json();

    if (data.role !== role) {
      setError("Role mismatch.");
      return;
    }

    setUser(data);
  };

  const handleSignup = async () => {
    setError("");

    const res = await fetch("http://localhost:5000/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        studentId,
        firstName,
        lastName,
        email,
        role,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Signup failed");
      return;
    }

    setUser(data);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>{mode === "login" ? "Login" : "Sign Up"}</h2>

        {/* MODE SWITCH */}
        <div style={styles.toggle}>
          <button onClick={() => setMode("login")}>Login</button>
          <button onClick={() => setMode("signup")}>Sign Up</button>
        </div>

        <select
          style={styles.input}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="student">Student</option>
          <option value="tutor">Tutor</option>
          <option value="admin">Admin</option>
        </select>

        <input
          style={styles.input}
          placeholder="Student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />

        {mode === "signup" && (
          <>
            <input
              style={styles.input}
              placeholder="First Name"
              onChange={(e) => setFirstName(e.target.value)}
            />
            <input
              style={styles.input}
              placeholder="Last Name"
              onChange={(e) => setLastName(e.target.value)}
            />
            <input
              style={styles.input}
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </>
        )}

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button
          style={styles.button}
          onClick={mode === "login" ? handleLogin : handleSignup}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

const styles: any = {
  container: {
    display: "flex",
    justifyContent: "center",
    marginTop: "100px",
  },
  card: {
    width: "300px",
    background: "#1e293b",
    padding: "20px",
    borderRadius: "10px",
  },
  input: {
    width: "100%",
    marginBottom: "10px",
    padding: "10px",
    background: "#020617",
    color: "white",
    border: "1px solid #334155",
    borderRadius: "6px",
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "#3b82f6",
    border: "none",
    borderRadius: "6px",
    color: "white",
  },
  toggle: {
    display: "flex",
    gap: "10px",
    marginBottom: "10px",
  },
};