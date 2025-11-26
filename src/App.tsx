import { useState, useCallback } from "react";
import Wordle from "./Wordle";

const App = () => {
  const [boardKeyStates, setBoardKeyStates] = useState(() =>
    Array.from({ length: 4 }, () => ({} as Record<string, string>))
  );

  const handleReport = useCallback(
    (boardIndex: number, map: Record<string, string>) => {
      setBoardKeyStates((prev) => {
        const copy = prev.map((m) => ({ ...m }));
        copy[boardIndex] = map;
        return copy;
      });
    },
    []
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        height: "100vh",
        padding: "8px",
        gap: "8px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "8px",
          maxWidth: "480px",
          width: "100%",
        }}
      >
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              width: "100%",
            }}
          >
            <Wordle id={i} onReport={handleReport} />
          </div>
        ))}
      </div>

      <Keyboard boardKeyStates={boardKeyStates} />
    </div>
  );
};

export default App;

function Keyboard({
  boardKeyStates,
}: {
  boardKeyStates: Record<string, string>[];
}) {
  const rows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

  const dispatchKey = (key: string) => {
    const ev = new KeyboardEvent("keydown", { key });
    window.dispatchEvent(ev);
  };

  const stateToColor = (s?: string) => {
    if (!s) return "#ffffff";
    if (s === "correct") return "#6aaa64"; // green
    if (s === "present") return "#c9b458"; // golden
    if (s === "absent") return "#787c7e"; // gray
    return "#ffffff";
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        alignItems: "center",
        padding: "4px 0",
        width: "100%",
        maxWidth: "480px",
      }}
    >
      {rows.map((row, ri) => (
        <div
          key={ri}
          style={{
            display: "flex",
            gap: 4,
            justifyContent: "center",
            width: "100%",
          }}
        >
          {ri === 2 && (
            <button
              onClick={() => dispatchKey("Enter")}
              style={{
                padding: "4px 6px",
                minWidth: 48,
                height: 32,
                borderRadius: 4,
                fontWeight: 600,
                fontSize: "12px",
              }}
            >
              Enter
            </button>
          )}

          {row.split("").map((k) => {
            const letter = k.toLowerCase();
            const quadrants = [0, 1, 2, 3].map((bi) =>
              stateToColor(boardKeyStates[bi]?.[letter])
            );

            return (
              <button
                key={k}
                onClick={() => dispatchKey(k)}
                style={{
                  position: "relative",
                  width: 38,
                  height: 32,
                  padding: 0,
                  borderRadius: 4,
                  border: "1px solid #d3d6da",
                  background: "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: "50%",
                    height: "50%",
                    background: quadrants[0],
                    borderTopLeftRadius: 6,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    width: "50%",
                    height: "50%",
                    background: quadrants[1],
                    borderTopRightRadius: 6,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    bottom: 0,
                    width: "50%",
                    height: "50%",
                    background: quadrants[2],
                    borderBottomLeftRadius: 6,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    bottom: 0,
                    width: "50%",
                    height: "50%",
                    background: quadrants[3],
                    borderBottomRightRadius: 6,
                  }}
                />
                <span
                  style={{
                    position: "relative",
                    zIndex: 2,
                    fontWeight: 700,
                    color: "#000",
                  }}
                >
                  {k}
                </span>
              </button>
            );
          })}

          {ri === 2 && (
            <button
              onClick={() => dispatchKey("Backspace")}
              style={{
                padding: "4px 6px",
                minWidth: 48,
                height: 32,
                borderRadius: 4,
                fontWeight: 600,
                fontSize: "12px",
              }}
            >
              ⌫
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
