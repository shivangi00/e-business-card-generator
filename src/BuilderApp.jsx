// src/App.jsx
const ICON_PRESETS = [
  { label: "Email", value: "fa-sharp fa-solid fa-envelope" },
  { label: "Code", value: "fa-solid fa-code" },
  { label: "GitHub", value: "fa-brands fa-github" },
  { label: "LinkedIn", value: "fa-brands fa-square-linkedin" },
  { label: "X/Twitter", value: "fa-brands fa-x-twitter" },
];

import { PROFILE as DEFAULT_PROFILE, COLOR_PALETTES } from "./data/profile.js";
import "./App.css";
import Contact from "./eCard/Contact.jsx";
import ProfileInfo from "./eCard/ProfileInfo.jsx";
import { CARD_SIZES } from "./data/cardSizes";
import { useState, useEffect } from "react";
import Nav from "./Nav.jsx";

function BuilderApp() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const selectedPalette =
  COLOR_PALETTES.find((p) => p.id === profile.paletteId) ||
  COLOR_PALETTES[0];

  useEffect(() => {
    if (!selectedPalette) return;

    const cardEl = document.getElementById("ecard-preview");
    if (!cardEl) return;

    cardEl.style.setProperty("--card-bg", selectedPalette.background);
    cardEl.style.setProperty("--text", selectedPalette.text);
    // Optionally, if you want page bg too:
    // cardEl.style.setProperty("--bg", selectedPalette.background);
  }, [selectedPalette]);


  const handlePaletteChange = (id) => {
    setProfile((prev) => ({
      ...prev,
      paletteId: id,
    }));
  };
  

  const handleShare = async () => {
    const shareUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Link copied! Paste it anywhere to share.");
    } catch (err) {
      console.error("Clipboard failed", err);
      alert("Could not copy link. Please copy it manually: " + shareUrl);
    }
  };

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (index, field, value) => {
    setProfile((prev) => {
      const socials = [...prev.socials];
      socials[index] = { ...socials[index], [field]: value };
      return { ...prev, socials };
    });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setProfile((prev) => ({ ...prev, photo: url }));
  };

  useEffect(() => {
    localStorage.setItem("ecard-profile", JSON.stringify(profile));
  }, [profile]);

  const sizeKey = profile.cardSize || "md";
  const size = CARD_SIZES[sizeKey] || CARD_SIZES.md;
  // const { width, height } = SIZE_PRESETS[size];

  const embedSrc = "http://localhost:5174/card"; // later: /card/:id

  const embedCode = `<iframe
    src="${embedSrc}"
    style={{border:"0", width:"${size.width}px", height:"${size.height}px", border-radius:"16px", overflow:"hidden";}}
    loading="lazy"
  />`;



  return (
    <div className="app-root">
      {/* Left: builder form */}
      <div className="builder-panel">
        <h2>Customize your eCard</h2>

        <label>
          Name
          <input
            type="text"
            value={profile.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </label>

        <label>
          Title
          <input
            type="text"
            value={profile.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />
        </label>

        <label>
          Location
          <input
            type="text"
            value={profile.location}
            onChange={(e) => handleChange("location", e.target.value)}
          />
        </label>

        <label>
          CV URL
          <input
            type="text"
            value={profile.cvUrl}
            onChange={(e) => handleChange("cvUrl", e.target.value)}
          />
        </label>

        {/* NEW: profile image upload */}
        <label>
          Profile image
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
          />
        </label>
        
        <label>
          Card size
          <select
            value={profile.cardSize || "md"}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, cardSize: e.target.value }))
            }
          >
            {Object.entries(CARD_SIZES).map(([key, preset]) => (
              <option key={key} value={key}>
                {preset.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <input
            type="checkbox"
            checked={profile.showImage}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, showImage: e.target.checked }))
            }
          />
          Show profile image
        </label>


        <div className="palette-row">
          <h3>Color palette</h3>
          <div className="palette-swatches">
            {COLOR_PALETTES.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`palette-swatch ${
                  p.id === profile.paletteId ? "active" : ""
                }`}
                style={{ background: p.background, color: p.text }}
                onClick={() => handlePaletteChange(p.id)}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>


        {/* NEW: social links editor */}
        <div className="socials-edit-block">
          <h3>Social links</h3>
          {profile.socials.map((social, index) => {
            const isEmail = social.id === "email";

            // derive the value for the email input (no mailto:)
            const emailAddress =
              isEmail && social.href.startsWith("mailto:")
                ? social.href.slice("mailto:".length)
                : social.href;

            const handleHrefChange = (value) => {
              if (isEmail) {
                handleSocialChange(index, "href", `mailto:${value}`);
              } else {
                handleSocialChange(index, "href", value);
              }
            };

            return (
              <div key={social.id} className="social-edit-row">
                {/* <span className="social-label">{social.id}</span> */}

                <input
                  type="text"
                  value={isEmail ? emailAddress : social.href}
                  onChange={(e) => handleHrefChange(e.target.value)}
                  placeholder={isEmail ? "email@example.com" : "URL"}
                />
                <input
                  type="text"
                  value={social.iconClass}
                  onChange={(e) =>
                    handleSocialChange(index, "iconClass", e.target.value)
                  }
                  placeholder="Font Awesome class"
                />

                <div className="icon-presets-row">
                  {ICON_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      className="icon-preset-btn"
                      onClick={() =>
                        handleSocialChange(index, "iconClass", preset.value)
                      }
                    >
                      <i className={preset.value}></i>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="embed-block">
          <h3>Embed code</h3>
          <textarea
            readOnly
            value={embedCode}
            className="embed-textarea"
          />
          <button
            type="button"
            className="book-btn"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(embedCode);
                alert("Embed code copied!");
              } catch (err) {
                console.error(err);
                alert("Could not copy. Please copy manually.");
              }
            }}
          >
            <a>Copy embed code</a>
          </button>
        </div>


      </div>

      {/* Right: live preview */}
      
      <div
        id="ecard-preview"
        className={`ecard ecard-${sizeKey}`}
        style={{
          width: `${size.width}px`,
          minHeight: `${size.height}px`,
          boxSizing: "border-box",
          overflow: "visible",
          padding: "0.9rem",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(15,23,42,0.12)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* middle section grows to fill space between top content and socials */}
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

        <Contact profile={profile} size={size} onShare={handleShare} />
      </div>

    </div>
  );
}

export default BuilderApp;
