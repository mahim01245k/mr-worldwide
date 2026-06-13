"use client";

interface FlagIconProps {
  code: string;
  size: number;
  x?: number;
  y?: number;
  isBackground?: boolean;
  clipPathId?: string;
  style?: React.CSSProperties;
}

/**
 * SVG-compatible Flag component.
 * Renders custom SVG paths for China and external images for others.
 * Must be used inside an <svg> or <g> element.
 */
export function FlagIcon({ code, size, x = 0, y = 0, isBackground, clipPathId, style }: FlagIconProps) {
  if (!code) return null;
  const lowerCode = code.toLowerCase();

  // Custom SVG rendering for China (CN)
  if (lowerCode === "cn") {
    const scale = size / 512; // Original paths are 512x512
    return (
       <g clipPath={clipPathId ? `url(#${clipPathId})` : undefined}>
        <g
          transform={`translate(${x}, ${y}) scale(${scale})`}
          style={{ ...style, pointerEvents: "none" }}
        >
          <path d="M0 0h512v512H0z" fill="rgb(216, 0, 39)" />
          <path
            d="m167.619 167.43 19.541 60.143h63.239l-51.161 37.171 19.542 60.143-51.161-37.17-51.162 37.17 19.542-60.143-51.162-37.171h63.239zM290.787 367.465l-19.187-13.94-19.184 13.939 7.327-22.553-19.185-13.94h23.716l7.326-22.553 7.331 22.553h23.713l-19.185 13.939zM340.837 298.576h-23.714l-7.329 22.554-7.327-22.553-23.716-.001 19.187-13.94-7.329-22.552 19.187 13.937 19.185-13.938-7.329 22.553zM340.837 213.426l-19.185 13.94 7.328 22.551-19.184-13.936-19.187 13.938 7.329-22.555-19.186-13.938 23.715-.001 7.329-22.555 7.327 22.555zM290.787 144.536l-7.327 22.555 19.184 13.938-23.712.001-7.33 22.556-7.328-22.557-23.714.002 19.185-13.941-7.329-22.555 19.184 13.941z"
            fill="rgb(255, 218, 68)"
          />
        </g>
      </g>
    );
  }

  // Custom SVG rendering for France (FR)
  if (lowerCode === "fr") {
    const scale = size / 512; // Original paths are 512x512
    return (
      <g 
        clipPath={clipPathId ? `url(#${clipPathId})` : undefined}
        style={{ ...style, pointerEvents: "none" }}
      >
        <g transform={`translate(${x}, ${y}) scale(${scale})`}>
          <path d="M0 0h512v512H0z" fill="rgb(240, 240, 240)" />
          <path d="M0 0h170.663v512H0z" fill="rgb(0, 82, 180)" />
          <path d="M341.337 0H512v512H341.337z" fill="rgb(216, 0, 39)" />
        </g>
      </g>
    );
  }

  // Custom SVG rendering for Bangladesh (BD)
  if (lowerCode === "bd") {
    const scale = size / 512; // Original paths are 512x512
    // Shift slightly to the left if it's a background flag
    const offsetX = isBackground ? x - (size * 0.006) : x;
    return (
      <g 
        clipPath={clipPathId ? `url(#${clipPathId})` : undefined}
        style={{ ...style, pointerEvents: "none" }}
      >
        <g transform={`translate(${offsetX}, ${y}) scale(${scale})`}>
          <path d="M0 0h512v512H0z" fill="rgb(0, 106, 78)" />
          <circle cx="230" cy="256" r="102" fill="rgb(244, 42, 65)" />
        </g>
      </g>
    );
  }

  // Standard image rendering for other countries
  return (
    <image
      href={`https://flagcdn.com/w80/${lowerCode}.png`}
      x={x}
      y={y}
      width={size}
      height={size}
      clipPath={clipPathId ? `url(#${clipPathId})` : undefined}
      preserveAspectRatio="xMidYMid slice"
      style={{ ...style, pointerEvents: "none" }}
    />
  );
}
