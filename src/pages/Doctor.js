import { useState, useContext, useEffect } from "react";
import { PatientContext } from "../context/PatientContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ThemeToggle from "../components/ThemeToggle";

export default function Doctor() {
  const { patients, addPatient, addPrescription } = useContext(PatientContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("dashboard");

  const [patientData, setPatientData] = useState({
    name: "",
    nationalId: "",
    phone: "",
    gender: "",
    age: "",
  });

  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [searchId, setSearchId] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  const [prescription, setPrescription] = useState({
    diagnosis: "",
    medication: "",
    comments: "",
  });

  /* ---------------- Navbar ---------------- */
  const navLinks = [
    { key: "dashboard", label: "Dashboard", icon: "📊" },
    { key: "add-patient", label: "Add Patient", icon: "➕" },
    { key: "search", label: "Search", icon: "🔍" },
    { key: "prescriptions", label: "Prescription", icon: "📝" },
  ];

  const resetPatientForm = () =>
    setPatientData({ name: "", nationalId: "", phone: "", gender: "", age: "" });

  const resetPrescriptionForm = () =>
    setPrescription({ diagnosis: "", medication: "", comments: "" });

  const isValidNationalId = (id) => /^\d{14}$/.test(id);

  useEffect(() => {
    setSearchResult(null);
    setSearchId("");
  }, [activeTab]);

  const handleAddPatient = () => {
    const { name, nationalId, age, gender } = patientData;

    if (!name.trim()) return alert("❌ Patient name required");
    if (!isValidNationalId(nationalId))
      return alert("❌ National ID must be 14 digits");
    if (!age || age < 1) return alert("❌ Valid age required");
    if (!gender) return alert("❌ Gender required");

    if (patients.some((p) => p.nationalId === nationalId))
      return alert("❌ Patient already exists");

    addPatient({
      ...patientData,
      prescriptions: [],
    });

    alert("✅ Patient added successfully");
    resetPatientForm();
    setActiveTab("dashboard");
  };

  const handleAddPrescription = () => {
    if (!selectedPatientId)
      return alert("❌ Please select a patient first");

    if (!prescription.diagnosis.trim())
      return alert("❌ Diagnosis required");

    if (!prescription.medication.trim())
      return alert("❌ Medication required");

    addPrescription(selectedPatientId, {
      ...prescription,
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      dispensed: false,
      uploads: [], // ملفات المريض
    });

    alert("✅ Prescription saved");
    resetPrescriptionForm();
    setSelectedPatientId("");
    setActiveTab("dashboard");
  };

  const handleSearch = () => {
    if (!isValidNationalId(searchId))
      return alert("❌ Enter a valid 14-digit National ID");

    const patient = patients.find((p) => p.nationalId === searchId.trim());

    if (!patient) {
      setSearchResult(null);
      return alert("❌ Patient not found");
    }

    setSearchResult(patient);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      navigate("/");
    }
  };

  return (
    <div className="container">

      {/* Navbar */}
      <Navbar
        title="👨‍⚕️ Doctor Dashboard"
        links={navLinks}
        active={activeTab}
        onChange={setActiveTab}
        onLogout={handleLogout}
        right={<ThemeToggle />}
      />

      {/* Dashboard */}
      {activeTab === "dashboard" && (
        <>
          <div className="card highlight">
            <h1>👥 {patients.length}</h1>
            <p>Total Patients</p>
          </div>

          <div className="card">
            <h3>Recent Patients</h3>
            {patients.length === 0 && <p>No patients yet</p>}
            {patients.slice(-5).reverse().map((p) => (
              <div key={p.nationalId} className="list-item">
                <strong>{p.name}</strong> – {p.nationalId}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add Patient */}
      {activeTab === "add-patient" && (
        <div className="card">
          <h3>Add New Patient</h3>

          <input
            placeholder="Full Name"
            value={patientData.name}
            onChange={(e) =>
              setPatientData({ ...patientData, name: e.target.value })
            }
          />

          <input
            placeholder="National ID (14 digits)"
            maxLength={14}
            value={patientData.nationalId}
            onChange={(e) =>
              setPatientData({ ...patientData, nationalId: e.target.value })
            }
          />

          <div className="grid">
            <input
              type="number"
              placeholder="Age"
              value={patientData.age}
              onChange={(e) =>
                setPatientData({ ...patientData, age: e.target.value })
              }
            />

            <select
              value={patientData.gender}
              onChange={(e) =>
                setPatientData({ ...patientData, gender: e.target.value })
              }
            >
              <option value="">Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <input
            placeholder="Phone (optional)"
            value={patientData.phone}
            onChange={(e) =>
              setPatientData({ ...patientData, phone: e.target.value })
            }
          />

          <button className="success" onClick={handleAddPatient}>
            Add Patient
          </button>
        </div>
      )}

      {/* Search */}
      {activeTab === "search" && (
        <>
          <div className="card">
            <input
              placeholder="Enter National ID"
              maxLength={14}
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button onClick={handleSearch}>Search</button>
          </div>

          {searchResult && (
            <div className="card">
              <h3>{searchResult.name}</h3>
              <p>ID: {searchResult.nationalId}</p>
              <p>Age: {searchResult.age}</p>
              <p>Gender: {searchResult.gender}</p>

              <button
                className="success"
                onClick={() => {
                  setSelectedPatientId(searchResult.nationalId);
                  setActiveTab("prescriptions");
                }}
              >
                Add Prescription
              </button>
            </div>
          )}
        </>
      )}

      {/* Prescriptions */}
      {activeTab === "prescriptions" && (
        <>
          <div className="card">
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
            >
              <option value="">Select Patient</option>
              {patients.map((p) => (
                <option key={p.nationalId} value={p.nationalId}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {selectedPatientId && (
            <div className="card">
              <input
                placeholder="Diagnosis"
                value={prescription.diagnosis}
                onChange={(e) =>
                  setPrescription({ ...prescription, diagnosis: e.target.value })
                }
              />

              <textarea
                placeholder="Medication"
                rows={4}
                value={prescription.medication}
                onChange={(e) =>
                  setPrescription({ ...prescription, medication: e.target.value })
                }
              />

              <textarea
                placeholder="Notes (optional)"
                rows={2}
                value={prescription.comments}
                onChange={(e) =>
                  setPrescription({ ...prescription, comments: e.target.value })
                }
              />

              <button className="primary" onClick={handleAddPrescription}>
                Save Prescription
              </button>
            </div>
          )}

          {/* عرض الملفات المرفوعة من المريض */}
          {patients.find((p) => p.nationalId === selectedPatientId)
            ?.prescriptions?.map((pr) =>
              pr.uploads?.length ? (
                <div className="card light" key={pr.id}>
                  <h4>📎 Patient Uploads</h4>

                  {pr.uploads.map((f, i) => (
                    <div key={i} style={{ marginBottom: "8px" }}>
                      📄 {f.name} — <small>{f.type}</small>{" "}
                      {f.type.startsWith("image") ? (
                        <img
                          src={f.data}
                          alt={f.name}
                          style={{ maxWidth: "200px", display: "block", marginTop: "5px" }}
                        />
                      ) : (
                        <a
                          href={f.data}
                          download={f.name}
                          style={{ marginLeft: "10px", color: "#4a90e2" }}
                        >
                          Download / View
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : null
            )}
        </>
      )}
    </div>
  );
}
