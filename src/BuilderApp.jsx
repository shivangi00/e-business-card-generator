// BuilderApp.jsx
import { PROFILE as DEFAULT_PROFILE, COLOR_PALETTES } from "./data/profile.js";
import "./App.css";
import Contact from "./eCard/Contact.jsx";
import ProfileInfo from "./eCard/ProfileInfo.jsx";
import { CARD_SIZES } from "./data/cardSizes";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  generateCardId,
  saveCard,
  updateCard,
  loadCard,
  getCardUrl,
  getUserCards,
} from "./utils/cardHelpers";
import { resizeAndConvertImage } from "./utils/imageHelpers";
import { useAuth } from "./contexts/AuthContext";
import SignIn from "./components/SignIn";
import UserProfile from "./components/UserProfile";

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */
const EMBED_FORMATS = ["HTML", "React", "Vue"];
const MAX_SOCIALS = 4;

const STATUS_PRESETS = [
  { label: "Available for work", type: "work" },
  { label: "Open to collaboration", type: "collab" },
];

const ICON_CATALOGUE = [
  {
    group: "Communication",
    icons: [
      { label: "Email", fa: "fa-sharp fa-solid fa-envelope" },
      { label: "Phone", fa: "fa-solid fa-phone" },
      { label: "WhatsApp", fa: "fa-brands fa-whatsapp" },
      { label: "Telegram", fa: "fa-brands fa-telegram" },
      { label: "Discord", fa: "fa-brands fa-discord" },
      { label: "Slack", fa: "fa-brands fa-slack" },
    ],
  },
  {
    group: "Portfolio & Code",
    icons: [
      { label: "Website", fa: "fa-solid fa-code" },
      { label: "GitHub", fa: "fa-brands fa-github" },
      { label: "GitLab", fa: "fa-brands fa-gitlab" },
      { label: "CodePen", fa: "fa-brands fa-codepen" },
      { label: "Stack Overflow", fa: "fa-brands fa-stack-overflow" },
      { label: "Replit", fa: "fa-brands fa-replit" },
    ],
  },
  {
    group: "Social",
    icons: [
      { label: "LinkedIn", fa: "fa-brands fa-square-linkedin" },
      { label: "X / Twitter", fa: "fa-brands fa-x-twitter" },
      { label: "Instagram", fa: "fa-brands fa-instagram" },
      { label: "Threads", fa: "fa-brands fa-threads" },
      { label: "Facebook", fa: "fa-brands fa-facebook" },
      { label: "TikTok", fa: "fa-brands fa-tiktok" },
      { label: "Bluesky", fa: "fa-brands fa-bluesky" },
      { label: "Mastodon", fa: "fa-brands fa-mastodon" },
    ],
  },
  {
    group: "Creative & Design",
    icons: [
      { label: "Figma", fa: "fa-brands fa-figma" },
      { label: "Dribbble", fa: "fa-brands fa-dribbble" },
      { label: "Behance", fa: "fa-brands fa-behance" },
      { label: "Medium", fa: "fa-brands fa-medium" },
      { label: "Substack", fa: "fa-solid fa-newspaper" },
      { label: "YouTube", fa: "fa-brands fa-youtube" },
      { label: "Twitch", fa: "fa-brands fa-twitch" },
      { label: "Spotify", fa: "fa-brands fa-spotify" },
    ],
  },
  {
    group: "Professional",
    icons: [
      { label: "CV / Resume", fa: "fa-solid fa-file-lines" },
      { label: "Calendar", fa: "fa-solid fa-calendar-days" },
      { label: "Buy me a coffee", fa: "fa-solid fa-mug-hot" },
      { label: "Patreon", fa: "fa-brands fa-patreon" },
      { label: "ProductHunt", fa: "fa-brands fa-product-hunt" },
      { label: "AngelList", fa: "fa-brands fa-angellist" },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────
   FOCAL POINT PICKER
───────────────────────────────────────────────────────────── */
function FocalPointPicker({ src, focal, onChange, onClose }) {
  const imgRef = useRef(null);
  const handleClick = useCallback(
    (e) => {
      const rect = imgRef.current.getBoundingClientRect();
      onChange({
        x: Math.round(((e.clientX - rect.left) / rect.width) * 100),
        y: Math.round(((e.clientY - rect.top) / rect.height) * 100),
      });
    },
    [onChange]
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="focal-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="modal-title">Set focus point</p>
            <p className="modal-subtitle">
              Click anywhere on the image to set where the card crops
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="focal-img-wrap" onClick={handleClick}>
          <img ref={imgRef} src={src} alt="focal" draggable={false} />
          <div
            className="focal-crosshair"
            style={{ left: `${focal.x}%`, top: `${focal.y}%` }}
          >
            <div className="focal-ring" />
            <div className="focal-dot" />
          </div>
          <div
            className="focal-line focal-line-h"
            style={{ top: `${focal.y}%` }}
          />
          <div
            className="focal-line focal-line-v"
            style={{ left: `${focal.x}%` }}
          />
        </div>
        <div className="modal-footer">
          <span className="mono-hint">
            Focus: {focal.x}% · {focal.y}%
          </span>
          <button className="btn-primary" onClick={onClose}>
            Apply focus
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ICON PICKER MODAL
───────────────────────────────────────────────────────────── */
function IconPickerModal({ onAdd, onClose }) {
  const [url, setUrl] = useState("");
  const [selected, setSelected] = useState(null);

  const handleAdd = () => {
    if (!selected) return;
    const isEmail = selected.label === "Email";
    onAdd({
      id:
        selected.label.toLowerCase().replace(/\s+/g, "-") +
        "-" +
        Date.now(),
      href: isEmail ? `mailto:${url}` : url || "#",
      iconClass: selected.fa,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="icon-picker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="modal-title">Add social link</p>
            <p className="modal-subtitle">
              Pick an icon, enter your URL, then add
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="icon-picker-body">
          {ICON_CATALOGUE.map((group) => (
            <div key={group.group} className="icon-group">
              <p className="icon-group-label">{group.group}</p>
              <div className="icon-grid">
                {group.icons.map((icon) => (
                  <button
                    key={icon.fa}
                    type="button"
                    className={`icon-tile ${
                      selected?.fa === icon.fa ? "icon-tile-active" : ""
                    }`}
                    onClick={() => setSelected(icon)}
                    title={icon.label}
                  >
                    <i className={icon.fa} />
                    <span>{icon.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="icon-picker-url-row">
          {selected ? (
            <i
              className={selected.fa}
              style={{
                color: "var(--accent)",
                fontSize: "1.1rem",
                flexShrink: 0,
              }}
            />
          ) : (
            <i
              className="fa-solid fa-link"
              style={{
                color: "var(--text-3)",
                fontSize: "1rem",
                flexShrink: 0,
              }}
            />
          )}
          <input
            type="text"
            autoFocus
            placeholder={
              selected?.label === "Email" ? "email@example.com" : "https://..."
            }
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
        </div>

        <div className="modal-footer">
          <span className="mono-hint">
            {selected
              ? `Selected: ${selected.label}`
              : "Select an icon above"}
          </span>
          <button
            className="btn-primary"
            onClick={handleAdd}
            disabled={!selected}
          >
            Add to card
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PNG DOWNLOAD
───────────────────────────────────────────────────────────── */
async function downloadCardAsPng() {
  try {
    const { default: html2canvas } = await import(
      "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.esm.js"
    );

    const el = document.getElementById("ecard-preview");
    if (!el) return;

    // Use the element’s own box, not the whole page
    const rect = el.getBoundingClientRect();

    const canvas = await html2canvas(el, {
      scale: 2,                // 1:1 with what you see
      useCORS: true,
      backgroundColor: null,
      width: rect.width,
      height: rect.height,
      x: 0,
      y: 0,
      scrollX: -window.scrollX,
      scrollY: -window.scrollY,
      windowWidth: document.documentElement.clientWidth,
      windowHeight: document.documentElement.clientHeight,
    });

    const link = document.createElement("a");
    link.download = "ecard.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch (err) {
    alert("PNG export failed. Try the embed code instead.\n" + err.message);
  }
}


/* ─────────────────────────────────────────────────────────────
   MAIN BUILDER
───────────────────────────────────────────────────────────── */
function BuilderApp() {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [embedFormat, setEmbedFormat] = useState("HTML");
  const [copied, setCopied] = useState(false);
  const [showFocalPicker, setShowFocalPicker] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Publishing state
  const [publishing, setPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState("");
  const [myCardId, setMyCardId] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);

  const focal = profile.focalPoint || { x: 50, y: 30 };
  const sizeKey = profile.cardSize || "md";
  const isCustom = sizeKey === "custom";
  const size = isCustom
    ? {
        ...CARD_SIZES.md,
        width: profile.customWidth || 350,
        height: profile.customHeight || 370,
        photoHeight: Math.round((profile.customHeight || 370) * 0.43),
      }
    : CARD_SIZES[sizeKey] || CARD_SIZES.md;

  const selectedPalette =
    COLOR_PALETTES.find((p) => p.id === profile.paletteId) ||
    COLOR_PALETTES[0];

  // Load existing card on mount / auth change
  useEffect(() => {
    const loadExistingCard = async () => {
      if (!isAuthenticated || !user?.uid) return;

      const storageKey = `myCardId:${user.uid}`;

      // 1) Try per-user localStorage
      const storedCardId = localStorage.getItem(storageKey);
      if (storedCardId) {
        const result = await loadCard(storedCardId);
        if (result.success && result.data.userId === user.uid) {
          setMyCardId(storedCardId);
          setProfile(result.data.profile);
          setPublishedUrl(getCardUrl(storedCardId));
          return;
        } else {
          localStorage.removeItem(storageKey);
        }
      }

      // 2) Load user's most recent card from Firestore
      const userCardsResult = await getUserCards(user.uid);
      if (userCardsResult.success && userCardsResult.cards.length > 0) {
        const latestCard = userCardsResult.cards[0];
        setMyCardId(latestCard.id);
        setProfile(latestCard.profile);
        setPublishedUrl(getCardUrl(latestCard.id));
        localStorage.setItem(storageKey, latestCard.id);
      }
    };

    loadExistingCard();
  }, [isAuthenticated, user]);

  // Persist profile locally
  useEffect(() => {
    localStorage.setItem("ecard-profile", JSON.stringify(profile));
  }, [profile]);

  // Reset builder state when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setProfile(DEFAULT_PROFILE);
      setMyCardId(null);
      setPublishedUrl("");
    }
  }, [isAuthenticated]);

  const handleChange = (field, value) =>
    setProfile((prev) => ({ ...prev, [field]: value }));

  const handleRemoveSocial = (index) =>
    setProfile((prev) => ({
      ...prev,
      socials: prev.socials.filter((_, i) => i !== index),
    }));

  const handleAddSocial = (newSocial) => {
    if (profile.socials.length >= MAX_SOCIALS) return;
    setProfile((prev) => ({
      ...prev,
      socials: [...prev.socials, newSocial],
    }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);

    try {
      const base64Image = await resizeAndConvertImage(file, 800, 800);

      setProfile((prev) => ({
        ...prev,
        photo: base64Image,
        focalPoint: { x: 50, y: 30 },
      }));

      setTimeout(() => setShowFocalPicker(true), 100);
    } catch (error) {
      console.error("Error processing image:", error);
      alert(
        "Failed to process image. Please try again with a different image."
      );
    } finally {
      setImageUploading(false);
    }
  };

  // Status helpers
  const statusLabel = profile.status?.label || "Available for work";
  const matchedPreset = STATUS_PRESETS.find((p) => p.label === statusLabel);
  const isCustomStatus = !matchedPreset;

  const setStatusPreset = (preset) =>
    setProfile((prev) => ({
      ...prev,
      status: { label: preset.label, type: preset.type },
    }));

  const setStatusCustom = (text) =>
    setProfile((prev) => ({
      ...prev,
      status: { label: text, type: "custom" },
    }));

  // Publish / update card
  const handlePublish = async () => {
    console.log("handlePublish user:", user);
    if (!user?.uid) {
      alert("Auth not ready. Please wait a moment and try again.");
      return;
    }

    setPublishing(true);

    try {
      let cardId = myCardId;
      let result;
      const storageKey = `myCardId:${user.uid}`;

      if (cardId) {
        // Update existing card
        result = await updateCard(cardId, profile, user.uid);
      } else {
        // Create new card
        cardId = generateCardId();
        result = await saveCard(cardId, profile, user.uid);

        if (result.success) {
          setMyCardId(cardId);
          localStorage.setItem(storageKey, cardId);
        }
      }

      if (result.success) {
        const url = getCardUrl(cardId);
        setPublishedUrl(url);

        alert(
          myCardId
            ? "✅ Card updated successfully!"
            : "🎉 Card published successfully!\n\nShare your card with the link below."
        );
      } else {
        throw new Error(result.error || "Failed to save card");
      }
    } catch (error) {
      console.error("Publish error:", error);
      alert(
        "❌ Failed to publish card. Please try again.\n\nError: " +
          error.message
      );
    } finally {
      setPublishing(false);
    }
  };

  // Embed code
  const cardUrl =
    typeof window !== "undefined"
      ? myCardId
        ? getCardUrl(myCardId, true)
        : `${window.location.origin}/card?embed=true`
      : "https://your-deployed-url.com/card?embed=true";

  const getEmbedCode = () => {
    const w = size.width,
      h = size.height;
    if (embedFormat === "HTML")
      return `<iframe
  src="${cardUrl}"
  width="${w}" height="${h}"
  style="border:0;border-radius:18px;overflow:hidden;display:block;"
  loading="lazy" title="eCard"
></iframe>`;
    if (embedFormat === "React")
      return `<iframe
  src="${cardUrl}"
  width={${w}} height={${h}}
  style={{ border:0, borderRadius:18, overflow:"hidden", display:"block" }}
  loading="lazy" title="eCard"
/>`;
    if (embedFormat === "Vue")
      return `<iframe
  :src="'${cardUrl}'" :width="${w}" :height="${h}"
  style="border:0;border-radius:18px;overflow:hidden;display:block;"
  loading="lazy" title="eCard"
/>`;
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Copy manually:\n\n" + text);
    }
  };

  const handleDownloadPng = async () => {
    setDownloading(true);
    await downloadCardAsPng();
    setDownloading(false);
  };

  const atLimit = profile.socials.length >= MAX_SOCIALS;

  return (
    <>
      {showFocalPicker && profile.photo && (
        <FocalPointPicker
          src={profile.photo}
          focal={focal}
          onChange={(pt) => handleChange("focalPoint", pt)}
          onClose={() => setShowFocalPicker(false)}
        />
      )}
      {showIconPicker && !atLimit && (
        <IconPickerModal
          onAdd={handleAddSocial}
          onClose={() => setShowIconPicker(false)}
        />
      )}

      <div className="app-root">
        {/* Builder Panel */}
        <div className="builder-panel">
          <div className="builder-header">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                width: "100%",
              }}
            >
              <div>
                <div className="logo-mark">
                  <div className="dot" />
                  <span>eCard</span>
                </div>
                <h2>Build your card</h2>
                <p>Customize, preview, then embed anywhere.</p>
              </div>
              <UserProfile />
            </div>
          </div>

          <div className="builder-body">
            {/* Show SignIn if not authenticated */}
            {!isAuthenticated && <SignIn />}

            {/* Show builder only if authenticated */}
            {isAuthenticated && (
              <>
                {/* IDENTITY */}
                <div className="form-section">
                  <h3>Identity</h3>

                  {["name", "title", "location", "cvUrl"].map((field) => (
                    <div className="form-field" key={field}>
                      <label>
                        {field === "cvUrl"
                          ? "CV / Résumé URL"
                          : field.charAt(0).toUpperCase() +
                            field.slice(1)}
                      </label>
                      <input
                        type="text"
                        value={profile[field]}
                        placeholder={field === "cvUrl" ? "https://..." : ""}
                        onChange={(e) =>
                          handleChange(field, e.target.value)
                        }
                      />
                    </div>
                  ))}

                  {/* Status */}
                  <div className="form-field">
                    <label>Availability status</label>
                    <div className="status-option-row">
                      {STATUS_PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          className={`status-option-btn ${
                            statusLabel === preset.label ? "active" : ""
                          }`}
                          onClick={() => setStatusPreset(preset)}
                        >
                          <span className="status-option-dot" />
                          {preset.label}
                        </button>
                      ))}
                      <button
                        type="button"
                        className={`status-option-btn ${
                          isCustomStatus ? "active" : ""
                        }`}
                        onClick={() =>
                          setStatusCustom(
                            isCustomStatus ? statusLabel : ""
                          )
                        }
                      >
                        <i
                          className="fa-solid fa-pen"
                          style={{ fontSize: "0.62rem" }}
                        />
                        Custom
                      </button>
                    </div>
                    {isCustomStatus && (
                      <input
                        type="text"
                        style={{ marginTop: 6 }}
                        placeholder="e.g. Freelancing, On sabbatical…"
                        value={statusLabel}
                        onChange={(e) => setStatusCustom(e.target.value)}
                        autoFocus
                      />
                    )}
                  </div>

                  {/* Photo */}
                  <div className="photo-upload-row">
                    <label
                      className={`upload-label ${
                        imageUploading ? "disabled" : ""
                      }`}
                    >
                      {imageUploading ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin" />
                          Processing image...
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-image" />
                          {profile.photo ? "Change photo" : "Upload photo"}
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled={imageUploading}
                      />
                    </label>
                    {profile.photo && !imageUploading && (
                      <button
                        type="button"
                        className="btn-ghost focal-trigger-btn"
                        onClick={() => setShowFocalPicker(true)}
                      >
                        <i className="fa-solid fa-crosshairs" /> Set focus
                      </button>
                    )}
                  </div>
                  {profile.photo && (
                    <div className="focal-mini-preview">
                      <div
                        className="focal-mini-img"
                        style={{
                          backgroundImage: `url(${profile.photo})`,
                          backgroundSize: "cover",
                          backgroundPosition: `${focal.x}% ${focal.y}%`,
                        }}
                      />
                      <span className="focal-mini-label">
                        Crop preview · click "Set focus" to adjust
                      </span>
                    </div>
                  )}
                  <label
                    className="checkbox-row"
                    style={{ marginTop: 8 }}
                  >
                    <input
                      type="checkbox"
                      checked={profile.showImage}
                      onChange={(e) =>
                        handleChange("showImage", e.target.checked)
                      }
                    />
                    Show profile image
                  </label>
                </div>

                {/* APPEARANCE */}
                <div className="form-section">
                  <h3>Appearance</h3>

                  <div className="form-field">
                    <label>Card size</label>
                    <select
                      value={sizeKey}
                      onChange={(e) =>
                        handleChange("cardSize", e.target.value)
                      }
                    >
                      {Object.entries(CARD_SIZES).map(([key, p]) => (
                        <option key={key} value={key}>
                          {p.label}
                        </option>
                      ))}
                      <option value="custom">Custom…</option>
                    </select>
                  </div>

                  {isCustom && (
                    <div className="custom-size-row">
                      <div className="form-field">
                        <label>Width (px)</label>
                        <input
                          type="number"
                          min={200}
                          max={800}
                          value={profile.customWidth || 350}
                          onChange={(e) =>
                            handleChange(
                              "customWidth",
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>
                      <div className="form-field">
                        <label>Height (px)</label>
                        <input
                          type="number"
                          min={200}
                          max={900}
                          value={profile.customHeight || 370}
                          onChange={(e) =>
                            handleChange(
                              "customHeight",
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>
                    </div>
                  )}

                  <label
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-2)",
                      marginBottom: 8,
                      display: "block",
                    }}
                  >
                    Color palette
                  </label>
                  <div className="palette-swatches">
                    {COLOR_PALETTES.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className={`palette-swatch ${
                          p.id === profile.paletteId ? "active" : ""
                        }`}
                        style={{
                          background: p.background,
                          color: p.text,
                        }}
                        onClick={() => handleChange("paletteId", p.id)}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SOCIAL LINKS */}
                <div className="form-section">
                  <div className="section-header-row">
                    <h3>Social links</h3>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span className="socials-cap-badge">
                        {profile.socials.length}/{MAX_SOCIALS}
                      </span>
                      <button
                        type="button"
                        className={`add-icon-btn ${
                          atLimit ? "add-icon-btn-disabled" : ""
                        }`}
                        onClick={() =>
                          !atLimit && setShowIconPicker(true)
                        }
                        title={
                          atLimit
                            ? "Remove a link to add another"
                            : "Add social link"
                        }
                        disabled={atLimit}
                      >
                        <i className="fa-solid fa-plus" />
                      </button>
                    </div>
                  </div>

                  {profile.socials.length === 0 && (
                    <p className="empty-hint">
                      No links yet — click <strong>+</strong> to add one
                      (max {MAX_SOCIALS}).
                    </p>
                  )}

                  {profile.socials.map((social, index) => (
                    <div
                      key={social.id}
                      className="social-edit-row"
                    >
                      <div className="social-row-top">
                        <i
                          className={social.iconClass}
                          style={{
                            color: "var(--accent)",
                            width: 18,
                            textAlign: "center",
                            flexShrink: 0,
                          }}
                        />
                        <input
                          type="text"
                          value={
                            social.id === "email" &&
                            social.href.startsWith("mailto:")
                              ? social.href.slice("mailto:".length)
                              : social.href
                          }
                          onChange={(e) => {
                            const isEmail = social.id === "email";
                            const val = isEmail
                              ? `mailto:${e.target.value}`
                              : e.target.value;
                            setProfile((prev) => {
                              const s = [...prev.socials];
                              s[index] = { ...s[index], href: val };
                              return { ...prev, socials: s };
                            });
                          }}
                          placeholder={
                            social.id === "email"
                              ? "email@example.com"
                              : "https://..."
                          }
                        />
                        <button
                          type="button"
                          className="social-remove-btn"
                          onClick={() => handleRemoveSocial(index)}
                          title="Remove"
                        >
                          <i className="fa-solid fa-xmark" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {atLimit && (
                    <p className="limit-hint">
                      <i className="fa-solid fa-circle-info" /> Max{" "}
                      {MAX_SOCIALS} links reached. Remove one to add a
                      different icon.
                    </p>
                  )}
                </div>

                {/* PUBLISH & SHARE */}
                <div className="form-section">
                  <h3>Publish &amp; Share</h3>

                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--text-2)",
                      marginBottom: "1rem",
                      lineHeight: 1.5,
                    }}
                  >
                    {myCardId
                      ? "Your card is published! Update it anytime or share your unique link."
                      : "Publish your card to get a unique shareable link that works everywhere."}
                  </p>

                  {/* Publish / Update Button */}
                  <button
                    className="btn-primary"
                    onClick={handlePublish}
                    disabled={publishing}
                    style={{
                      width: "100%",
                      padding: "0.875rem",
                      marginBottom: "1rem",
                      fontSize: "1rem",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                    }}
                  >
                    {publishing ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin" />
                        {myCardId ? "Updating..." : "Publishing..."}
                      </>
                    ) : (
                      <>
                        <i
                          className={
                            myCardId
                              ? "fa-solid fa-arrows-rotate"
                              : "fa-solid fa-rocket"
                          }
                        />
                        {myCardId ? "Update Card" : "Publish Card"}
                      </>
                    )}
                  </button>

                  {/* Published URL Display */}
                  {publishedUrl && (
                    <div
                      style={{
                        padding: "1rem",
                        background: "#f0fdf4",
                        border: "1px solid #86efac",
                        borderRadius: "8px",
                        marginBottom: "1rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <i
                          className="fa-solid fa-circle-check"
                          style={{ color: "#22c55e" }}
                        />
                        <p
                          style={{
                            margin: 0,
                            fontWeight: 600,
                            color: "#166534",
                            fontSize: "0.875rem",
                          }}
                        >
                          {myCardId ? "Card Updated!" : "Card Published!"}
                        </p>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          alignItems: "center",
                        }}
                      >
                        <input
                          type="text"
                          readOnly
                          value={publishedUrl}
                          style={{
                            flex: 1,
                            padding: "0.5rem",
                            fontSize: "0.8rem",
                            border: "1px solid #86efac",
                            borderRadius: "4px",
                            background: "white",
                            color: "#166534",
                            fontFamily: "monospace",
                          }}
                          onClick={(e) => e.target.select()}
                        />
                        <button
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(
                                publishedUrl
                              );
                              alert("✅ Link copied!");
                            } catch (err) {
                              alert("Please copy the link manually");
                            }
                          }}
                          style={{
                            padding: "0.5rem 0.75rem",
                            background: "#22c55e",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                          }}
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* EMBED & EXPORT */}
                <div className="form-section">
                  <h3>Embed &amp; Export</h3>

                  {!myCardId ? (
                    <div
                      style={{
                        padding: "1.5rem",
                        background: "#fef3c7",
                        border: "1px solid #fbbf24",
                        borderRadius: "8px",
                        textAlign: "center",
                      }}
                    >
                      <i
                        className="fa-solid fa-circle-info"
                        style={{
                          fontSize: "1.5rem",
                          color: "#d97706",
                          marginBottom: "0.5rem",
                        }}
                      />
                      <p
                        style={{
                          margin: 0,
                          color: "#78350f",
                          fontWeight: 600,
                        }}
                      >
                        Publish your card first to get the embed code
                      </p>
                    </div>
                  ) : (
                    <div className="embed-block">
                      <div className="embed-tabs">
                        {EMBED_FORMATS.map((fmt) => (
                          <button
                            key={fmt}
                            className={`embed-tab ${
                              embedFormat === fmt ? "active" : ""
                            }`}
                            onClick={() => setEmbedFormat(fmt)}
                          >
                            {fmt}
                          </button>
                        ))}
                      </div>
                      <textarea
                        readOnly
                        className="embed-textarea"
                        value={getEmbedCode()}
                      />
                      <div className="embed-actions">
                        <button
                          className="btn-primary"
                          onClick={() => handleCopy(getEmbedCode())}
                        >
                          {copied ? "✓ Copied!" : "Copy embed code"}
                        </button>
                        <button
                          className="btn-ghost btn-export-png"
                          onClick={handleDownloadPng}
                          disabled={downloading}
                          title="Download card as PNG image"
                        >
                          <i className="fa-solid fa-download" />
                          {downloading ? "Exporting…" : "Export PNG"}
                        </button>
                      </div>

                      <p className="export-note">
                        <i className="fa-solid fa-circle-info" /> PNG export
                        captures the live preview at 2× resolution — great
                        for sharing on LinkedIn, email signatures, or slide
                        decks.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Live Preview – only when authenticated */}
        {isAuthenticated && (
          <div className="preview-pane">
            <div className="preview-label">Live Preview</div>
            <div className="preview-wrapper">
              <div className="preview-glow" />
              <div
                id="ecard-preview"
                className={`ecard ecard-${sizeKey}`}
                style={{
                  width: `${size.width}px`,
                  minHeight: `${size.height}px`,
                  background: selectedPalette.background,
                  color: selectedPalette.text,
                  "--card-bg": selectedPalette.background,
                  "--card-text": selectedPalette.text,
                }}
              >
                {/* Photo */}
                {profile.showImage && size.photoHeight > 0 && (
                  <div
                    style={{
                      height: size.photoHeight,
                      width: "100%",
                      overflow: "hidden",
                      flexShrink: 0,
                      backgroundImage: `url(${profile.photo})`,
                      backgroundSize: "cover",
                      backgroundPosition: `${
                        (profile.focalPoint || { x: 50, y: 30 }).x
                      }% ${
                        (profile.focalPoint || { x: 50, y: 30 }).y
                      }%`,
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                )}

                {/* Inner content */}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    padding: "14px 16px 14px",
                  }}
                >
                  <ProfileInfo profile={profile} size={size} />
                  <Contact
                    profile={profile}
                    onShare={() => handleCopy(window.location.href)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default BuilderApp;
