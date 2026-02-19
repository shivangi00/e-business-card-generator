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

  return (
    <div style={{ position: "relative" }}>
      {/* User Avatar Button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.5rem 0.75rem",
          background: "rgba(99, 102, 241, 0.1)",
          border: "1px solid rgba(99, 102, 241, 0.2)",
          borderRadius: "8px",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(99, 102, 241, 0.15)";
          e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(99, 102, 241, 0.1)";
          e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.2)";
        }}
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || "User"}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              objectFit: "cover"
            }}
          />
        ) : (
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: "#6366f1",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
            fontSize: "0.875rem"
          }}>
            {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
          </div>
        )}
        
        <span style={{ 
          fontSize: "0.875rem", 
          fontWeight: 500,
          color: "#374151",
          maxWidth: "150px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }}>
          {user.displayName || user.email}
        </span>
        
        <i 
          className="fa-solid fa-chevron-down" 
          style={{ 
            fontSize: "0.75rem",
            color: "#6b7280",
            transition: "transform 0.2s",
            transform: showMenu ? "rotate(180deg)" : "rotate(0)"
          }} 
        />
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <>
          {/* Backdrop to close menu */}
          <div
            onClick={() => setShowMenu(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 998
            }}
          />
          
          {/* Menu */}
          <div style={{
            position: "absolute",
            top: "calc(100% + 0.5rem)",
            right: 0,
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            minWidth: "220px",
            zIndex: 999,
            overflow: "hidden"
          }}>
            {/* User Info */}
            <div style={{
              padding: "1rem",
              borderBottom: "1px solid #e5e7eb"
            }}>
              <p style={{
                margin: 0,
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#111827",
                marginBottom: "0.25rem"
              }}>
                {user.displayName || "User"}
              </p>
              <p style={{
                margin: 0,
                fontSize: "0.75rem",
                color: "#6b7280"
              }}>
                {user.email}
              </p>
            </div>

            {/* Menu Items */}
            <div style={{ padding: "0.5rem" }}>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                style={{
                  width: "100%",
                  padding: "0.625rem 0.75rem",
                  background: "transparent",
                  border: "none",
                  borderRadius: "4px",
                  textAlign: "left",
                  cursor: signingOut ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.875rem",
                  color: "#dc2626",
                  fontWeight: 500,
                  transition: "background 0.2s",
                  opacity: signingOut ? 0.5 : 1
                }}
                onMouseEnter={(e) => !signingOut && (e.currentTarget.style.background = "#fef2f2")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {signingOut ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" />
                    Signing out...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-right-from-bracket" />
                    Sign Out
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
