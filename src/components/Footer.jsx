// src/components/Footer.jsx
function Footer() {
  return (
    <footer style={{
      padding: "2rem",
      textAlign: "center",
      color: "#6b7280",
      fontSize: "0.875rem",
      borderTop: "1px solid #e5e7eb",
      background: "white",
      marginTop: "auto"
    }}>
      <p style={{ margin: 0 }}>
        Built with <span style={{ color: "#6366f1", fontWeight: 600 }}>eCard</span>
        {" • "}
        Share your professional identity
      </p>
      <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.8rem", opacity: 0.7 }}>
        © {new Date().getFullYear()} eCard. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;
