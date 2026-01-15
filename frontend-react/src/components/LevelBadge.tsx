import React from "react";

type LevelBadgeProps = {
  level?: number | null;
  xp?: number | null;
  xpToNextLevel?: number | null;
  avatarUrl?: string | null;
  size?: number; // avatar diameter
  showAvatar?: boolean; // when false, render only arc + texts
  variant?: "semi" | "full"; // arc style
};

// Compact level indicator with a semicircle progress around the avatar
const LevelBadge: React.FC<LevelBadgeProps> = ({
  level = 1,
  xp = 0,
  xpToNextLevel = 100,
  avatarUrl,
  size = 72,
  showAvatar = true,
  variant = "semi",
}) => {
  const [imgError, setImgError] = React.useState(false);
  const radius = size / 2;
  const strokeWidth = 8;
  const arcRadius = radius + strokeWidth / 2 + 2;
  const progress = Math.max(
    0,
    Math.min(1, (Number(xp) || 0) / (Number(xpToNextLevel) || 100))
  );

  // Values for semicircle
  const cx = size / 2;
  const cy = size / 2;
  const x1 = cx - arcRadius;
  const y1 = cy;
  const x2 = cx + arcRadius;
  const y2 = cy;
  const d = `M ${x1} ${y1} A ${arcRadius} ${arcRadius} 0 0 1 ${x2} ${y2}`;
  const semiLength = Math.PI * arcRadius;
  const semiDashArray = `${semiLength} ${semiLength}`;
  const semiDashOffset = semiLength * (1 - progress);

  // Values for full circle
  const circleR = radius + strokeWidth / 2;
  const circleCirc = 2 * Math.PI * circleR;
  const circleDashArray = circleCirc;
  const circleDashOffset = circleCirc * (1 - progress);

  const remaining = Math.max(
    0,
    (Number(xpToNextLevel) || 0) - (Number(xp) || 0)
  );

  return (
    <div className="relative inline-flex items-center">
      <svg
        width={size + strokeWidth * 2}
        height={
          variant === "full" ? size + strokeWidth * 2 : size + strokeWidth
        }
        viewBox={`0 0 ${size + strokeWidth * 2} ${
          variant === "full" ? size + strokeWidth * 2 : size + strokeWidth
        }`}
      >
        <defs>
          <linearGradient id="lvlGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
        {variant === "semi" ? (
          <>
            {/* Background arc */}
            <path
              d={d}
              stroke="#e5e7eb"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Progress arc with gradient */}
            <path
              d={d}
              stroke="url(#lvlGrad)"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={semiDashArray}
              strokeDashoffset={semiDashOffset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 800ms ease" }}
            />
          </>
        ) : (
          <g transform={`translate(${strokeWidth}, ${strokeWidth})`}>
            {/* Background circle */}
            <circle
              cx={radius}
              cy={radius}
              r={circleR}
              stroke="#e5e7eb"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Progress circle: start at top (-90deg) */}
            <circle
              cx={radius}
              cy={radius}
              r={circleR}
              stroke="url(#lvlGrad)"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circleDashArray}
              strokeDashoffset={circleDashOffset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 800ms ease" }}
              transform={`rotate(-90 ${radius} ${radius})`}
            />
          </g>
        )}
      </svg>
      {showAvatar && (
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
          <div
            className="rounded-full overflow-hidden shadow"
            style={{ width: size, height: size }}
          >
            {avatarUrl && !imgError ? (
              <img
                src={avatarUrl}
                alt="avatar"
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-600">
                PS
              </div>
            )}
          </div>
        </div>
      )}
      <div className="ml-3">
        <div className="text-sm font-bold text-blue-800">
          Nível {level ?? "-"}
        </div>
        <div
          className="text-xs font-semibold text-blue-900/90 px-2 py-1 rounded-md border border-blue-200"
          style={{
            backgroundImage: "linear-gradient(to right, #eff6ff, #f0fdff)",
          }}
        >
          {remaining > 0
            ? `${remaining} XP para o próximo nível`
            : "Nível alcançado!"}
        </div>
      </div>
    </div>
  );
};

export default LevelBadge;
