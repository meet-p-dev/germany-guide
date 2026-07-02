import { ImageResponse } from "next/og";

export const alt = "Germany Guide — bureaucracy explained for internationals";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#F6F4EF",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          <svg width="120" height="120" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="14.4" fill="#1A1A1A" />
            <rect x="30.25" y="9.5" width="3.5" height="45" rx="1.75" fill="#F6F4EF" />
            <path d="M14 15 H42 L50 22 L42 29 H14 Z" fill="#FFCE00" />
            <path d="M50 33 H22 L14 40 L22 47 H50 Z" fill="#DD0000" />
          </svg>
          <div style={{ display: "flex", fontSize: "72px", fontWeight: 700, color: "#1A1A1A" }}>
            Germany <span style={{ fontWeight: 500, color: "#6b6b6b", marginLeft: "18px" }}>Guide</span>
          </div>
        </div>
        <div
          style={{
            marginTop: "36px",
            fontSize: "38px",
            color: "#3a3a3a",
            maxWidth: "900px",
            lineHeight: 1.3,
          }}
        >
          German bureaucracy, explained city by city — registration, visas,
          taxes, insurance, with step-by-step checklists.
        </div>
      </div>
    ),
    { ...size }
  );
}
