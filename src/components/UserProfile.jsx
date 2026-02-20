// src/components/UserProfile.jsx
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";

function UserProfile() {
  const { user, signOutUser } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  if (!user) return null;

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOutUser();
    setShowMenu(false);
    setSigningOut(false);
  };

  const initials =
    user.displayName?.charAt(0)?.toUpperCase() ||
    user.email?.charAt(0)?.toUpperCase() ||
    "U";

  return (
    <div style={{ position: "relative" }}>
      {/* Trigger: avatar + chevron only */}
      <button
        type="button"
        onClick={() => setShowMenu((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={showMenu}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.35rem",
          padding: "0.3rem 0.45rem",
          background: "rgba(15, 23, 42, 0.04)",
          border: "1px solid rgba(148, 163, 184, 0.5)",
          borderRadius: "999px",
          cursor: "pointer",
          transition: "background 0.15s ease, border-color 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(15, 23, 42, 0.07)";
          e.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.9)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(15, 23, 42, 0.04)";
          e.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.5)";
        }}
      >
        {/* Avatar */}
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || "User"}
            style={{
              width: 28,
              height: 28,
              borderRadius: "999px",
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "999px",
              background: "linear-gradient(135deg, #4f46e5, #22c55e)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              fontSize: "0.8rem",
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
        )}

        {/* Chevron */}
        <i
          className="fa-solid fa-chevron-down"
          style={{
            fontSize: "0.7rem",
            color: "#9ca3af",
            transition: "transform 0.15s ease",
            transform: showMenu ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {/* Dropdown */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setShowMenu(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 998,
            }}
          />

          {/* Menu panel */}
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 0.5rem)",
              right: 0,
              background: "var(--card-bg, #0f172a)",
              border: "1px solid rgba(148, 163, 184, 0.5)",
              borderRadius: 10,
              boxShadow: "0 18px 45px rgba(15, 23, 42, 0.45)",
              minWidth: 230,
              zIndex: 999,
              overflow: "hidden",
            }}
          >
            {/* Header with full user info */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 0.9rem",
                borderBottom: "1px solid rgba(148, 163, 184, 0.35)",
              }}
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "999px",
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "999px",
                    background:
                      "linear-gradient(135deg, #4f46e5, #22c55e)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    flexShrink: 0,
                  }}
                >
                  {initials}
                </div>
              )}

              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "var(--card-text, #f9fafb)",
                  }}
                >
                  {user.displayName || "User"}
                </p>
                <p
                  style={{
                    margin: 0,
                    marginTop: 2,
                    fontSize: "0.75rem",
                    color: "rgba(148, 163, 184, 0.9)",
                    maxWidth: 160,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={user.email}
                >
                  {user.email}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div style={{ padding: "0.4rem 0.4rem 0.5rem" }}>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                style={{
                  width: "100%",
                  padding: "0.45rem 0.6rem",
                  background: "transparent",
                  border: "none",
                  borderRadius: 6,
                  textAlign: "left",
                  cursor: signingOut ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.8rem",
                  color: "#fecaca",
                  fontWeight: 500,
                  transition:
                    "background 0.15s ease, color 0.15s ease",
                  opacity: signingOut ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!signingOut) {
                    e.currentTarget.style.background =
                      "rgba(248, 113, 113, 0.08)";
                    e.currentTarget.style.color = "#fca5a5";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#fecaca";
                }}
              >
                {signingOut ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" />
                    Signing out…
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-right-from-bracket" />
                    Sign out
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default UserProfile;
