import ProfileInfo from "./ProfileInfo.jsx";
import Contact from "./Contact.jsx";
import { PROFILE as DEFAULT_PROFILE, COLOR_PALETTES } from "../data/profile.js";
import { CARD_SIZES } from "../data/cardSizes";
import { useEffect, useState } from "react";

function CardView() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);

  // 1) Load profile from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("ecard-profile");
    if (stored) {
      try {
        setProfile(JSON.parse(stored));
      } catch {
        // ignore parse error, keep default
      }
    }
  }, []);

  // 2) Derive size and palette *from current profile state*
  const sizeKey = profile.cardSize || "md";
  const size = CARD_SIZES[sizeKey] || CARD_SIZES.md;

  const selectedPalette =
    COLOR_PALETTES.find((p) => p.id === profile.paletteId) ||
    COLOR_PALETTES[0];

  // 3) Whenever selectedPalette changes, update CSS vars on this card only
  useEffect(() => {
    if (!selectedPalette) return;
    const cardEl = document.getElementById("ecard-root");
    if (!cardEl) return;

    cardEl.style.setProperty(
      "--card-bg",
      selectedPalette.cardBg || selectedPalette.background
    );
    cardEl.style.setProperty("--text", selectedPalette.text);
  }, [selectedPalette]);

  return (
    <div
      id="ecard-root"
      className={`ecard ecard-${sizeKey}`}
      style={{
        width: `${size.width}px`,
        minHeight: `${size.height}px`,
        boxSizing: "border-box",
        padding: "0.9rem",
        borderRadius: "10px",
        boxShadow: "0 0px 20px 0 rgba(107, 107, 107, 0.2)",
        display: "flex",
        flexDirection: "column",
        overflow: "visible",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <ProfileInfo profile={profile} size={size} />
      </div>
      <Contact profile={profile} size={size} onShare={() => {}} />
    </div>
  );
}

export default CardView;
