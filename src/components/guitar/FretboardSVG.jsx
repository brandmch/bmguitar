import React from 'react';
import { getNoteNameAt, STRING_NAMES } from './musicTheory.js';

// ─── Layout constants ──────────────────────────────────────────────────────────
const NUM_STRINGS = 6;
const NUM_FRETS = 12;

const PAD = { top: 28, right: 18, bottom: 14, left: 38 };
const FRET_W = 52;
const STR_H = 22;

const SVG_W = PAD.left + NUM_FRETS * FRET_W + PAD.right;
const SVG_H = PAD.top + (NUM_STRINGS - 1) * STR_H + PAD.bottom;

// String 0 (low E) rendered at the bottom row
const strY = (s) => PAD.top + (NUM_STRINGS - 1 - s) * STR_H;
// Absolute left edge of each fret "slot" (area between fret lines)
const fretSlotLeft = (f) => PAD.left + (f - 1) * FRET_W;
// Center X of a fret slot (where the dot sits)
const dotX = (f) => PAD.left + (f - 1) * FRET_W + FRET_W / 2;
// Fret line X position
const fretLineX = (f) => PAD.left + f * FRET_W;

// Frets with position markers (single dot)
const MARKER_FRETS = new Set([3, 5, 7, 9]);

export default function FretboardSVG({
  // Array of { string, fret, fill, label } highlights
  highlights = [],
  // Called with (stringIndex, fretNumber) when a fret area is clicked
  onFretClick = null,
  // Show only frets in [minFret, maxFret] — used by chord diagram
  minFret = 1,
  maxFret = 12,
  // Show fret numbers along the top
  showFretNumbers = true,
  // Extra height multiplier for a compact chord snippet
  compact = false,
}) {
  const fretCount = maxFret - minFret + 1;
  const width = PAD.left + fretCount * FRET_W + PAD.right;
  const height = SVG_H;

  // Local helpers using the visible fret range
  const localDotX = (f) => PAD.left + (f - minFret) * FRET_W + FRET_W / 2;
  const localFretLineX = (f) => PAD.left + (f - minFret + 1) * FRET_W;

  const highlightMap = {};
  highlights.forEach(h => {
    highlightMap[`${h.string}-${h.fret}`] = h;
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{ display: 'block', maxWidth: width, userSelect: 'none' }}
      aria-label="Guitar fretboard"
    >
      {/* ── Fret number labels ── */}
      {showFretNumbers && Array.from({ length: fretCount }, (_, i) => {
        const f = minFret + i;
        return (
          <text
            key={f}
            x={localDotX(f)}
            y={PAD.top - 10}
            textAnchor="middle"
            fontSize="10"
            fill="var(--color-muted)"
          >
            {f}
          </text>
        );
      })}

      {/* ── Nut (thick left border when minFret is 1) ── */}
      {minFret === 1 && (
        <rect
          x={PAD.left - 4}
          y={PAD.top}
          width={5}
          height={(NUM_STRINGS - 1) * STR_H}
          fill="var(--color-text)"
          rx={1}
        />
      )}

      {/* ── Fret lines ── */}
      {Array.from({ length: fretCount }, (_, i) => {
        const f = minFret + i;
        const x = localFretLineX(f);
        return (
          <line
            key={f}
            x1={x} y1={PAD.top}
            x2={x} y2={PAD.top + (NUM_STRINGS - 1) * STR_H}
            stroke="var(--color-fret)"
            strokeWidth={f % 12 === 0 ? 2.5 : 1}
          />
        );
      })}

      {/* ── String lines ── */}
      {Array.from({ length: NUM_STRINGS }, (_, s) => {
        const y = strY(s);
        const thickness = 0.6 + s * 0.25; // low E thicker
        return (
          <line
            key={s}
            x1={PAD.left - (minFret === 1 ? 4 : 0)}
            y1={y}
            x2={PAD.left + fretCount * FRET_W}
            y2={y}
            stroke="var(--color-string)"
            strokeWidth={thickness}
          />
        );
      })}

      {/* ── String name labels (left side) ── */}
      {Array.from({ length: NUM_STRINGS }, (_, s) => (
        <text
          key={s}
          x={PAD.left - 10}
          y={strY(s) + 4}
          textAnchor="middle"
          fontSize="10"
          fill="var(--color-muted)"
          fontFamily="monospace"
        >
          {STRING_NAMES[s]}
        </text>
      ))}

      {/* ── Position markers ── */}
      {Array.from({ length: fretCount }, (_, i) => {
        const f = minFret + i;
        if (!MARKER_FRETS.has(f) && f !== 12) return null;
        const cx = localDotX(f);
        if (f === 12) {
          return (
            <g key={f}>
              <circle cx={cx} cy={strY(1) + STR_H / 2} r={3} fill="var(--color-marker)" />
              <circle cx={cx} cy={strY(3) + STR_H / 2} r={3} fill="var(--color-marker)" />
            </g>
          );
        }
        return (
          <circle
            key={f}
            cx={cx}
            cy={strY(2) + STR_H / 2}
            r={3}
            fill="var(--color-marker)"
          />
        );
      })}

      {/* ── Clickable fret areas + highlight dots ── */}
      {Array.from({ length: NUM_STRINGS }, (_, s) =>
        Array.from({ length: fretCount }, (_, i) => {
          const f = minFret + i;
          const key = `${s}-${f}`;
          const hl = highlightMap[key];
          const cx = localDotX(f);
          const cy = strY(s);

          return (
            <g
              key={key}
              onClick={onFretClick ? () => onFretClick(s, f) : undefined}
              style={{ cursor: onFretClick ? 'pointer' : 'default' }}
            >
              {/* invisible hit area */}
              <rect
                x={cx - FRET_W / 2}
                y={cy - STR_H / 2}
                width={FRET_W}
                height={STR_H}
                fill="transparent"
              />
              {hl && (
                <>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={9}
                    fill={hl.fill}
                    stroke="rgba(0,0,0,0.25)"
                    strokeWidth={1}
                  />
                  {hl.label && (
                    <text
                      x={cx}
                      y={cy + 4}
                      textAnchor="middle"
                      fontSize={hl.label.length > 2 ? '7' : '9'}
                      fontWeight="600"
                      fill="#fff"
                    >
                      {hl.label}
                    </text>
                  )}
                </>
              )}
            </g>
          );
        })
      )}
    </svg>
  );
}
