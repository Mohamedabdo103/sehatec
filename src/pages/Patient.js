import { useState, useContext } from "react";
import { PatientContext } from "../context/PatientContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ThemeToggle from "../components/ThemeToggle";

// Get FREE API Key from: https://aistudio.google.com/app/apikey
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

export default function Patient({ nid }) {
  const { patients, addPrescription } = useContext(PatientContext);
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [chatMessages, setChatMessages] = useState([
    { role: "model", text: "Hello! I'm your AI medical assistant. I can help you understand your prescriptions and answer health questions. How can I help you today?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  /* -------- FREE Gemini AI Chat Handler -------- */
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg = { role: "user", text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsLoading(true);

    try {
      // Prepare medical context
      let medicalContext = `Patient Information:
Name: ${patient.name}
Age: ${patient.age}
Gender: ${patient.gender}

Medical History:
`;

      if (prescriptions.length > 0) {
        prescriptions.forEach((p, i) => {
          medicalContext += `
Prescription ${i + 1}:
- Diagnosis: ${p.diagnosis}
- Medication: ${p.medication}
- Status: ${p.dispensed ? "Dispensed" : "Pending"}
${p.comments ? `- Doctor's Notes: ${p.comments}` : ""}
`;
        });
      } else {
        medicalContext += "No prescriptions yet.";
      }

      // Build conversation context with all messages
      const systemPrompt = `You are a helpful medical assistant chatbot helping patients understand their prescriptions.

${medicalContext}

Important guidelines:
- Provide clear, simple explanations
- Always remind patients to consult their doctor for medical decisions
- Be empathetic and supportive
- Reference their specific prescriptions when relevant
- Don't provide new medical advice, only explain existing prescriptions`;

      // Prepare conversation history
      const contents = chatMessages.map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      }));
      
      // Add current user message
      contents.push({
        role: "user",
        parts: [{ text: chatInput }]
      });

      // Call FREE Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: contents,
            systemInstruction: {
              parts: [{ text: systemPrompt }]
            }
          })
        }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      const aiResponse = data.candidates[0].content.parts[0].text;

      setChatMessages(prev => [...prev, { 
        role: "model", 
        text: aiResponse 
      }]);

    } catch (error) {
      console.error("Gemini API Error:", error);
      
      setChatMessages(prev => [...prev, { 
        role: "model", 
        text: `I apologize, but I'm having trouble right now. ${error.message.includes("API_KEY") ? "Please check your API key at the top of Patient.js file." : "Please try again later."}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

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
    { key: "chatbot", label: "AI Assistant", icon: "🤖" },
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

      {/* ================= FREE AI CHATBOT (Gemini) ================= */}
      {tab === "chatbot" && (
        <div className="card">
          <h3>🤖 AI Medical Assistant (FREE - Powered by Gemini)</h3>
          <p style={{ color: "#666", marginBottom: "20px" }}>
            Ask me about your medications, prescriptions, or general health questions
          </p>

          {/* Chat Messages */}
          <div style={{
            height: "400px",
            overflowY: "auto",
            padding: "15px",
            backgroundColor: "#f9f9f9",
            borderRadius: "8px",
            marginBottom: "15px",
            border: "1px solid #ddd"
          }}>
            {chatMessages.map((msg, i) => (
              <div key={i} style={{
                marginBottom: "15px",
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start"
              }}>
                <div style={{
                  maxWidth: "70%",
                  padding: "10px 15px",
                  borderRadius: "10px",
                  backgroundColor: msg.role === "user" ? "#4a90e2" : "#fff",
                  color: msg.role === "user" ? "white" : "#333",
                  border: msg.role === "model" ? "1px solid #ddd" : "none",
                  whiteSpace: "pre-line"
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{
                  padding: "10px 15px",
                  borderRadius: "10px",
                  backgroundColor: "#fff",
                  border: "1px solid #ddd"
                }}>
                  <span>Thinking...</span> 💭
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              placeholder="Ask me anything about your health..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSendMessage()}
              disabled={isLoading}
              style={{ flex: 1, padding: "10px" }}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading}
              style={{
                padding: "10px 30px",
                backgroundColor: isLoading ? "#ccc" : "#4a90e2",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: isLoading ? "not-allowed" : "pointer",
                fontWeight: "bold"
              }}
            >
              {isLoading ? "⏳" : "Send 📤"}
            </button>
          </div>
          
          {/* API Key Notice */}
          {!GEMINI_API_KEY || GEMINI_API_KEY === "AIzaSyBTymrQxXORk83EaUR4wXgwM3CVFRMWWlQ" ? (
            <div style={{ 
              marginTop: "15px", 
              padding: "10px", 
              backgroundColor: "#ffe4e1", 
              borderRadius: "5px", 
              border: "1px solid #ff6b6b" 
            }}>
              <p style={{ margin: 0, fontSize: "14px", color: "#d63031" }}>
                ⚠️ <strong>Setup Required:</strong> Get your FREE API key from{" "}
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">
                  Google AI Studio
                </a>{" "}
                and add it to the top of Patient.js file.
              </p>
            </div>
          ) : null}

          {/* Disclaimer */}
          <div style={{ 
            marginTop: "15px", 
            padding: "10px", 
            backgroundColor: "#fff3cd", 
            borderRadius: "5px", 
            border: "1px solid #ffc107" 
          }}>
            <p style={{ margin: 0, fontSize: "14px", color: "#856404" }}>
              ⚠️ <strong>Disclaimer:</strong> This AI provides general information only. Always consult your doctor for medical advice.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}