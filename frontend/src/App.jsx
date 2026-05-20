import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import { useEffect } from "react";
import { getCurrentUser } from "./services/api";
import { useDispatch, useSelector } from 'react-redux'
import History from "./pages/History";
import Notes from "./pages/Notes";
import Pricing from "./pages/Pricing";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import Questions from "./pages/Questions";
import Roadmap from "./pages/Roadmap";
export const serverUrl = "http://localhost:8000"

function App() {
  const dispatch = useDispatch()
  useEffect(() => {
    getCurrentUser(dispatch)
  }, [dispatch])


  const { userData } = useSelector((state) => state.user)
  console.log(userData);

  return (
    <>
      <Routes>
        {/* Home Route: Logged in hai toh Home, warna Auth */}
        <Route path="/" element={userData ? <Home /> : <Navigate to="/auth" replace />} />

        {/* Auth Route: Logged in hai toh wapas Home, warna Auth page */}
        <Route path="/auth" element={userData ? <Navigate to="/" replace /> : <Auth />} />

        {/* History Route: Logged in hai toh History dikhao, warna Auth par bhejo */}
        <Route path="/history" element={userData ? <History /> : <Navigate to="/auth" replace />} />

        {/* Notes Route: Logged in hai toh Notes dikhao, warna Auth par bhejo */}
        <Route path="/notes" element={userData ? <Notes /> : <Navigate to="/auth" replace />} />

        {/* Pricing Route: Logged in hai toh Pricing dikhao, warna Auth par bhejo */}
        <Route path="/pricing" element={userData ? <Pricing /> : <Navigate to="/auth" replace />} />

        {/* Questions Route */}
        <Route path="/questions" element={userData ? <Questions /> : <Navigate to="/auth" replace />} />

        {/* Roadmap Route */}
        <Route path="/roadmap" element={userData ? <Roadmap /> : <Navigate to="/auth" replace />} />

        <Route path="/payment-success" element={<PaymentSuccess/>}/>
        <Route path="/payment-failed" element={<PaymentFailed/>}/>
      </Routes>
    </>
  );
};

export default App;
