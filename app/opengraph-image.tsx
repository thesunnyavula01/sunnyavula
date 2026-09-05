import { ImageResponse } from "next/og";
import { SITE, sections } from "@/content/sections";

export const alt = `${SITE.name}, research, ATT Agency, markets, and leadership`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Section accent colors, same order as `sections` (matches the desk hotspots).
const ACCENTS = ["#b98cff", "#5b8cff", "#33d17a", "#ffcf6b"];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          backgroundColor: "#f3ede2",
          color: "#171717",
        }}
      >
        <div
          style={{
            fontSize: 24,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#8a8377",
          }}
        >
          Longmont, Colorado
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 104, fontWeight: 700, lineHeight: 1.05 }}>
            {SITE.name}
          </div>
          <div style={{ fontSize: 34, marginTop: 20, color: "#4a453c" }}>
            Research, marketing, markets, and leadership. All on one desk.
          </div>
        </div>

        <div style={{ display: "flex", gap: 36 }}>
          {sections.map((s, i) => (
            <div
              key={s.slug}
              style={{ display: "flex", alignItems: "center", gap: 12 }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: ACCENTS[i],
                }}
              />
              <div style={{ fontSize: 26, color: "#4a453c" }}>{s.nav}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
