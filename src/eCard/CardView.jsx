// src/eCard/CardView.jsx
import ProfileInfo from "./ProfileInfo.jsx";
import Contact from "./Contact.jsx";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { PROFILE as DEFAULT_PROFILE, COLOR_PALETTES } from "../data/profile.js";
import { CARD_SIZES } from "../data/cardSizes";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { loadCard, copyToClipboard, getCardUrl } from "../utils/cardHelpers";

function CardView() {
  const { cardId } = useParams(); // Get cardId from URL (/card/:cardId)
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Detect if page is embedded (via ?embed=true parameter)
  const urlParams = new URLSearchParams(window.location.search);
  const isEmbedded = urlParams.get("embed") === "true";

  // Load card data on mount
  useEffect(() => {
    const fetchCard = async () => {
      if (!cardId) {
        // No cardId in URL - fallback to localStorage (legacy support)
        const stored = localStorage.getItem("ecard-profile");
        if (stored) {
          try {
            setProfile(JSON.parse(stored));
          } catch (e) {
            console.error("Error parsing stored profile:", e);
          }
        }
        setLoading(false);
        return;
      }

      // Load from Firebase
      try {
        const result = await loadCard(cardId);
        if (result.success) {
          setProfile(result.data.profile);
          setError(null);
        } else {
          setError("Card not found");
        }
      } catch (err) {
        setError("Failed to load card");
        console.error("Error in fetchCard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCard();
  }, [cardId]);

  // Derive card size and color palette from profile
  const sizeKey = profile.cardSize || "md";
  const size = CARD_SIZES[sizeKey] || CARD_SIZES.md;
  const selectedPalette =
    COLOR_PALETTES.find((p) => p.id === profile.paletteId) ||
    COLOR_PALETTES[0];

  // Handle share button click
  const handleShare = async () => {
    if (!cardId) {
      alert("Please publish your card first to share it!");
      return;
    }

    const shareUrl = getCardUrl(cardId);
    
    // Try native Web Share API first (mobile-friendly)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name}'s Card`,
          text: `Check out ${profile.name}'s professional card!`,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fall through to clipboard
        if (err.name !== "AbortError") {
          console.error("Share failed:", err);
        }
      }
    }

    // Fallback to clipboard
    const success = await copyToClipboard(shareUrl);
    if (success) {
      alert("Card link copied to clipboard! 📋");
    } else {
      alert("Failed to copy link. Please copy manually:\n\n" + shareUrl);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh",
        fontSize: "1.125rem",
        color: "#6b7280",
        background: "#f9fafb"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ 
            marginBottom: "1rem",
            fontSize: "2rem"
          }}>
            ⏳
          </div>
          Loading card...
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column",
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh",
        textAlign: "center",
        padding: "2rem",
        background: "#f9fafb"
      }}>
        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>😕</div>
        <h1 style={{ 
          fontSize: "2rem", 
          marginBottom: "0.5rem",
          fontWeight: 700,
          color: "#111827"
        }}>
          Card Not Found
        </h1>
        <p style={{ 
          color: "#6b7280", 
          marginBottom: "1.5rem",
          maxWidth: "400px"
        }}>
          This card doesn't exist or may have been removed.
        </p>
        <a href="/" style={{
          padding: "0.75rem 1.5rem",
          background: "#6366f1",
          color: "white",
          textDecoration: "none",
          borderRadius: "8px",
          fontWeight: 600,
          transition: "background 0.2s"
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = "#4f46e5"}
        onMouseLeave={(e) => e.currentTarget.style.background = "#6366f1"}
        >
          Create Your Own Card
        </a>
      </div>
    );
  }

  // Main render
  return (
    <div style={{ 
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "#f9fafb"
    }}>
      
      {/* Header - only show if NOT embedded */}
      {!isEmbedded && <Header />}

      {/* Card Container */}
      <div style={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: isEmbedded ? "0" : "3rem 1rem"
      }}>
        <div
          id="ecard-root"
          className={`ecard ecard-${sizeKey}`}
          style={{
            width: `${size.width}px`,
            minHeight: `${size.height}px`,
            boxSizing: "border-box",
            borderRadius: "12px",
            boxShadow: isEmbedded 
              ? "none"
              : "0 20px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: selectedPalette.background,
            color: selectedPalette.text,
          }}
        >
          {/* Profile Photo */}
          {profile.showImage && size.photoHeight > 0 && profile.photo && (
            <div style={{
              height: size.photoHeight,
              width: "100%",
              overflow: "hidden",
              flexShrink: 0,
            }}>
              <img
                src={profile.photo}
                alt={profile.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: `${(profile.focalPoint || {x:50,y:30}).x}% ${(profile.focalPoint || {x:50,y:30}).y}%`,
                  display: "block",
                }}
              />
            </div>
          )}

          {/* Card Content */}
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: profile.showImage && profile.photo 
              ? "14px 16px 14px" 
              : "24px 20px 20px",
            justifyContent: profile.showImage && profile.photo 
              ? "flex-start" 
              : "center",
          }}>
            <ProfileInfo profile={profile} size={size} />
            <Contact profile={profile} onShare={handleShare} />
          </div>
        </div>
      </div>

      {/* Footer - only show if NOT embedded */}
      {!isEmbedded && <Footer />}
    </div>
  );
}

export default CardView;
