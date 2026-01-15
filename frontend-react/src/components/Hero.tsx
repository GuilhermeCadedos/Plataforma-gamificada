import React from "react";
import { useNavigate } from "react-router-dom";

const Hero: React.FC = () => {
  const navigate = useNavigate();
  return (
    <section className="relative overflow-hidden">
      <div className="container-page py-10 md:py-14">
        <div className="relative rounded-2xl p-8 md:p-12 bg-gradient-to-r from-bridgeBlue-800 to-bridgeTeal-600 text-white shadow-xl">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Ponte do Saber
            </h1>
            <p className="mt-3 text-white/90">
              Conectando você ao conhecimento com aulas, vídeos, quizzes e um
              tutor inteligente. Aprenda no seu ritmo e avance de nível.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="#sidebar-modulos"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById("sidebar-modulos");
                  if (el)
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                  else window.location.hash = "sidebar-modulos";
                }}
                className="btn bg-bridgeGold-500 text-gray-900 hover:bg-bridgeGold-600 px-4 py-2 rounded-md"
                aria-label="Explorar módulos"
              >
                Explorar módulos
              </a>
              <a
                href="/trilhas"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/trilhas");
                }}
                className="btn btn-outline px-4 py-2 rounded-md"
                aria-label="Trilhas"
              >
                Trilhas
              </a>
            </div>
          </div>
          {/* Decorativo: "ponte" estilizada */}
          <svg
            className="absolute -right-10 -bottom-10 w-64 h-64 opacity-30"
            viewBox="0 0 200 100"
            aria-hidden="true"
          >
            <path d="M0 60 H200" stroke="white" strokeWidth="3" />
            <path
              d="M0 60 C50 20, 150 20, 200 60"
              stroke="white"
              strokeWidth="3"
              fill="none"
            />
            <path
              d="M0 60 C40 0, 160 0, 200 60"
              stroke="white"
              strokeWidth="2"
              fill="none"
            />
            {Array.from({ length: 9 }).map((_, i) => (
              <line
                key={i}
                x1={i * 22 + 10}
                y1={60}
                x2={i * 22 + 10}
                y2={40}
                stroke="white"
                strokeWidth="2"
              />
            ))}
          </svg>
        </div>
      </div>
    </section>
  );
};

export default Hero;
