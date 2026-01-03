import ThemeToggle from "./ThemeToggle";

export default function Navbar({ title, links, active, onChange, onLogout }) {
  return (
    <div className="navbar">
      <h2>{title}</h2>

      <div className="nav-links">
        {links.map(link => (
          <button
            key={link.key}
            className={`nav-btn ${active === link.key ? "active" : ""}`}
            onClick={() => onChange(link.key)}
          >
            {link.icon} {link.label}
          </button>
        ))}
      </div>

      <div className="nav-actions">
        <ThemeToggle />
        <button className="logout" onClick={onLogout}>🚪 Logout</button>
      </div>
    </div>
  );
}
