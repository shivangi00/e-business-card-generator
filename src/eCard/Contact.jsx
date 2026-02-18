// src/eCard/Contact.jsx
function Contact({ profile, onShare }) {
  return (
    <div style={{
      marginTop: "auto",
      paddingTop: 10,
      borderTop: "1px solid rgba(128,128,128,0.18)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-around",
    }}>
      {profile.socials.slice(0, 4).map((social) => (
        <a
          key={social.id}
          href={social.href}
          target="_blank"
          rel="noreferrer"
          title={social.id}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32, height: 32,
            borderRadius: 8,
            color: "inherit",
            opacity: 0.5,
            textDecoration: "none",
            transition: "opacity 0.15s, background 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.background = "rgba(128,128,128,0.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = "0.5"; e.currentTarget.style.background = "transparent"; }}
        >
          <i className={social.iconClass} style={{ fontSize: "1rem" }} />
        </a>
      ))}

      {/* Share */}
      <a
        onClick={onShare}
        title="Share card"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32, height: 32,
          borderRadius: 8,
          color: "inherit",
          opacity: 0.5,
          cursor: "pointer",
          textDecoration: "none",
          transition: "opacity 0.15s, background 0.15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.background = "rgba(128,128,128,0.1)"; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = "0.5"; e.currentTarget.style.background = "transparent"; }}
      >
        <i className="fa-solid fa-share-nodes" style={{ fontSize: "1rem" }} />
      </a>
    </div>
  );
}

export default Contact;
