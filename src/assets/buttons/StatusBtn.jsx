// StatusBtn.jsx
function StatusBtn({ status, type, func = null }) {
  switch (status) {
    case "Available":
      return (
        <button className="status-btn btn-style">
          <i className="fa-solid fa-circle online"></i>&nbsp; Available for {type}
        </button>
      );
    case "Employed":
      return (
        <button className="status-btn btn-style">
          <i className="fa-solid fa-circle-check busy"></i>&nbsp; Working at {type}
        </button>
      );
    case "Download":
      return (
        <button onClick={func} className="status-btn btn-style">
          <i className="fa-solid fa-share-nodes"></i>&nbsp; Share my card
        </button>
      );
    default:
      return null;
  }
}

export default StatusBtn;
