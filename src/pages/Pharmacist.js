import { useState, useContext } from "react";
import { PatientContext } from "../context/PatientContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ThemeToggle from "../components/ThemeToggle";

export default function Pharmacist() {
  const { patients, addPrescription } = useContext(PatientContext);
  const navigate = useNavigate();

  const [nid, setNid] = useState("");
  const [patient, setPatient] = useState(null);
  const [index, setIndex] = useState(null);
  const [notes, setNotes] = useState("");

  const validNID = (id) => /^\d{14}$/.test(id);

  const search = () => {
    if (!validNID(nid)) return alert("❌ Invalid National ID");

    const p = patients.find((x) => x.nationalId === nid);
    if (!p || !p.prescriptions?.length)
      return alert("❌ No prescriptions found");

    setPatient(p);
    setIndex(p.prescriptions.length - 1);
  };

  const dispense = () => {
    const pr = patient.prescriptions[index];
    if (pr.dispensed && !window.confirm("Already dispensed. Continue?")) return;

    addPrescription(patient.nationalId, {
      ...pr,
      dispensed: true,
      dispensedDate: new Date().toLocaleString(),
      pharmacistNotes: notes || "No notes",
    });

    alert("✅ Dispensed");
    setNotes("");
  };

  /* -------- Navbar -------- */

  const navLinks = [
    { key: "search", label: "Search Only", icon: "🔍" },
  ]; 

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      navigate("/");
    }
  };

  return (
    <div className="container">

      {/* Navbar */}
      <Navbar
        title="💊 Pharmacist"
        links={navLinks}
        active="search"
        onChange={() => {}}
        onLogout={handleLogout}
        right={<ThemeToggle />}
      />

      {/* Search */}
      <div className="card">
        <input
          placeholder="National ID"
          maxLength={14}
          value={nid}
          onChange={(e) => setNid(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
        />
        <button onClick={search}>Search</button>
      </div>

      {/* Patient */}
      {patient && (
        <>
          <div className="card">
            <h3>{patient.name}</h3>
            <p>{patient.nationalId}</p>

            <select
              value={index}
              onChange={(e) => setIndex(Number(e.target.value))}
            >
              {patient.prescriptions.map((p, i) => (
                <option key={i} value={i}>
                  #{i + 1} {p.dispensed ? "✅" : "⏳"}
                </option>
              ))}
            </select>
          </div>

          {index !== null && (
            <div className="card">
              <p>
                <strong>Diagnosis:</strong>{" "}
                {patient.prescriptions[index].diagnosis}
              </p>
              <pre>{patient.prescriptions[index].medication}</pre>

              <textarea
                placeholder="Pharmacist notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              <button className="primary" onClick={dispense}>
                {patient.prescriptions[index].dispensed
                  ? "Mark Again"
                  : "Confirm Dispense"}
              </button>
            </div>
          )}
        </>
      )}

      {!patient && (
        <div className="card center">
          🔍 Search for patient prescriptions
        </div>
      )}
    </div>
  );
}
