import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="mt-12 border-t border-gray-200 dark:border-gray-800">
      <div className="container-page py-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-bridgeBlue-700 text-white font-bold">
            PS
          </span>
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              Ponte do Saber
            </p>
            <p className="text-sm text-gray-600">
              Aprenda no seu ritmo com aulas, vídeos e quizzes.
            </p>
          </div>
        </div>
        <nav className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="font-semibold mb-2">Navegação</p>
            <ul className="space-y-1">
              <li>
                <a href="/aluno" className="hover:underline">
                  Aluno
                </a>
              </li>
              <li>
                <a href="/admin" className="hover:underline">
                  Admin
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-2">Recursos</p>
            <ul className="space-y-1">
              <li>
                <a
                  href="#sidebar-modulos"
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById("sidebar-modulos");
                    if (el)
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                    else window.location.hash = "sidebar-modulos";
                  }}
                  className="hover:underline"
                >
                  Módulos
                </a>
              </li>
              <li>
                <a
                  href="#video"
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById("video");
                    if (el)
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                    else window.location.hash = "video";
                  }}
                  className="hover:underline"
                >
                  Vídeos
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-2">Suporte</p>
            <ul className="space-y-1">
              <li>
                <a href="#" className="hover:underline">
                  Perguntas frequentes
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Contato
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>
      <div className="bg-gray-100 dark:bg-gray-900/30">
        <div className="container-page py-4 text-xs text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} Ponte do Saber. Todos os direitos
          reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
