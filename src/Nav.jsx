// Nav.jsx
import { useEffect, useState } from "react";

function Nav() {

  return (
    <nav className="top-nav">
      <div className="logo">Shivangi Malik</div>

      <div className="nav-links">
        {/* <button onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}>
          Projects
        </button>
        <button onClick={() => document.getElementById("skills")?.scrollIntoView({ behavior: "smooth" })}>
          Skills
        </button>
        <button onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}>
          Contact
        </button> */}
      </div>

      <div className="right-side">
        <button className="book-btn">
          <a href="mailto:someone@example.com">Book a Call</a>
        </button>
      </div>
    </nav>
  );
}

export default Nav;
