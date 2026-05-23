type Variant = "base" | "mini" | "plus" | "pro" | "pro-max" | "se";

type Props = {
  variant: Variant;
  generation: string;
  className?: string;
  label?: string;
};

const COLORS: Record<Variant, { frame: string; frameStroke: string; bezel: string }> = {
  se: { frame: "#1f2937", frameStroke: "#0f172a", bezel: "#0a0a0a" },
  base: { frame: "#2937a3", frameStroke: "#1e2a78", bezel: "#0a0a0a" },
  mini: { frame: "#065f46", frameStroke: "#064e3b", bezel: "#0a0a0a" },
  plus: { frame: "#1d4ed8", frameStroke: "#1e40af", bezel: "#0a0a0a" },
  pro: { frame: "#374151", frameStroke: "#1f2937", bezel: "#0a0a0a" },
  "pro-max": { frame: "#78350f", frameStroke: "#451a03", bezel: "#0a0a0a" }
};

function hasDynamicIsland(generation: string, variant: Variant) {
  if (variant === "se") return false;
  const gen = parseInt(generation, 10);
  if (variant === "pro" || variant === "pro-max") return gen >= 14;
  return gen >= 15;
}

function hasNotch(generation: string, variant: Variant) {
  return !hasDynamicIsland(generation, variant) && variant !== "se";
}

export default function IPhoneRender({ variant, generation, className, label }: Props) {
  const colors = COLORS[variant];
  const dynamicIsland = hasDynamicIsland(generation, variant);
  const notch = hasNotch(generation, variant);

  const isSmall = variant === "mini";
  const isTall = variant === "plus" || variant === "pro-max";
  const height = isSmall ? 380 : isTall ? 440 : 410;
  const width = 200;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={label || `${variant} iPhone illustration`}
      className={className}
    >
      <defs>
        <linearGradient id={`screen-${variant}-${generation}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="50%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
        <linearGradient id={`frame-${variant}-${generation}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor={colors.frame} stopOpacity="0.9" />
          <stop offset="50%" stopColor={colors.frame} />
          <stop offset="100%" stopColor={colors.frame} stopOpacity="0.85" />
        </linearGradient>
      </defs>

      {/* Frame */}
      <rect
        x="6"
        y="6"
        width={width - 12}
        height={height - 12}
        rx="32"
        fill={`url(#frame-${variant}-${generation})`}
        stroke={colors.frameStroke}
        strokeWidth="1.5"
      />

      {/* Bezel */}
      <rect
        x="14"
        y="14"
        width={width - 28}
        height={height - 28}
        rx="26"
        fill={colors.bezel}
      />

      {/* Screen */}
      <rect
        x="18"
        y="18"
        width={width - 36}
        height={height - 36}
        rx="22"
        fill={`url(#screen-${variant}-${generation})`}
      />

      {/* Dynamic Island */}
      {dynamicIsland && (
        <rect x={width / 2 - 30} y="28" width="60" height="18" rx="9" fill="#0a0a0a" />
      )}

      {/* Notch (pre-14 Pro) */}
      {notch && (
        <path
          d={`M ${width / 2 - 45} 18
              L ${width / 2 - 45} 22
              Q ${width / 2 - 45} 32, ${width / 2 - 35} 32
              L ${width / 2 + 35} 32
              Q ${width / 2 + 45} 32, ${width / 2 + 45} 22
              L ${width / 2 + 45} 18 Z`}
          fill="#0a0a0a"
        />
      )}

      {/* SE: home button */}
      {variant === "se" && (
        <>
          <circle cx={width / 2} cy={height - 28} r="14" fill="#0a0a0a" stroke="#1f2937" strokeWidth="1" />
          <circle cx={width / 2} cy={height - 28} r="9" fill="none" stroke="#2a2a2a" strokeWidth="0.5" />
        </>
      )}

      {/* Speaker grille at top (subtle) */}
      {variant !== "se" && (
        <rect
          x={width / 2 - 18}
          y="23"
          width="36"
          height="2"
          rx="1"
          fill="#1f2937"
          opacity={dynamicIsland ? "0" : "0.6"}
        />
      )}

      {/* Decorative wallpaper glow */}
      <ellipse cx={width / 2} cy={height / 2 + 20} rx="40" ry="60" fill="#1d4ed8" opacity="0.15" />
      <ellipse cx={width / 2 - 30} cy={height / 2 - 30} rx="35" ry="45" fill="#9333ea" opacity="0.12" />

      {/* Side buttons (subtle hint) */}
      <rect x="2" y={height / 2 - 40} width="4" height="20" rx="1" fill={colors.frameStroke} />
      <rect x="2" y={height / 2 - 15} width="4" height="30" rx="1" fill={colors.frameStroke} />
      <rect x={width - 6} y={height / 2 - 25} width="4" height="40" rx="1" fill={colors.frameStroke} />
    </svg>
  );
}
