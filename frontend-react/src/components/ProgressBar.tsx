import React from "react";

interface ProgressBarProps {
  xp: number;
  level: number;
  xpToNextLevel: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  xp,
  level,
  xpToNextLevel,
}) => {
  const percent = Math.min((xp / xpToNextLevel) * 100, 100);
  return (
    <div className="mb-4" role="group" aria-label="Progresso de experiência">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-blue-700">Nível {level}</span>
        <span className="text-sm font-medium text-blue-700">{xp} XP</span>
      </div>
      <div
        className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700"
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${xp} XP de ${xpToNextLevel} XP`}
      >
        <div
          className="bg-blue-700 h-4 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        ></div>
      </div>
      <div className="text-xs text-right text-gray-500 mt-1">
        {xpToNextLevel - xp} XP para o próximo nível
      </div>
    </div>
  );
};

export default ProgressBar;
