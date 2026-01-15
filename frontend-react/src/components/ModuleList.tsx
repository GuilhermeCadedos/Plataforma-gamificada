import React from "react";

type Lesson = {
  id: number;
  title?: string;
  titulo?: string;
  nome?: string;
  module?: string;
  completed?: boolean;
  url?: string | null;
};

type ModuleListProps = {
  modules: { [module: string]: Lesson[] };
  onSelectLesson: (lesson: Lesson) => void;
  selectedLessonId: number | null;
};

const ModuleList = ({
  modules,
  onSelectLesson,
  selectedLessonId,
}: ModuleListProps) => (
  <div
    className="space-y-4"
    role="navigation"
    aria-label="Lista de módulos e aulas"
  >
    {Object.entries(modules).map(([moduleName, lessons]) => (
      <div key={moduleName}>
        <h2 className="text-lg font-semibold mb-2 text-gray-800 flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full bg-bridgeBlue-700"
            aria-hidden="true"
          ></span>
          {moduleName}
        </h2>
        <ul
          className="space-y-2"
          role="list"
          aria-label={`Aulas do ${moduleName}`}
        >
          {lessons.map((lesson) => {
            const displayTitle =
              lesson.title || lesson.titulo || lesson.nome || "Aula sem título";
            const isCompleted = !!lesson.completed;
            const lessonId = (lesson as any).id;
            return (
              <li
                key={lessonId}
                className={`p-3 rounded-lg cursor-pointer flex items-center justify-between border transition-colors ${
                  selectedLessonId === lessonId
                    ? "bg-blue-50 border-blue-200"
                    : "bg-white hover:bg-gray-50 border-gray-200"
                } ${isCompleted ? "opacity-80" : ""}`}
                role="button"
                tabIndex={0}
                aria-label={`Aula: ${displayTitle}${
                  isCompleted ? " (concluída)" : ""
                }`}
                aria-current={selectedLessonId === lessonId ? "true" : "false"}
                onClick={() => onSelectLesson(lesson)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectLesson(lesson);
                  }
                }}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-md ${
                      isCompleted
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                    aria-hidden="true"
                  >
                    {isCompleted ? "✓" : "▶"}
                  </span>
                  {displayTitle}
                </span>
                {isCompleted && (
                  <span
                    className="text-green-700 text-xs ml-2"
                    aria-label="Concluída"
                  >
                    Concluída
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    ))}
  </div>
);

export default ModuleList;
