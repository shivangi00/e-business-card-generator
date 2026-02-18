// src/eCard/Contact.jsx
function Contact({ profile, size, onShare }) {
  return (
    <div className="contact">
      <div
        className="socials"
        style={{ gap: size.gap }}
      >
        {profile.socials.map((social) => (
          <a
            key={social.id}
            href={social.href}
            target="_blank"
            rel="noreferrer"
          >
            <i className={social.iconClass}></i>
          </a>
        ))}
        <a onClick={onShare}>
          <i className="fa-solid fa-share-nodes"></i>
        </a>
      </div>
    </div>
  );
}

export default Contact;
