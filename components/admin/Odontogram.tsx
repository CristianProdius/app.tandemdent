"use client";

import { TOOTH_CONDITIONS, TOOTH_NAMES, TOOTH_NUMBERS } from "@/constants";
import { cn } from "@/lib/utils";
import { ToothCondition } from "@/types/appwrite.types";

interface OdontogramProps {
  toothConditions: Record<number, ToothCondition>;
  selectedTooth: number | null;
  onToothClick: (toothNumber: number) => void;
}

// SVG paths for different tooth types
const TOOTH_PATHS = {
  molar: "M 0,0 C -8,-2 -12,2 -12,10 C -12,18 -8,24 0,24 C 8,24 12,18 12,10 C 12,2 8,-2 0,0",
  premolar: "M 0,0 C -6,-2 -9,2 -9,9 C -9,16 -6,20 0,20 C 6,20 9,16 9,9 C 9,2 6,-2 0,0",
  canine: "M 0,0 C -4,-2 -7,3 -7,10 C -7,17 -4,22 0,22 C 4,22 7,17 7,10 C 7,3 4,-2 0,0",
  incisor: "M 0,0 C -5,-1 -8,4 -8,10 C -8,16 -5,20 0,20 C 5,20 8,16 8,10 C 8,4 5,-1 0,0",
};

// Get tooth type based on FDI number
const getToothType = (toothNumber: number): keyof typeof TOOTH_PATHS => {
  const lastDigit = toothNumber % 10;
  if (lastDigit >= 6) return "molar";
  if (lastDigit >= 4) return "premolar";
  if (lastDigit === 3) return "canine";
  return "incisor";
};

// Get fill color based on condition
const getToothFillColor = (condition?: ToothCondition): string => {
  switch (condition) {
    case "caries":
      return "#fef9c3"; // yellow-100
    case "decay":
      return "#fef08a"; // yellow-200
    case "fracture":
      return "#fed7aa"; // orange-100
    case "missing":
      return "#e5e7eb"; // gray-200
    case "filled":
      return "#dbeafe"; // blue-100
    case "crown":
      return "#f6f0d4"; // gold-100
    case "root_canal":
      return "#f3e8ff"; // purple-100
    case "implant":
      return "#ccfbf1"; // teal-100
    default:
      return "#ffffff"; // white
  }
};

interface ToothProps {
  toothNumber: number;
  x: number;
  y: number;
  condition?: ToothCondition;
  isSelected: boolean;
  onClick: () => void;
}

const Tooth = ({ toothNumber, x, y, condition, isSelected, onClick }: ToothProps) => {
  const toothType = getToothType(toothNumber);
  const fillColor = getToothFillColor(condition);
  const isMissing = condition === "missing";

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={onClick}
      className="cursor-pointer transition-transform duration-200 hover:scale-110"
      role="button"
      aria-label={`Dinte ${toothNumber}: ${TOOTH_NAMES[toothNumber]}`}
    >
      {/* Tooth shape */}
      <path
        d={TOOTH_PATHS[toothType]}
        fill={fillColor}
        stroke={isSelected ? "#d4af37" : "#9ca3af"}
        strokeWidth={isSelected ? 2 : 1}
        className={cn(
          "transition-all duration-200",
          isSelected && "drop-shadow-md"
        )}
      />

      {/* X mark for missing teeth */}
      {isMissing && (
        <>
          <line
            x1="-6"
            y1="4"
            x2="6"
            y2="16"
            stroke="#6b7280"
            strokeWidth="2"
          />
          <line
            x1="6"
            y1="4"
            x2="-6"
            y2="16"
            stroke="#6b7280"
            strokeWidth="2"
          />
        </>
      )}

      {/* Tooth number */}
      <text
        y={toothNumber < 30 ? 35 : -8}
        textAnchor="middle"
        fontSize="9"
        fill="#6b7280"
        fontWeight={isSelected ? "bold" : "normal"}
      >
        {toothNumber}
      </text>
    </g>
  );
};

export function Odontogram({
  toothConditions,
  selectedTooth,
  onToothClick,
}: OdontogramProps) {
  const toothSpacing = 32;
  const rowGap = 90;
  const startX = 30;
  const startY = 50;

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-2 text-xs">
        {Object.entries(TOOTH_CONDITIONS).map(([key, { label, color }]) => (
          <div key={key} className="flex items-center gap-1">
            <div className={cn("size-3 rounded border border-gray-300", color)} />
            <span className="text-gray-600">{label}</span>
          </div>
        ))}
      </div>

      <svg
        viewBox="0 0 560 220"
        className="w-full max-w-2xl mx-auto"
        role="img"
        aria-label="Odontogramă - Diagramă dentară"
      >
        {/* Background */}
        <rect
          x="0"
          y="0"
          width="560"
          height="220"
          fill="transparent"
          rx="12"
        />

        {/* Center divider line */}
        <line
          x1="280"
          y1="20"
          x2="280"
          y2="200"
          stroke="#e5e7eb"
          strokeWidth="1"
          strokeDasharray="4,4"
        />

        {/* Horizontal divider */}
        <line
          x1="20"
          y1="110"
          x2="540"
          y2="110"
          stroke="#e5e7eb"
          strokeWidth="1"
          strokeDasharray="4,4"
        />

        {/* Quadrant labels */}
        <text x="140" y="18" textAnchor="middle" fontSize="10" fill="#9ca3af">
          Superior Drept
        </text>
        <text x="420" y="18" textAnchor="middle" fontSize="10" fill="#9ca3af">
          Superior Stâng
        </text>
        <text x="140" y="215" textAnchor="middle" fontSize="10" fill="#9ca3af">
          Inferior Drept
        </text>
        <text x="420" y="215" textAnchor="middle" fontSize="10" fill="#9ca3af">
          Inferior Stâng
        </text>

        {/* Upper Right (18-11) - right to left towards center */}
        {TOOTH_NUMBERS.upperRight.map((toothNum, index) => (
          <Tooth
            key={toothNum}
            toothNumber={toothNum}
            x={startX + index * toothSpacing}
            y={startY}
            condition={toothConditions[toothNum]}
            isSelected={selectedTooth === toothNum}
            onClick={() => onToothClick(toothNum)}
          />
        ))}

        {/* Upper Left (21-28) - left to right from center */}
        {TOOTH_NUMBERS.upperLeft.map((toothNum, index) => (
          <Tooth
            key={toothNum}
            toothNumber={toothNum}
            x={290 + index * toothSpacing}
            y={startY}
            condition={toothConditions[toothNum]}
            isSelected={selectedTooth === toothNum}
            onClick={() => onToothClick(toothNum)}
          />
        ))}

        {/* Lower Right (48-41) - right to left towards center */}
        {TOOTH_NUMBERS.lowerRight.map((toothNum, index) => (
          <Tooth
            key={toothNum}
            toothNumber={toothNum}
            x={startX + index * toothSpacing}
            y={startY + rowGap}
            condition={toothConditions[toothNum]}
            isSelected={selectedTooth === toothNum}
            onClick={() => onToothClick(toothNum)}
          />
        ))}

        {/* Lower Left (31-38) - left to right from center */}
        {TOOTH_NUMBERS.lowerLeft.map((toothNum, index) => (
          <Tooth
            key={toothNum}
            toothNumber={toothNum}
            x={290 + index * toothSpacing}
            y={startY + rowGap}
            condition={toothConditions[toothNum]}
            isSelected={selectedTooth === toothNum}
            onClick={() => onToothClick(toothNum)}
          />
        ))}
      </svg>
    </div>
  );
}
