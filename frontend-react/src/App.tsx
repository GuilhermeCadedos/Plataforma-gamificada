import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import StudentDashboard from "./pages/StudentDashboard";
import AdminPage from "./pages/AdminPage";
import Login from "./pages/Login";
import TrilhaAprendizado from "./pages/TrilhaAprendizado";
import Profile from "./pages/Profile";
import PerfilUsuario from "./pages/PerfilUsuario";
import QuizDemo from "./pages/QuizDemo";
import Ranking from "./pages/Ranking";
import Register from "./pages/Register";
import Footer from "./components/Footer";
import FloatingChat from "./components/FloatingChat";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/aluno" replace />} />
          <Route path="/aluno" element={<StudentDashboard />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/trilhas" element={<TrilhaAprendizado />} />
          <Route path="/quiz-demo" element={<QuizDemo />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/profile" element={<PerfilUsuario />} />
          <Route path="/entrar" element={<Login />} />
          <Route path="/registrar" element={<Register />} />
        </Routes>
        <Footer />
        <FloatingChat />
      </div>
    </BrowserRouter>
  );
}

export default App;
