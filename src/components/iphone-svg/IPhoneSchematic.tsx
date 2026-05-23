import type { AnatomyPart } from "@/lib/iphone-anatomy";

type Variant = "base" | "mini" | "plus" | "pro" | "pro-max" | "se";

type Props = {
  variant: Variant;
  parts: AnatomyPart[];
  generation: string;
};

const REGION_FILL: Record<string, string> = {
  earpiece: "#312e81",
  frontCameraFaceId: "#4c1d95",
  rearWide: "#7c2d12",
  rearUltraWide: "#9a3412",
  rearTelephoto: "#a16207",
  lidar: "#92400e",
  rearSingle: "#7c2d12",
  logicBoard: "#064e3b",
  battery: "#0c4a6e",
  batteryLarge: "#0c4a6e",
  taptic: "#581c87",
  chargingPortLightning: "#9f1239",
  chargingPortUSBC: "#9f1239",
  loudspeaker: "#831843",
  screen: "#0f172a",
  screenLCD: "#0f172a",
  homeButton: "#1f2937",
  backGlass: "#374151",
  cameraControl: "#7c2d12"
};

const REGION_LABEL_COLOR: Record<string, string> = {
  earpiece: "#a5b4fc",
  frontCameraFaceId: "#c4b5fd",
  rearWide: "#fdba74",
  rearUltraWide: "#fdba74",
  rearTelephoto: "#fde047",
  lidar: "#fde047",
  rearSingle: "#fdba74",
  logicBoard: "#6ee7b7",
  battery: "#7dd3fc",
  batteryLarge: "#7dd3fc",
  taptic: "#d8b4fe",
  chargingPortLightning: "#fda4af",
  chargingPortUSBC: "#fda4af",
  loudspeaker: "#f9a8d4",
  homeButton: "#9ca3af",
  cameraControl: "#fdba74"
};

export default function IPhoneSchematic({ variant, parts, generation }: Props) {
  const has = (k: string) => parts.some((p) => p.key === k);

  const isSE = variant === "se";
  const isTall = variant === "plus" || variant === "pro-max";
  const isMini = variant === "mini";
  const isPro = variant === "pro" || variant === "pro-max";

  const width = 280;
  const height = isMini ? 480 : isTall ? 580 : 540;

  const phoneX = 30;
  const phoneY = 20;
  const phoneW = width - 60;
  const phoneH = height - 40;

  const innerX = phoneX + 14;
  const innerY = phoneY + 14;
  const innerW = phoneW - 28;
  const innerH = phoneH - 28;

  const topY = innerY + 8;
  const upperY = topY + (isSE ? 50 : 35);
  const upperH = isSE ? 80 : 110;
  const midY = upperY + upperH + 6;
  const midH = isMini ? 130 : isTall ? 200 : 170;
  const lowerY = midY + midH + 6;
  const lowerH = 50;
  const bottomY = lowerY + lowerH + 6;
  const bottomH = 50;
  const homeY = bottomY + bottomH + 4;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`Interior schematic of ${variant} iPhone showing all components`}
      className="w-full max-w-sm mx-auto"
    >
      <defs>
        <linearGradient id="phone-frame-grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#1f2937" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>

      <rect x={phoneX} y={phoneY} width={phoneW} height={phoneH} rx="30" fill="url(#phone-frame-grad)" stroke="#475569" strokeWidth="1.5" />
      <rect x={innerX} y={innerY} width={innerW} height={innerH} rx="20" fill="#020617" stroke="#334155" strokeWidth="1" />

      <rect x={phoneX - 2} y={midY + 10} width="4" height="22" rx="1" fill="#475569" />
      <rect x={phoneX - 2} y={midY + 38} width="4" height="32" rx="1" fill="#475569" />
      <rect x={phoneX + phoneW - 2} y={midY + 18} width="4" height="42" rx="1" fill="#475569" />

      {has("cameraControl") && (
        <>
          <rect x={phoneX + phoneW - 2} y={midY + 80} width="4" height="18" rx="1" fill="#fbbf24" />
          <text x={phoneX + phoneW + 6} y={midY + 92} fontSize="8" fill="#fbbf24" fontFamily="ui-monospace, monospace">◄ Camera Control</text>
        </>
      )}

      <g>
        {has("earpiece") && (
          <>
            <rect x={innerX + innerW / 2 - 22} y={topY + 2} width="44" height="6" rx="3" fill={REGION_FILL.earpiece} />
            <text x={innerX + innerW / 2} y={topY + 22} fontSize="8" textAnchor="middle" fill={REGION_LABEL_COLOR.earpiece} fontFamily="ui-monospace, monospace">Earpiece</text>
          </>
        )}
        {has("frontCameraFaceId") && (
          <>
            <circle cx={innerX + innerW / 2 + 30} cy={topY + 5} r="4" fill={REGION_FILL.frontCameraFaceId} />
            <text x={innerX + innerW - 8} y={topY + 8} fontSize="8" textAnchor="end" fill={REGION_LABEL_COLOR.frontCameraFaceId} fontFamily="ui-monospace, monospace">Face ID ►</text>
          </>
        )}
      </g>

      <g>
        <rect x={innerX + 6} y={upperY} width={innerW - 12} height={upperH} rx="6" fill="#0f172a" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 2" />
        {has("rearWide") && (
          <>
            <rect x={innerX + 10} y={upperY + 6} width={isPro ? 70 : 60} height={isPro ? 70 : 50} rx="14" fill="#020617" stroke="#1e293b" strokeWidth="1" />
            <circle cx={innerX + 28} cy={upperY + 22} r="10" fill={REGION_FILL.rearWide} stroke="#0a0a0a" strokeWidth="2" />
            <circle cx={innerX + 28} cy={upperY + 22} r="5" fill="#0a0a0a" />
            <text x={innerX + 28} y={upperY + 25} fontSize="6" textAnchor="middle" fill="#fed7aa" fontFamily="ui-monospace, monospace">W</text>
            {has("rearUltraWide") && (
              <>
                <circle cx={innerX + 56} cy={upperY + 22} r="10" fill={REGION_FILL.rearUltraWide} stroke="#0a0a0a" strokeWidth="2" />
                <circle cx={innerX + 56} cy={upperY + 22} r="5" fill="#0a0a0a" />
                <text x={innerX + 56} y={upperY + 25} fontSize="6" textAnchor="middle" fill="#fed7aa" fontFamily="ui-monospace, monospace">U</text>
              </>
            )}
            {has("rearTelephoto") && (
              <>
                <circle cx={innerX + 28} cy={upperY + 52} r="10" fill={REGION_FILL.rearTelephoto} stroke="#0a0a0a" strokeWidth="2" />
                <circle cx={innerX + 28} cy={upperY + 52} r="5" fill="#0a0a0a" />
                <text x={innerX + 28} y={upperY + 55} fontSize="6" textAnchor="middle" fill="#fef3c7" fontFamily="ui-monospace, monospace">T</text>
              </>
            )}
            {has("lidar") && (
              <>
                <circle cx={innerX + 56} cy={upperY + 52} r="6" fill={REGION_FILL.lidar} stroke="#0a0a0a" strokeWidth="1.5" />
                <text x={innerX + 56} y={upperY + 55} fontSize="5" textAnchor="middle" fill="#fef3c7" fontFamily="ui-monospace, monospace">LiDAR</text>
              </>
            )}
            <text x={innerX + (isPro ? 80 : 70)} y={upperY + 16} fontSize="8" fill={REGION_LABEL_COLOR.rearWide} fontFamily="ui-monospace, monospace">◄ Rear cameras</text>
            <text x={innerX + (isPro ? 80 : 70)} y={upperY + 28} fontSize="7" fill="#94a3b8" fontFamily="ui-monospace, monospace">W=Wide U=UltraWide</text>
            {isPro && <text x={innerX + 80} y={upperY + 40} fontSize="7" fill="#94a3b8" fontFamily="ui-monospace, monospace">T=Telephoto</text>}
          </>
        )}
        {has("rearSingle") && (
          <>
            <rect x={innerX + 10} y={upperY + 6} width="40" height="40" rx="10" fill="#020617" stroke="#1e293b" strokeWidth="1" />
            <circle cx={innerX + 30} cy={upperY + 26} r="12" fill={REGION_FILL.rearSingle} stroke="#0a0a0a" strokeWidth="2" />
            <circle cx={innerX + 30} cy={upperY + 26} r="6" fill="#0a0a0a" />
            <text x={innerX + 56} y={upperY + 24} fontSize="8" fill={REGION_LABEL_COLOR.rearSingle} fontFamily="ui-monospace, monospace">◄ Wide camera</text>
            <text x={innerX + 56} y={upperY + 36} fontSize="7" fill="#94a3b8" fontFamily="ui-monospace, monospace">Single 12 MP</text>
          </>
        )}
        {has("logicBoard") && (
          <>
            <rect x={innerX + 6} y={upperY + upperH - 30} width={innerW - 12} height="24" rx="3" fill={REGION_FILL.logicBoard} stroke="#10b981" strokeWidth="0.5" />
            <rect x={innerX + 14} y={upperY + upperH - 26} width="12" height="12" rx="2" fill="#1e293b" stroke="#34d399" strokeWidth="0.5" />
            <rect x={innerX + 30} y={upperY + upperH - 26} width="14" height="14" rx="2" fill="#1e293b" stroke="#34d399" strokeWidth="0.5" />
            <rect x={innerX + 48} y={upperY + upperH - 24} width="8" height="8" rx="1" fill="#1e293b" />
            <rect x={innerX + 60} y={upperY + upperH - 24} width="8" height="8" rx="1" fill="#1e293b" />
            <text x={innerX + innerW - 14} y={upperY + upperH - 14} fontSize="8" textAnchor="end" fill={REGION_LABEL_COLOR.logicBoard} fontFamily="ui-monospace, monospace">Logic board ► A{generation === "11 series" ? "13" : generation === "12 series" ? "14" : generation === "13 series" ? "15" : generation === "14 series" ? "16" : generation === "15 series" ? "17 Pro" : "18 Pro"}</text>
          </>
        )}
      </g>

      <g>
        <rect x={innerX + 12} y={midY} width={innerW - 24} height={midH} rx="6" fill={REGION_FILL.battery} stroke="#0ea5e9" strokeWidth="1" />
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={i} x1={innerX + 18} y1={midY + 12 + i * (midH / 7)} x2={innerX + innerW - 18} y2={midY + 12 + i * (midH / 7)} stroke="#0c4a6e" strokeOpacity="0.6" strokeWidth="0.5" />
        ))}
        <text x={innerX + innerW / 2} y={midY + midH / 2 - 2} fontSize="14" textAnchor="middle" fill="#bae6fd" fontFamily="ui-monospace, monospace" fontWeight="bold">🔋</text>
        <text x={innerX + innerW / 2} y={midY + midH / 2 + 14} fontSize="9" textAnchor="middle" fill="#bae6fd" fontFamily="ui-monospace, monospace">{has("batteryLarge") ? "Battery (4400 mAh)" : isMini ? "Battery (2400 mAh)" : "Battery"}</text>
        <text x={innerX + innerW / 2} y={midY + midH / 2 + 26} fontSize="7" textAnchor="middle" fill="#7dd3fc" fontFamily="ui-monospace, monospace">Lithium-ion · adhesive-pull</text>
      </g>

      <g>
        {has("taptic") && (
          <>
            <rect x={innerX + 14} y={lowerY + 8} width={(innerW - 28) * 0.45} height={lowerH - 16} rx="4" fill={REGION_FILL.taptic} stroke="#a855f7" strokeWidth="0.5" />
            <text x={innerX + 14 + ((innerW - 28) * 0.45) / 2} y={lowerY + lowerH / 2 + 3} fontSize="8" textAnchor="middle" fill={REGION_LABEL_COLOR.taptic} fontFamily="ui-monospace, monospace">Taptic Engine</text>
          </>
        )}
      </g>

      <g>
        {has("loudspeaker") && (
          <>
            <rect x={innerX + 16} y={bottomY + 12} width="56" height="24" rx="3" fill={REGION_FILL.loudspeaker} stroke="#f472b6" strokeWidth="0.5" />
            {Array.from({ length: 6 }).map((_, i) => (
              <line key={i} x1={innerX + 22 + i * 8} y1={bottomY + 16} x2={innerX + 22 + i * 8} y2={bottomY + 32} stroke="#fb7185" strokeWidth="0.8" />
            ))}
            <text x={innerX + 44} y={bottomY + 45} fontSize="7" textAnchor="middle" fill={REGION_LABEL_COLOR.loudspeaker} fontFamily="ui-monospace, monospace">Speaker</text>
          </>
        )}
        {(has("chargingPortLightning") || has("chargingPortUSBC")) && (
          <>
            <rect x={innerX + innerW - 70} y={bottomY + 16} width="48" height="16" rx="6" fill="#1f2937" stroke="#fb7185" strokeWidth="1" />
            <rect x={innerX + innerW - 64} y={bottomY + 20} width="36" height="8" rx="3" fill="#0a0a0a" />
            <text x={innerX + innerW - 46} y={bottomY + 45} fontSize="7" textAnchor="middle" fill="#fda4af" fontFamily="ui-monospace, monospace">{has("chargingPortUSBC") ? "USB-C" : "Lightning"}</text>
          </>
        )}
      </g>

      {has("homeButton") && (
        <g>
          <circle cx={innerX + innerW / 2} cy={homeY + 16} r="14" fill="#1f2937" stroke="#475569" strokeWidth="1" />
          <circle cx={innerX + innerW / 2} cy={homeY + 16} r="9" fill="none" stroke="#64748b" strokeWidth="0.5" />
          <text x={innerX + innerW / 2} y={homeY + 40} fontSize="7" textAnchor="middle" fill="#94a3b8" fontFamily="ui-monospace, monospace">Touch ID</text>
        </g>
      )}

      <text x={width / 2} y={height - 6} fontSize="7" textAnchor="middle" fill="#64748b" fontFamily="ui-monospace, monospace">Schematic — components labeled by region</text>
    </svg>
  );
}
