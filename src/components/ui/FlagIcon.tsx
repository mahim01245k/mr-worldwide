"use client";
// Renders a circular country flag using flagcdn.com
export function FlagIcon({ code, size = 28 }: { code: string; size?: number }) {
  if (!code) return null;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        border: "1.5px solid rgba(255,255,255,0.25)",
        flexShrink: 0,
        display: "inline-block",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
        alt={code}
        width={size}
        height={size}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
}
