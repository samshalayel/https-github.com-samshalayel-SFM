interface SeesawIconProps {
  humanPercent: number
  aiPercent: number
  size?: number
}

export default function SeesawIcon({ humanPercent, aiPercent, size = 32 }: SeesawIconProps) {
  // Calculate tilt angle based on the difference
  // When human is heavier (more %), left side goes down (negative angle)
  // When AI is heavier (more %), right side goes down (positive angle)
  const difference = aiPercent - humanPercent
  const maxTilt = 20 // Maximum tilt angle in degrees
  const tiltAngle = (difference / 100) * maxTilt

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Base stand */}
      <path d="M12 16 L12 20" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 20 L15 20" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />

      {/* Seesaw board - rotates based on balance */}
      <g transform={`rotate(${tiltAngle}, 12, 12)`}>
        {/* Main board */}
        <path d="M4 12 L20 12" stroke="#374151" strokeWidth="2" strokeLinecap="round" />

        {/* Left weight (Human) */}
        <circle cx="5" cy="12" r="2.5" fill="#3B82F6" opacity={humanPercent / 100} />

        {/* Right weight (AI) */}
        <circle cx="19" cy="12" r="2.5" fill="#9333EA" opacity={aiPercent / 100} />

        {/* Fulcrum point */}
        <circle cx="12" cy="12" r="1.5" fill="#6B7280" />
      </g>
    </svg>
  )
}
