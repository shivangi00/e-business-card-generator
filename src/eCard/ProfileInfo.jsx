// src/eCard/ProfileInfo.jsx - WITH COMPANY LOGO
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

      {/* ── Title ── */}
      <p style={{
        fontSize: titleFont,
        margin: 0,
        color: "inherit",
        opacity: 0.6,
        lineHeight: 1.3,
      }}>
        {profile.title}
      </p>

      {/* ── Company with Logo ── */}
      {profile.company && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginTop: "-0.25rem", // Slight negative margin to keep it close to title
        }}>
          {profile.companyLogo && (
            <img 
              src={profile.companyLogo} 
              alt={`${profile.company} logo`}
              style={{
                width: "1.2rem",
                height: "1.2rem",
                objectFit: "contain",
                borderRadius: "2px",
                flexShrink: 0,
              }}
            />
          )}
          <span style={{ 
            fontSize: "0.85rem", 
            color: "inherit",
            opacity: 0.5,
            lineHeight: 1.2,
          }}>
            {profile.company}
          </span>
        </div>
      )}

      {/* ── Status badge — customizable ── */}
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

      {/* ── Email ── */}
      {profile.email && (
        <a
          href={`mailto:${profile.email}`}
          style={{
            fontSize: bodyFont,
            display: "flex",
            alignItems: "center",
            gap: 5,
            margin: 0,
            color: "inherit",
            opacity: 0.5,
            textDecoration: "none",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
          onMouseLeave={(e) => e.currentTarget.style.opacity = "0.5"}
        >
          <i className="fa-sharp fa-solid fa-envelope"
             style={{ fontSize: "0.75em" }} />
          {profile.email}
          {profile.emailType && (
            <span style={{ 
              fontSize: "0.7em", 
              opacity: 0.6,
              marginLeft: "-2px"
            }}>
              ({profile.emailType === "work" ? "Work" : "Personal"})
            </span>
          )}
        </a>
      )}

      {/* ── Phone (optional) ── */}
      {profile.phone && (
        <a
          href={`tel:${profile.phone}`}
          style={{
            fontSize: bodyFont,
            display: "flex",
            alignItems: "center",
            gap: 5,
            margin: 0,
            color: "inherit",
            opacity: 0.5,
            textDecoration: "none",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
          onMouseLeave={(e) => e.currentTarget.style.opacity = "0.5"}
        >
          <i className="fa-sharp fa-solid fa-phone"
             style={{ fontSize: "0.75em" }} />
          {profile.phone}
        </a>
      )}
    </div>
  );
}

export default ProfileInfo;
