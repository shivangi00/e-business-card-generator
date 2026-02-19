// src/App.jsx
import { Routes, Route } from "react-router-dom";
import BuilderApp from "./BuilderApp.jsx";
import CardView from "./eCard/CardView.jsx";

function App() {
  return (
    <Routes>
      {/* Builder page at root */}
      <Route path="/" element={<BuilderApp />} />
      
      {/* Dynamic card view page with unique ID */}
      <Route path="/card/:cardId" element={<CardView />} />
      
      {/* Legacy route for backward compatibility (uses localStorage) */}
      <Route path="/card" element={<CardView />} />
    </Routes>
  );
}

export default App;
