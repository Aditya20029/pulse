import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Pulse, Global News Intelligence Globe";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ORIGIN =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://global-pulse-ai.site";

export default function OpengraphImage() {
  const globe = 460;
  const globeRight = 70;
  const globeTop = 90;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#000000",
          color: "#e2e8f0",
          fontFamily: "monospace",
          padding: 64,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* faint space wash behind everything */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 70% 60% at 72% 45%, #08263d 0%, #02060c 55%, #000000 100%)",
            display: "flex",
          }}
        />

        {/* GLOBE: real Earth texture clipped to a sphere */}
        <div
          style={{
            position: "absolute",
            right: globeRight,
            top: globeTop,
            width: globe,
            height: globe,
            borderRadius: "50%",
            overflow: "hidden",
            display: "flex",
            boxShadow:
              "0 0 110px 8px rgba(60,150,255,0.45), inset 0 0 60px rgba(0,0,0,0.4)",
            border: "1px solid rgba(125,211,252,0.45)",
          }}
        >
          {/* equator band of the day texture (least distorted) */}
          <img
            src={`${ORIGIN}/textures/earth_day.jpg`}
            width={globe + 180}
            height={globe}
            style={{
              objectFit: "cover",
              filter: "brightness(0.92) saturate(1.05)",
            }}
          />
          {/* limb darkening + light from upper-left = fakes a sphere */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              background:
                "radial-gradient(circle at 36% 30%, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 38%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              background:
                "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 48%, rgba(0,0,0,0.55) 82%, rgba(0,0,0,0.9) 100%)",
            }}
          />
        </div>

        {/* brand mark */}
        <div
          style={{ display: "flex", alignItems: "center", gap: 16, zIndex: 1 }}
        >
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
            maxWidth: 660,
            color: "#f1f5f9",
            zIndex: 1,
          }}
        >
          Global News Intelligence Globe
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 26,
            color: "#94a3b8",
            maxWidth: 620,
            zIndex: 1,
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
            zIndex: 1,
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
