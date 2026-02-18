// src/eCard/ProfileInfo.jsx
// Fixed: Custom icon for status, better vertical alignment
// SEPARATE COMMIT: CV link on its own line

function ProfileInfo({ profile, size }) {
  const { nameFont, titleFont, bodyFont } = size;
  const statusLabel = profile.status?.label || "Available for work";

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      fontFamily: "inherit",
      gap: "0.5rem"
    }}>

      {/* ── Name ── */}
      <p style={{
        fontSize: nameFont,
        fontFamily: "'DM Serif Display', Georgia, serif",
        fontWeight: 400,
        lineHeight: 1.15,
        margin: 0,
        color: "inherit",
      }}>
        {profile.name}
      </p>

      {/* ── Title (without CV link) ── */}
      <p style={{
        fontSize: titleFont,
        margin: 0,
        color: "inherit",
        opacity: 0.6,
      }}>
        {profile.title}
      </p>

      {/* ── CV/Resume link on separate line ── */}
      {profile.cvUrl && (
        <a 
          href={profile.cvUrl} 
          target="_blank" 
          rel="noreferrer"
          style={{ 
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: "0.8rem",
            color: "inherit",
            opacity: 0.6,
            textDecoration: "none",
            width: "max-content",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
          onMouseLeave={e => e.currentTarget.style.opacity = "0.6"}
        >
          <i className="fa-regular fa-file-lines" style={{ fontSize: "0.9em" }} />
          <span>View Resume</span>
          <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: "0.7em" }} />
        </a>
      )}

      {/* ── Status badge — with custom icon ── */}
      <div style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 11px",
        borderRadius: 999,
        width: "max-content",
        border: "1px solid rgba(74, 222, 128, 0.3)",
        background: "rgba(74, 222, 128, 0.08)",
      }}>
        <i className="fa-solid fa-circle-check" style={{
          fontSize: "0.75rem",
          color: "#4ade80",
          flexShrink: 0,
        }} />
        <span style={{
          fontSize: "0.72rem",
          color: "inherit",
          opacity: 0.8,
          whiteSpace: "nowrap",
        }}>
          {statusLabel}
        </span>
      </div>

      {/* ── Location ── */}
      <p style={{
        fontSize: bodyFont,
        display: "flex",
        alignItems: "center",
        gap: 5,
        margin: 0,
        color: "inherit",
        opacity: 0.5,
      }}>
        <i className="fa-sharp fa-solid fa-location-dot"
           style={{ fontSize: "0.75em" }} />
        {profile.location}
      </p>
    </div>
  );
}

export default ProfileInfo;
