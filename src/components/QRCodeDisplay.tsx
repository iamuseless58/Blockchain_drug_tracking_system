import React from 'react';

interface QRCodeDisplayProps {
  data: string;
  size?: number;
  label?: string;
}

/**
 * Procedural SVG QR Code Matrix generator based on string hash.
 * Generates an authentic-looking, high-density matrix with standard finder patterns
 * and timing patterns.
 */
export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  data,
  size = 160,
  label,
}) => {
  // Generate deterministic grid pattern from data string
  const gridSize = 25; // 25x25 matrix
  const matrix: boolean[][] = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill(false)
  );

  // Helper to draw standard 7x7 QR finder patterns
  const drawFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matrix[startY + r][startX + c] = isBorder || isCenter;
      }
    }
  };

  // Draw 3 primary finder patterns
  drawFinder(0, 0); // Top-left
  drawFinder(gridSize - 7, 0); // Top-right
  drawFinder(0, gridSize - 7); // Bottom-left

  // Timing patterns
  for (let i = 8; i < gridSize - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Populate data modules deterministically
  let hashVal = 0;
  for (let i = 0; i < data.length; i++) {
    hashVal = (hashVal << 5) - hashVal + data.charCodeAt(i);
    hashVal |= 0;
  }
  const seed = Math.abs(hashVal);

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      // Don't overwrite finder patterns
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= gridSize - 8;
      const inBottomLeft = r >= gridSize - 8 && c < 8;
      const inTiming = (r === 6 && c >= 8 && c < gridSize - 8) || (c === 6 && r >= 8 && r < gridSize - 8);

      if (!inTopLeft && !inTopRight && !inBottomLeft && !inTiming) {
        const pseudorandom = Math.sin((r * gridSize + c + 1) * seed) * 10000;
        matrix[r][c] = (pseudorandom - Math.floor(pseudorandom)) > 0.46;
      }
    }
  }

  const cellSize = size / gridSize;

  return (
    <div className="flex flex-col items-center">
      <div 
        className="p-3 bg-white rounded-xl shadow-lg border border-slate-200 inline-block"
        style={{ width: size + 24, height: size + 24 }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="rounded-md"
        >
          {matrix.map((row, r) =>
            row.map((cell, c) =>
              cell ? (
                <rect
                  key={`${r}-${c}`}
                  x={c * cellSize}
                  y={r * cellSize}
                  width={cellSize + 0.3}
                  height={cellSize + 0.3}
                  fill="#0f172a"
                />
              ) : null
            )
          )}
        </svg>
      </div>
      {label && (
        <span className="mt-2 text-xs font-mono text-slate-400 tracking-wider">
          {label}
        </span>
      )}
    </div>
  );
};
