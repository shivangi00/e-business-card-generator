// src/components/SignIn.jsx
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";


function SignIn() {
  const { signInWithGoogle } = useAuth();
  const [signingIn, setSigningIn] = useState(false);

  const handleSignIn = async () => {
    setSigningIn(true);
    const result = await signInWithGoogle();
    
    if (!result.success) {
      alert("Failed to sign in. Please try again.\n\n" + result.error);
    }
    
    setSigningIn(false);
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "3rem 2rem",
      textAlign: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      borderRadius: "12px",
      color: "white",
      marginBottom: "2rem"
    }}>
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔐</div>
      
      <h2 style={{ 
        fontSize: "1.75rem", 
        marginBottom: "0.5rem",
        fontWeight: 700 
      }}>
        Sign In to Continue
      </h2>
      
      <p style={{ 
        fontSize: "0.95rem", 
        marginBottom: "2rem",
        opacity: 0.9,
        maxWidth: "400px"
      }}>
        Sign in with your Google account to create and manage your professional eCard
      </p>
      
      <button
        onClick={handleSignIn}
        disabled={signingIn}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: "0.5rem",
          background: "white",
          color: "#333",
          border: "none",
          borderRadius: "8px",
          fontSize: "1rem",
          fontWeight: 600,
          cursor: signingIn ? "not-allowed" : "pointer",
          transition: "transform 0.2s, box-shadow 0.2s",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          opacity: signingIn ? 0.7 : 1
        }}
        onMouseEnter={(e) => !signingIn && (e.currentTarget.style.transform = "translateY(-2px)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
      >
        {signingIn ? (
          <>
            <i className="fa-solid fa-spinner fa-spin" />
            Signing in...
          </>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </>
        )}
      </button>
      
      <p style={{
        fontSize: "0.75rem",
        marginTop: "1.5rem",
        opacity: 0.7,
        maxWidth: "350px"
      }}>
        We'll only access your basic profile info. You can sign out anytime.
      </p>
    </div>
  );
}

export default SignIn;
