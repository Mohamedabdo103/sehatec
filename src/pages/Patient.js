import { useState, useContext } from "react";
import { PatientContext } from "../context/PatientContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ThemeToggle from "../components/ThemeToggle";

export default function Patient({ nid }) {
  const { patients, addPrescription } = useContext(PatientContext);
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");

  const patient = patients.find(p => p.nationalId === nid);

  if (!patient) {
    return (
      <div className="container center">
        <div className="card">
          <h2>❌ Patient Not Found</h2>
          <p>Please contact your doctor to register you.</p>
          <button onClick={() => navigate("/")}>Back to Login</button>
        </div>
      </div>
    );
  }

  const prescriptions = patient.prescriptions || [];
  const latest = prescriptions[prescriptions.length - 1];

  /* -------- Upload Handler -------- */
  const uploadFile = (file, type, prescription) => {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const updated = {
        ...prescription,
        uploads: [
          ...(prescription.uploads || []),
          {
            name: file.name,
            type,
            data: reader.result,
            uploadedAt: new Date().toLocaleString(),
          },
        ],
      };

      addPrescription(patient.nationalId, updated);
    };

    reader.readAsDataURL(file);
  };

  /* -------- Navbar -------- */
  const navLinks = [
    { key: "overview", label: "Overview", icon: "📊" },
    { key: "prescriptions", label: "Prescriptions", icon: "💊" },
  ];

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      navigate("/");
    }
  };

  return (
    <div className="container">

      <Navbar
        title="🏥 Patient Portal"
        links={navLinks}
        active={tab}
        onChange={setTab}
        onLogout={handleLogout}
        right={<ThemeToggle />}
      />

      {/* ================= OVERVIEW ================= */}
      {tab === "overview" && (
        <>
          <div className="card">
            <h3>👤 My Info</h3>
            <p><b>Name:</b> {patient.name}</p>
            <p><b>ID:</b> {patient.nationalId}</p>
            <p><b>Age:</b> {patient.age}</p>
            <p><b>Gender:</b> {patient.gender}</p>
            <p><b>Phone:</b> {patient.phone || "—"}</p>
          </div>

          <div className="card center">
            <h1>💊 {prescriptions.length}</h1>
            <p>Total Prescriptions</p>
          </div>

          {latest && (
            <div className="card">
              <h3>🆕 Latest Prescription</h3>
              <p><b>Diagnosis:</b> {latest.diagnosis}</p>
              <pre>{latest.medication}</pre>

              <span className={latest.dispensed ? "badge green" : "badge orange"}>
                {latest.dispensed ? "✅ Dispensed" : "⏳ Pending"}
              </span>

              <button onClick={() => setTab("prescriptions")}>
                View All →
              </button>
            </div>
          )}
        </>
      )}

      {/* ================= PRESCRIPTIONS ================= */}
      {tab === "prescriptions" && (
        <div className="card">
          <h3>💊 Prescriptions History</h3>

          {prescriptions.length ? (
            prescriptions.map((p, i) => (
              <div key={p.id || i} className="card light">
                <div className="row">
                  <h4>Prescription #{i + 1}</h4>
                  <span className={p.dispensed ? "badge green" : "badge orange"}>
                    {p.dispensed ? "Dispensed" : "Pending"}
                  </span>
                </div>

                <p><b>Diagnosis:</b></p>
                <div>{p.diagnosis}</div>

                <p><b>Medication:</b></p>
                <pre>{p.medication}</pre>

                {/* -------- Upload Section -------- */}
                <div className="card">
                  <h4>📤 Upload Analysis / X-Ray</h4>

                  <input
                    type="file"
                    accept=".pdf,.jpg,.png"
                    onChange={(e) =>
                      uploadFile(e.target.files[0], "medical", p)
                    }
                  />

                  {p.uploads?.length > 0 && (
                    <div style={{ marginTop: "10px" }}>
                      <h5>📎 Uploaded Files</h5>
                      {p.uploads.map((f, idx) => (
                        <div key={idx}>
                          📄 {f.name}
                          <small> — {f.uploadedAt}</small>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {p.comments && (
                  <>
                    <p><b>Doctor Notes:</b></p>
                    <div>{p.comments}</div>
                  </>
                )}

                {p.dispensed && (
                  <div className="success">
                    <p><b>Date:</b> {p.dispensedDate}</p>
                    <p><b>Notes:</b> {p.pharmacistNotes}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="center">No prescriptions yet 💊</p>
          )}
        </div>
      )}
    </div>
  );
}
