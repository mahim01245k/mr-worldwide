// src/components/ui/DivFlagIcon.tsx
"use client";

/**
 * HTML-compatible Flag component.
 * Renders custom SVG paths for China and <img> for others inside a circular div.
 */
export function DivFlagIcon({ code, size = 28 }: { code: string; size?: number }) {
  if (!code) return null;
  const lowerCode = code.toLowerCase();

  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    overflow: "hidden",
    border: "1.5px solid rgba(255,255,255,0.25)",
    flexShrink: 0,
    display: "inline-block",
    position: "relative",
  };

  if (lowerCode === "cn") {
    return (
      <div style={containerStyle}>
        <svg viewBox="0 0 512 512" style={{ width: "100%", height: "100%" }}>
          <path d="M0 0h512v512H0z" fill="rgb(216, 0, 39)" />
          <path
            d="m167.619 167.43 19.541 60.143h63.239l-51.161 37.171 19.542 60.143-51.161-37.17-51.162 37.17 19.542-60.143-51.162-37.171h63.239zM290.787 367.465l-19.187-13.94-19.184 13.939 7.327-22.553-19.185-13.94h23.716l7.326-22.553 7.331 22.553h23.713l-19.185 13.939zM340.837 298.576h-23.714l-7.329 22.554-7.327-22.553-23.716-.001 19.187-13.94-7.329-22.552 19.187 13.937 19.185-13.938-7.329 22.553zM340.837 213.426l-19.185 13.94 7.328 22.551-19.184-13.936-19.187 13.938 7.329-22.555-19.186-13.938 23.715-.001 7.329-22.555 7.327 22.555zM290.787 144.536l-7.327 22.555 19.184 13.938-23.712.001-7.33 22.556-7.328-22.557-23.714.002 19.185-13.941-7.329-22.555 19.184 13.941z"
            fill="rgb(255, 218, 68)"
          />
        </svg>
      </div>
    );
  }

  if (lowerCode === "fr") {
    return (
      <div style={containerStyle}>
        <svg viewBox="0 0 512 512" style={{ width: "100%", height: "100%" }}>
          <path d="M0 0h512v512H0z" fill="rgb(240, 240, 240)" />
          <path d="M0 0h170.663v512H0z" fill="rgb(0, 82, 180)" />
          <path d="M341.337 0H512v512H341.337z" fill="rgb(216, 0, 39)" />
        </svg>
      </div>
    );
  }

  if (lowerCode === "bd") {
    return (
      <div style={containerStyle}>
        <svg viewBox="0 0 512 512" style={{ width: "100%", height: "100%" }}>
          <path d="M0 0h512v512H0z" fill="rgb(0, 106, 78)" />
          <circle cx="230" cy="256" r="102" fill="rgb(244, 42, 65)" />
        </svg>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://flagcdn.com/w80/${lowerCode}.png`}
        alt={code}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
}