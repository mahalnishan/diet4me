import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg,#f8fafc,#eef6f3)",
          borderRadius: 24,
          padding: 48,
          color: "#0f172a",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 20,
              background: "#10b981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 56,
              fontWeight: 800,
            }}
          >
            D
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 54, fontWeight: 800 }}>Diet4Me</div>
            <div style={{ fontSize: 28, color: "#065f46" }}>
              AI‑Powered Personalized Weekly Meal Plans
            </div>
          </div>
        </div>

        <div style={{ height: 36 }} />

        <div
          style={{
            fontSize: 28,
            lineHeight: 1.4,
            textAlign: "center",
            maxWidth: 900,
            color: "#334155",
          }}
        >
          Generate a clean, nutritionist‑style weekly meal plan instantly. Enter
          your profile and get a tailored 7‑day plan with meals and hydration
          guidance.
        </div>

        <div style={{ position: "absolute", bottom: 36, right: 48, color: "#0f172a", fontSize: 24 }}>
          diet4me.vercel.app
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}


