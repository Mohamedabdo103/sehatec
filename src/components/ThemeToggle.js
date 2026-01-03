import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    document.body.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      style={{
        background: "transparent",
        border: "1px solid var(--border)",
        padding: "8px 14px",
        borderRadius: "20px",
        color: "var(--text)"
      }}
    >
      {dark ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}
