// src/eCard/Contact.jsx - PROPERLY FIXED: Flip at card level
import { useState } from "react";

function Contact({ profile, onShare, cardUrl, onFlipChange }) {
  const [hoveredNested, setHoveredNested] = useState(null);

  const handleShareClick = () => {
    if (onFlipChange) {
      onFlipChange(true); // Tell parent to flip
    }
  };

  return (
    <div style={{
      marginTop: "auto",
      paddingTop: 16,
      borderTop: "1px solid rgba(128,128,128,0.18)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-around",
      position: "relative",
      minHeight: "50px",
    }}>
      {profile.socials.slice(0, 4).map((social, index) => {
        const hasNested = social.isNested && social.nestedIcons && social.nestedIcons.length > 0;
        const isHovered = hoveredNested === social.id;

        return (
          <div
            key={social.id}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding:"0", // changed padding to 0 to retain position of the root social icons
            }}
            onMouseEnter={() => hasNested && setHoveredNested(social.id)}
            onMouseLeave={() => hasNested && setHoveredNested(null)}
            className="social-icon-wrapper"
          >
            <a
              href={hasNested ? "#" : social.href}
              onClick={(e) => hasNested && e.preventDefault()}
              target="_blank"
              rel="noreferrer"
              title={social.label || "Social link"}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: 8,
                color: "inherit",
                opacity: hasNested && isHovered ? 1 : 0.5,
                textDecoration: "none",
                transition: "opacity 0.15s, background 0.15s",
                position: "relative",
                zIndex: 2,
                background: hasNested && isHovered ? "rgba(128,128,128,0.1)" : "transparent",
              }}
              onMouseEnter={(e) => {
                if (!hasNested) {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.background = "rgba(128,128,128,0.1)";
                }
              }}
              onMouseLeave={(e) => {
                if (!hasNested) {
                  e.currentTarget.style.opacity = "0.5";
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <i className={social.iconClass} style={{ fontSize: "1rem" }} />
              
              {hasNested && (
                <span style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  minWidth: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: "#6366f1",
                  border: "1.5px solid var(--card-bg, #fff)",
                  fontSize: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                  padding: "0 2px",
                }}
                className="nested-badge">
                  {social.nestedIcons.length}
                </span>
              )}
            </a>

            {hasNested && isHovered && (
              <div
                style={{
                  position: "absolute",
                  bottom: "30%",
                  left: "100%", // no more floating icons hiding away
                  transform: "translateX(-50%)",
                  display: "flex",
                  gap: 6,
                  zIndex: 100,
                  pointerEvents: "auto",
                  paddingBottom: "30px",
                }}
                className="fan-container"
              >
                {social.nestedIcons.map((nested, nestedIndex) => {
                  return (
                    <a
                      key={nested.id}
                      href={nested.href}
                      target="_blank"
                      rel="noreferrer"
                      title={nested.label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        color: "inherit",
                        opacity: 0.95,
                        textDecoration: "none",
                        background: "var(--card-bg, #fff)",
                        backdropFilter: "blur(8px)",
                        border: "2px solid rgba(99,102,241,0.4)",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                        transition: "all 0.2s",
                        animation: `fanOut 0.3s ease-out ${nestedIndex * 0.08}s both`,
                        transformOrigin: "bottom center",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = "1";
                        e.currentTarget.style.borderColor = "#6366f1";
                        e.currentTarget.style.transform = "scale(1.15) translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 8px 24px rgba(99,102,241,0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = "0.95";
                        e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)";
                        e.currentTarget.style.transform = "scale(1) translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.2)";
                      }}
                      className="nested-icon"
                    >
                      <i className={nested.iconClass} style={{ fontSize: "0.95rem" }} />
                    </a>
                  );
                })}
              </div>
            )}

            {hasNested && (
              <div className="print-nested-icons" style={{ display: "none" }}>
                {social.nestedIcons.map((nested) => (
                  <i key={nested.id} className={nested.iconClass} />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Share Icon - Triggers Flip */}
      <button
        onClick={handleShareClick}
        title="Share card - Show QR code"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 32,
          borderRadius: 8,
          color: "inherit",
          opacity: 0.5,
          cursor: "pointer",
          border: "none",
          background: "transparent",
          transition: "opacity 0.15s, background 0.15s, transform 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "1";
          e.currentTarget.style.background = "rgba(128,128,128,0.1)";
          e.currentTarget.style.transform = "scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "0.5";
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <i className="fa-solid fa-share-nodes" style={{ fontSize: "1rem" }} />
      </button>
    </div>
  );
}

export default Contact;
