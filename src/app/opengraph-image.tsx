import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Cwicz Excel — nauka Excela przez zadania";

/**
 * Shared OG card. ASCII-only copy on purpose: satori renders with its
 * bundled default font, which lacks Polish diacritics.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
          background: "#14532d",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          {/* Sheet mark: 3x3 grid with one highlighted cell. */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[0, 1, 2].map((row) => (
              <div key={row} style={{ display: "flex", gap: 6 }}>
                {[0, 1, 2].map((col) => (
                  <div
                    key={col}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 4,
                      background: row === 1 && col === 1 ? "#4ade80" : "#ffffff26",
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 84, fontWeight: 700 }}>Cwicz Excel</div>
        </div>
        <div style={{ fontSize: 38, color: "#bbf7d0" }}>
          Nauka Excela przez zadania — krok po kroku, w przegladarce
        </div>
      </div>
    ),
    size,
  );
}
