import { useState } from "react";

export default function PatientChatbot({ patient }) {
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: `👋 Hi ${patient.name}!  
I can help you understand your prescriptions, medications, and status.`,
    },
  ]);

  const [input, setInput] = useState("");

  const prescriptions = patient.prescriptions || [];

  /* -------- Simple Brain -------- */
  const getBotReply = (question) => {
    const q = question.toLowerCase();

    if (!prescriptions.length) {
      return "❌ You don't have any prescriptions yet.";
    }

    const latest = prescriptions[prescriptions.length - 1];

    if (q.includes("latest") || q.includes("last")) {
      return `
🆕 Latest Prescription:
Diagnosis: ${latest.diagnosis}
Medication: ${latest.medication}
Status: ${latest.dispensed ? "Dispensed ✅" : "Pending ⏳"}
`;
    }

    if (q.includes("medicine") || q.includes("medication")) {
      return `💊 Your medication:\n${latest.medication}`;
    }

    if (q.includes("diagnosis")) {
      return `📝 Diagnosis: ${latest.diagnosis}`;
    }

    if (q.includes("status")) {
      return latest.dispensed
        ? "✅ Your prescription has been dispensed."
        : "⏳ Your prescription is still pending.";
    }

    if (q.includes("how many")) {
      return `📊 You have ${prescriptions.length} prescription(s).`;
    }

    return "🤖 Sorry, I didn't understand. You can ask about diagnosis, medication, or status.";
  };

  /* -------- Send -------- */
  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg = { from: "user", text: input };
    const botMsg = { from: "bot", text: getBotReply(input) };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  return (
    <div className="card chatbot">
      <h3>🤖 Health Assistant</h3>

      <div className="chat-box">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`chat-msg ${m.from === "user" ? "user" : "bot"}`}
          >
            {m.text}
          </div>
        ))}
      </div>

      <div className="row">
        <input
          placeholder="Ask about your prescription..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
