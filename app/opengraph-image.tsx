import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Pulse, Global News Intelligence Globe";
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
          background:
            "radial-gradient(ellipse 70% 60% at 65% 45%, #0b2740 0%, #02040a 60%, #000000 100%)",
          color: "#e2e8f0",
          fontFamily: "monospace",
          padding: 64,
          position: "relative",
        }}
      >
        {/* Globe glow circle */}
        <div
          style={{
            position: "absolute",
            right: 90,
            top: 150,
            width: 360,
            height: 360,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 40% 35%, #1d4e6e, #06121e 70%)",
            boxShadow: "0 0 120px 10px rgba(34,211,238,0.35)",
            border: "2px solid rgba(125,211,252,0.5)",
            display: "flex",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "rgba(163,230,53,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#a3e635",
              }}
            />
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: 12,
              color: "#e2e8f0",
            }}
          >
            PULSE
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.05,
            maxWidth: 720,
            color: "#f1f5f9",
          }}
        >
          Global News Intelligence Globe
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 26,
            color: "#94a3b8",
            maxWidth: 680,
          }}
        >
          Real-time world events on an interactive 3D Earth, with
          Claude-powered intelligence briefings.
        </div>
        <div
          style={{
            marginTop: 28,
            display: "flex",
            gap: 14,
            fontSize: 18,
            color: "#67e8f9",
            letterSpacing: 2,
          }}
        >
          <span>THREE.JS</span>
          <span style={{ color: "#3f3f46" }}>·</span>
          <span>CLAUDE OPUS 4.7</span>
          <span style={{ color: "#3f3f46" }}>·</span>
          <span>GDELT · REDDIT · RSS</span>
        </div>
      </div>
    ),
    size,
  );
}
