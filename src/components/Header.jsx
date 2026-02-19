// src/components/Header.jsx
function Header() {
  return (
    <header style={{
      padding: "1rem 2rem",
      background: "white",
      borderBottom: "1px solid #e5e7eb",
      position: "sticky",
      top: 0,
      zIndex: 50,
    }}>
      <div style={{ 
        maxWidth: "1200px", 
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        {/* Logo */}
        <a 
          href="/" 
          style={{ 
            fontSize: "1.5rem", 
            fontWeight: 700, 
            textDecoration: "none",
            color: "#111827",
            display: "flex",
            alignItems: "center",
            gap: "0.25rem"
          }}
        >
          <span style={{ color: "#6366f1" }}>e</span>Card
        </a>

        {/* CTA Button */}
        <a 
          href="/" 
          style={{
            padding: "0.5rem 1.25rem",
            background: "#6366f1",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: 600,
            fontSize: "0.875rem",
            transition: "background 0.2s",
            display: "inline-block"
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#4f46e5"}
          onMouseLeave={(e) => e.currentTarget.style.background = "#6366f1"}
        >
          Create Your Card
        </a>
      </div>
    </header>
  );
}

export default Header;
