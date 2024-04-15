import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Cities from "./views/Cities";
import Weather from "./views/Weather";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Cities />} />
        <Route path="/weather/:details" element={<Weather />} />
      </Routes>
    </Router>
  );
}

export default App;
