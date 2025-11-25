import { useEffect, useState } from "react";
import wordles from "./wordles";
import valid from "./valid";

const GridCell = ({
  cell,
  color,
  isActiveRow,
  isWinRow,
  cellIndex,
  flipDuration,
  flipStagger,
  word,
}) => {
  const isFilled = cell !== "";

  let className = "";
  let animationDelay = "0ms";

  const bounceStagger = 100;

  if (isActiveRow) {
    if (isWinRow) {
      className = "flip-then-bounce";
      const flipDelay = cellIndex * flipStagger;
      const bounceDelay =
        flipDuration + flipStagger * 4 + bounceStagger * cellIndex;
      animationDelay = `${flipDelay}ms, ${bounceDelay}ms`;
    } else {
      className = "flip";
      animationDelay = `${cellIndex * flipStagger}ms`;
    }
  }

  const borderStyle =
    color === "#fff" && isFilled
      ? "2px solid #565758"
      : color === "#fff" && !isFilled
      ? "2px solid #d3d6da"
      : "2px solid transparent";

  return (
    <div
      className={className}
      style={{
        animationDelay,
        border: borderStyle,
        backgroundColor: color,
        width: "100%",
        paddingTop: "100%",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "min(32px, 6vw)",
          fontFamily: "Clear Sans",
          fontWeight: "bold",
          color: color === "#fff" ? "#000" : "#fff",
        }}
      >
        {cell}
      </div>
    </div>
  );
};

const Wordle = ({ id, onReport }: any) => {
  const [word] = useState(() =>
    wordles[Math.floor(Math.random() * wordles.length)].toUpperCase()
  );
  const [guess, setGuess] = useState("");
  const [grid, setGrid] = useState(
    Array.from({ length: 9 }, () => Array.from({ length: 5 }, () => ""))
  );
  const [colors, setColors] = useState(
    Array.from({ length: 9 }, () => Array.from({ length: 5 }, () => "#fff"))
  );
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);
  const [message, setMessage] = useState("");
  const [pendingLetterStates, setPendingLetterStates] = useState<Record<
    string,
    string
  > | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentRow > 8) return;
      if (guess === word) return;
      const key = e.key;

      if (/^[a-zA-Z]$/.test(key)) {
        setGrid((prev) => {
          if (currentCol > 4) return prev;

          const newGrid = prev.map((row) => [...row]);
          newGrid[currentRow][currentCol] = key.toUpperCase();

          return newGrid;
        });

        setCurrentCol((col) => Math.min(col + 1, 5));
      }

      if (key === "Backspace") {
        setGrid((prev) => {
          const targetCol = currentCol > 0 ? currentCol - 1 : currentCol;

          if (currentCol === 0) return prev;

          const newGrid = prev.map((row) => [...row]);
          newGrid[currentRow][targetCol] = "";
          return newGrid;
        });

        setCurrentCol((col) => Math.max(col - 1, 0));
      }

      if (key === "Enter" && currentCol === 5) {
        if (
          !(
            valid.includes(grid[currentRow].join("").toLowerCase()) ||
            wordles.includes(grid[currentRow].join("").toLowerCase())
          )
        ) {
          setMessage("NOT A VALID WORD");
          return;
        }

        setMessage("");

        const guess = grid[currentRow];
        if (guess.join("") === word) {
          setMessage("YOU GOT THE WORD!");
        }
        if (guess.join("") !== word && currentRow === 8) {
          setMessage(`${word} WAS THE WORD`);
        }

        setColors((prevColors) => {
          const newColors = prevColors.map((row) => [...row]);
          setGuess(guess.join(""));
          const wordLetterCount: Record<string, number> = {};
          for (const letter of word) {
            wordLetterCount[letter] = (wordLetterCount[letter] || 0) + 1;
          }

          guess.forEach((letter, i) => {
            if (letter === word[i]) {
              newColors[currentRow][i] = "green";
              wordLetterCount[letter]--;
            }
          });

          guess.forEach((letter, i) => {
            if (newColors[currentRow][i] === "green") return;
            if (word.includes(letter) && wordLetterCount[letter] > 0) {
              newColors[currentRow][i] = "goldenrod";
              wordLetterCount[letter]--;
            } else {
              newColors[currentRow][i] = "#787C7E";
            }
          });

          const letterStates: Record<string, string> = {};
          for (let r = 0; r < newColors.length; r++) {
            const rowCols = newColors[r];
            const rowLetters = grid[r] || [];
            rowLetters.forEach((ltr, i) => {
              if (!ltr) return;
              const col = rowCols[i];
              const key = ltr.toLowerCase();
              const state =
                col === "green"
                  ? "correct"
                  : col === "goldenrod"
                  ? "present"
                  : col === "#787C7E"
                  ? "absent"
                  : undefined;
              if (!state) return;
              const existing = letterStates[key];
              const pri = state === "correct" ? 3 : state === "present" ? 2 : 1;
              const existingPri =
                existing === "correct"
                  ? 3
                  : existing === "present"
                  ? 2
                  : existing === "absent"
                  ? 1
                  : 0;
              if (pri > existingPri) letterStates[key] = state;
            });
          }

          setPendingLetterStates(letterStates);

          return newColors;
        });
        setCurrentRow((r) => r + 1);
        setCurrentCol(0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentRow, currentCol, grid, word, guess]);

  useEffect(() => {
    if (pendingLetterStates && onReport) {
      onReport(id, pendingLetterStates);
    }
  }, [pendingLetterStates, id, onReport]);

  return (
    <>
      <style>{`
        @keyframes flip {
          0% { transform: rotateX(0); }
          50% { transform: rotateX(-90deg); }
          100% { transform: rotateX(0); }
        }
        @keyframes bounce {
          0%, 20% { transform: translateY(0); }
          40% { transform: translateY(-30px); }
          50% { transform: translateY(5px); }
          60% { transform: translateY(-15px); }
          80% { transform: translateY(2px); }
          100% { transform: translateY(0); }
        }
        .flip { animation: flip 350ms ease-in-out forwards; }
        .flip-then-bounce { animation: flip 350ms ease-in-out forwards, bounce 1000ms ease-in-out forwards; }
      `}</style>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <div
          aria-live="polite"
          style={{
            height: 28,
            fontSize: "1.1em",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            visibility: message ? "visible" : "hidden",
            width: "100%",
          }}
        >
          {message}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "4px",
            width: "100%",
            maxWidth: "clamp(140px, 20vw, 160px)",
          }}
        >
          {grid.map((row, rowIndex) => {
            const submittedRow = currentRow - 1;
            const isActiveRow = rowIndex === submittedRow;
            const isWinRow = isActiveRow && guess === word;

            const flipDuration = 350;
            const flipStagger = 150;

            return row.map((cell, cellIndex) => (
              <GridCell
                key={`${rowIndex}-${cellIndex}`}
                cell={cell}
                color={colors[rowIndex][cellIndex]}
                isActiveRow={isActiveRow}
                isWinRow={isWinRow}
                cellIndex={cellIndex}
                flipDuration={flipDuration}
                flipStagger={flipStagger}
                word={word}
              />
            ));
          })}
        </div>
      </div>
    </>
  );
};

export default Wordle;
