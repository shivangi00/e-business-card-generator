// src/App.jsx
import { Routes, Route } from "react-router-dom";
import BuilderApp from "./BuilderApp.jsx";
import CardView from "./eCard/CardView.jsx";

function App() {
  return (
    <Routes>
      {/* Builder page at / */}
      <Route path="/" element={<BuilderApp />} />
      {/* Card-only page at /card */}
      <Route path="/card" element={<CardView />} />
    </Routes>
  );
}

export default App;