// src/eCard/ProfileInfo.jsx
import StatusBtn from "../assets/buttons/StatusBtn.jsx";

function ProfileInfo({ profile, size }) {
  const { photoHeight, nameFont, titleFont, bodyFont, gap } = size;

  return (
    <div
      className="profileInfo"
      style={{
        display: "flex",
        flexDirection: "column",
        rowGap: `${gap}px`,
        fontSize: bodyFont,
      }}
    >
      {profile.showImage && photoHeight > 0 && (
        <div
          className="profilePhoto"
          style={{ height: photoHeight, overflow: "hidden" }}
        >
          <img src={profile.photo} alt="profile" />
        </div>
      )}

      <p className="name" style={{ fontSize: nameFont }}>
        {profile.name}
      </p>
      <p className="title" style={{ fontSize: titleFont }}>
        {profile.title}{" "}
        <a href={profile.cvUrl} target="_blank" rel="noreferrer">
          <i className="fa-solid fa-arrow-up-right-from-square"></i>
        </a>
      </p>
      <StatusBtn status={profile.status.label} type={profile.status.type} />
      <p className="location">
        <i className="fa-sharp fa-solid fa-location-dot"></i>{" "}
        {profile.location}
      </p>
    </div>
  );
}


export default ProfileInfo;
