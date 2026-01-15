import React from "react";

type DailyGoalsProps = {
  count: number;
  target?: number; // default 3
  streak: number; // consecutive days studied
};

const DailyGoals: React.FC<DailyGoalsProps> = ({
  count,
  target = 3,
  streak,
}) => {
  const pct = Math.max(0, Math.min(100, Math.round((count / target) * 100)));
  const circles = Array.from({ length: target });
  return (
    <div className="p-4 rounded-xl shadow-sm border border-gray-200 bg-white">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Metas Diárias</h3>
        <div
          className="flex items-center gap-1 text-orange-600"
          title="Ofensiva (dias seguidos estudando)"
        >
          <span aria-hidden>🔥</span>
          <span className="font-semibold">{streak}</span>
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-1">
        Progresso: {count}/{target} aulas
      </p>
      <div className="mt-3 flex items-center gap-2">
        {circles.map((_, idx) => (
          <div
            key={idx}
            className={`h-4 w-4 rounded-full ${
              idx < count ? "bg-bridgeBlue-700" : "bg-gray-200"
            }`}
            aria-label={idx < count ? "Meta cumprida" : "Meta pendente"}
          />
        ))}
      </div>
      <div className="mt-3">
        <div className="w-full h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-bridgeBlue-700 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default DailyGoals;
