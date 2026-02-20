// src/eCard/CardView.jsx - PROPERLY FIXED: Full card flip
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
  const { cardId } = useParams();
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false); // Card flip state

  const urlParams = new URLSearchParams(window.location.search);
  const isEmbedded = urlParams.get("embed") === "true";

  useEffect(() => {
    const fetchCard = async () => {
      if (!cardId) {
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

  const sizeKey = profile.cardSize || "md";
  const size = CARD_SIZES[sizeKey] || CARD_SIZES.md;
  const selectedPalette =
    COLOR_PALETTES.find((p) => p.id === profile.paletteId) ||
    COLOR_PALETTES[0];

  const handleShare = async () => {
    if (!cardId) {
      alert("Please publish your card first to share it!");
      return;
    }

    const shareUrl = getCardUrl(cardId);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name}'s Card`,
          text: `Check out ${profile.name}'s professional card!`,
          url: shareUrl,
        });
        return;
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Share failed:", err);
        }
      }
    }

    const success = await copyToClipboard(shareUrl);
    if (success) {
      alert("Card link copied to clipboard! 📋");
    } else {
      alert("Failed to copy link. Please copy manually:\n\n" + shareUrl);
    }
  };

  const handleFlipChange = (flipped) => {
    setIsFlipped(flipped);
  };

  const handleFlipBack = () => {
    setIsFlipped(false);
  };

  const fullCardUrl = cardId ? getCardUrl(cardId) : window.location.href;

  const getQRCodeUrl = () => {
    if (!fullCardUrl) return "";
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(fullCardUrl)}`;
  };

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
          <div style={{ marginBottom: "1rem", fontSize: "2rem" }}>⏳</div>
          Loading card...
        </div>
      </div>
    );
  }

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

  return (
    <div style={{ 
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "#f9fafb"
    }}>
      
      {!isEmbedded && <Header />}

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
            position: "relative",
          }}
        >
          {/* FRONT SIDE - Only render when NOT flipped */}
          {!isFlipped && (
            <>
              {/* Photo */}
              {profile.showImage && size.photoHeight > 0 && profile.photo && (
                <div style={{
                  height: size.photoHeight,
                  width: "100%",
                  overflow: "hidden",
                  flexShrink: 0,
                  borderRadius: "12px 12px 0 0",
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

              {/* Content */}
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
                <Contact 
                  profile={profile} 
                  onShare={handleShare}
                  cardUrl={fullCardUrl}
                  onFlipChange={handleFlipChange}
                />
              </div>
            </>
          )}

          {/* BACK SIDE - QR Code - Only render when flipped */}
          {isFlipped && (
            <div 
              onClick={handleFlipBack}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem 1.5rem",
                cursor: "pointer",
                animation: "flipIn 0.5s ease-out",
                background: selectedPalette.background,
                color: selectedPalette.text,
                zIndex: 100,
                borderRadius: "12px",
              }}
              className="card-back"
            >
              {/* Name at top */}
              <div style={{
                position: "absolute",
                top: "1.5rem",
                left: 0,
                right: 0,
                textAlign: "center",
              }}>
                <h3 style={{
                  fontSize: "1.25rem",
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontWeight: 400,
                  margin: 0,
                  color: "inherit",
                }}>
                  {profile.name}
                </h3>
              </div>

              {/* QR Code in center */}
              <div style={{
                background: "white",
                padding: "1rem",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.75rem",
              }}>
                {fullCardUrl ? (
                  <>
                    <img 
                      src={getQRCodeUrl()} 
                      alt="QR Code"
                      style={{
                        width: "180px",
                        height: "180px",
                        display: "block",
                      }}
                    />
                    <p style={{
                      fontSize: "0.7rem",
                      color: "#6b7280",
                      margin: 0,
                      textAlign: "center",
                    }}>
                      Scan to view card
                    </p>
                  </>
                ) : (
                  <div style={{
                    width: "180px",
                    height: "180px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f3f4f6",
                    borderRadius: "8px",
                    color: "#6b7280",
                    fontSize: "0.85rem",
                    textAlign: "center",
                    padding: "1rem",
                  }}>
                    Publish card to generate QR code
                  </div>
                )}
              </div>

              {/* Line at bottom */}
              <div style={{
                position: "absolute",
                bottom: "1.5rem",
                left: "2rem",
                right: "2rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}>
                <div style={{
                  flex: 1,
                  height: "1px",
                  background: "currentColor",
                  opacity: 0.2,
                }} />
                <span style={{
                  fontSize: "0.7rem",
                  opacity: 0.4,
                  whiteSpace: "nowrap",
                }}>
                  Tap to return
                </span>
                <div style={{
                  flex: 1,
                  height: "1px",
                  background: "currentColor",
                  opacity: 0.2,
                }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {!isEmbedded && <Footer />}
    </div>
  );
}

export default CardView;
