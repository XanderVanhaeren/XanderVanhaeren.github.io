import React from 'react';

export interface ProjectDiagramProps {
  kind: 'rover' | 'telemetry' | 'pdf';
}

export function ProjectDiagram({ kind }: ProjectDiagramProps) {
  if (kind === 'pdf') {
    return (
      <svg
        className="diagram-svg"
        viewBox="0 0 400 200"
        role="img"
        aria-label="Goodnotes PDF Prep margin expansion, grid paper, and chapter outline diagram"
      >
        <defs>
          <linearGradient id="pdf-margin-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(94, 176, 236, 0.22)" />
            <stop offset="100%" stopColor="rgba(94, 176, 236, 0.04)" />
          </linearGradient>
          <pattern
            id="pdf-grid-pattern"
            width="12"
            height="12"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 12 0 L 0 0 0 12"
              fill="none"
              stroke="rgba(94, 176, 236, 0.24)"
              strokeWidth="0.8"
            />
          </pattern>
        </defs>

        {/* Subtle coordinate grid */}
        <g stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1">
          <line x1="80" y1="0" x2="80" y2="200" />
          <line x1="160" y1="0" x2="160" y2="200" />
          <line x1="240" y1="0" x2="240" y2="200" />
          <line x1="320" y1="0" x2="320" y2="200" />
          <line x1="0" y1="50" x2="400" y2="50" />
          <line x1="0" y1="100" x2="400" y2="100" />
          <line x1="0" y1="150" x2="400" y2="150" />
        </g>

        {/* Outer PDF sheet */}
        <rect
          x="52"
          y="40"
          width="296"
          height="136"
          rx="4"
          fill="rgba(12, 16, 23, 0.55)"
          stroke="rgba(255, 255, 255, 0.22)"
          strokeWidth="1.2"
        />

        {/* Original slide / page area */}
        <rect
          x="64"
          y="50"
          width="156"
          height="116"
          rx="2"
          fill="rgba(255, 255, 255, 0.04)"
          stroke="rgba(255, 255, 255, 0.28)"
          strokeWidth="1"
        />

        {/* Simulated slide content lines */}
        <g stroke="rgba(255, 255, 255, 0.28)" strokeWidth="2" strokeLinecap="round">
          <line x1="78" y1="68" x2="152" y2="68" />
          <line x1="78" y1="84" x2="202" y2="84" />
          <line x1="78" y1="96" x2="188" y2="96" />
          <line x1="78" y1="108" x2="196" y2="108" />
        </g>

        {/* Chapter outline tree markers */}
        <g fill="#5eb0ec">
          <circle cx="80" cy="132" r="2.5" />
          <circle cx="88" cy="146" r="2" />
        </g>
        <g stroke="rgba(94, 176, 236, 0.55)" strokeWidth="1.5" strokeLinecap="round">
          <line x1="88" y1="132" x2="148" y2="132" />
          <line x1="96" y1="146" x2="164" y2="146" />
        </g>

        {/* Added Goodnotes grid-paper note margin */}
        <rect
          x="228"
          y="50"
          width="108"
          height="116"
          rx="2"
          fill="url(#pdf-margin-grad)"
        />
        <rect
          x="228"
          y="50"
          width="108"
          height="116"
          rx="2"
          fill="url(#pdf-grid-pattern)"
          stroke="#5eb0ec"
          strokeWidth="1.4"
          strokeDasharray="4 3"
        />

        {/* Margin expansion arrow */}
        <path
          d="M 212 108 L 236 108 M 231 103 L 236 108 L 231 113"
          fill="none"
          stroke="#5eb0ec"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <text
          x="18"
          y="24"
          fill="rgba(255, 255, 255, 0.62)"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="10"
          letterSpacing="1.2"
        >
          PDF MARGIN // GRID &amp; OUTLINE PREP
        </text>
      </svg>
    );
  }

  if (kind === 'rover') {
    return (
      <svg
        className="diagram-svg"
        viewBox="0 0 400 200"
        role="img"
        aria-label="RCXD autonomous rover terrain contour and waypoint navigation diagram"
      >
        <defs>
          <linearGradient id="rover-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(94, 176, 236, 0.24)" />
            <stop offset="100%" stopColor="rgba(94, 176, 236, 0.03)" />
          </linearGradient>
        </defs>

        {/* Subtle coordinate grid */}
        <g stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1">
          <line x1="80" y1="0" x2="80" y2="200" />
          <line x1="160" y1="0" x2="160" y2="200" />
          <line x1="240" y1="0" x2="240" y2="200" />
          <line x1="320" y1="0" x2="320" y2="200" />
          <line x1="0" y1="50" x2="400" y2="50" />
          <line x1="0" y1="100" x2="400" y2="100" />
          <line x1="0" y1="150" x2="400" y2="150" />
        </g>

        {/* Terrain contour isolines */}
        <g fill="none" stroke="rgba(255, 255, 255, 0.14)" strokeWidth="1.2">
          <path d="M -10 165 Q 75 130, 145 148 T 295 122 T 410 138" />
          <path d="M -10 135 Q 85 95, 165 118 T 310 88 T 410 105" />
          <path d="M -10 102 Q 95 62, 185 88 T 325 58 T 410 72" />
          <path d="M 35 65 Q 120 28, 210 54 T 365 32" stroke="rgba(94, 176, 236, 0.28)" />
        </g>

        {/* Obstacle avoidance zone */}
        <circle
          cx="215"
          cy="102"
          r="24"
          fill="url(#rover-grad)"
          stroke="rgba(94, 176, 236, 0.4)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />

        {/* Waypoint navigation path */}
        <path
          d="M 52 152 C 110 144, 148 110, 180 86 C 215 62, 268 72, 342 54"
          fill="none"
          stroke="#5eb0ec"
          strokeWidth="2"
          strokeDasharray="6 4"
        />

        {/* Waypoint nodes */}
        <g fill="#5eb0ec" stroke="#0c1017" strokeWidth="2">
          <circle cx="52" cy="152" r="5" />
          <circle cx="152" cy="108" r="4" />
          <circle cx="246" cy="72" r="4" />
          <circle cx="342" cy="54" r="5.5" />
        </g>

        {/* Heading vector at final waypoint */}
        <path
          d="M 342 54 L 364 49"
          stroke="#5eb0ec"
          strokeWidth="1.6"
          strokeLinecap="round"
        />

        <text
          x="18"
          y="24"
          fill="rgba(255, 255, 255, 0.62)"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="10"
          letterSpacing="1.2"
        >
          TERRAIN CONTOUR // WAYPOINT NAV
        </text>
      </svg>
    );
  }

  return (
    <svg
      className="diagram-svg"
      viewBox="0 0 400 200"
      role="img"
      aria-label="BikeySens elevation ridge and BLE telemetry waveform diagram"
    >
      <defs>
        <linearGradient id="telemetry-fill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(94, 176, 236, 0.28)" />
          <stop offset="100%" stopColor="rgba(94, 176, 236, 0.0)" />
        </linearGradient>
      </defs>

      {/* Subtle coordinate grid */}
      <g stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1">
        <line x1="80" y1="0" x2="80" y2="200" />
        <line x1="160" y1="0" x2="160" y2="200" />
        <line x1="240" y1="0" x2="240" y2="200" />
        <line x1="320" y1="0" x2="320" y2="200" />
        <line x1="0" y1="50" x2="400" y2="50" />
        <line x1="0" y1="100" x2="400" y2="100" />
        <line x1="0" y1="150" x2="400" y2="150" />
      </g>

      {/* Elevation ridge area */}
      <path
        d="M 0 162 L 45 148 L 95 130 L 145 138 L 200 94 L 255 112 L 315 74 L 365 86 L 400 72 L 400 200 L 0 200 Z"
        fill="url(#telemetry-fill)"
      />

      {/* Elevation ridge profile */}
      <path
        d="M 0 162 L 45 148 L 95 130 L 145 138 L 200 94 L 255 112 L 315 74 L 365 86 L 400 72"
        fill="none"
        stroke="#5eb0ec"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Secondary cadence / speed contour */}
      <path
        d="M 0 176 Q 65 158, 130 166 T 260 144 T 400 132"
        fill="none"
        stroke="rgba(255, 255, 255, 0.24)"
        strokeWidth="1.2"
        strokeDasharray="4 4"
      />

      {/* BLE beacon arcs */}
      <g fill="none" stroke="rgba(94, 176, 236, 0.55)" strokeWidth="1.4">
        <path d="M 326 60 A 14 14 0 0 1 340 74" />
        <path d="M 326 52 A 22 22 0 0 1 348 74" />
        <path d="M 326 44 A 30 30 0 0 1 356 74" />
      </g>

      {/* Telemetry sample markers */}
      <g fill="#5eb0ec" stroke="#0c1017" strokeWidth="2">
        <circle cx="95" cy="130" r="4" />
        <circle cx="200" cy="94" r="4.5" />
        <circle cx="315" cy="74" r="5" />
      </g>

      <text
        x="18"
        y="24"
        fill="rgba(255, 255, 255, 0.62)"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        fontSize="10"
        letterSpacing="1.2"
      >
        ELEVATION RIDGE // BLE TELEMETRY
      </text>
    </svg>
  );
}
