import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Doctor from "./pages/Doctor";
import Pharmacist from "./pages/Pharmacist";
import Patient from "./pages/Patient";

export default function App() {
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState("");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login setRole={setRole} setUserId={setUserId} />} />

        <Route
          path="/doctor"
          element={role === "doctor" ? <Doctor /> : <Navigate to="/" />}
        />

        <Route
          path="/pharmacist"
          element={role === "pharmacist" ? <Pharmacist /> : <Navigate to="/" />}
        />

        <Route
          path="/patient"
          element={role === "patient" ? <Patient nid={userId} /> : <Navigate to="/" />}
        />
      </Routes>
    </BrowserRouter>
  );
}
