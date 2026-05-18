import React, { useState } from 'react';
import { NOTES, getDiatonicChords, getVoicing, voicingToToneNotes } from './musicTheory.js';

// ─── Chord Diagram SVG ────────────────────────────────────────────────────────
function ChordDiagram({ voicing }) {
  if (!voicing) {
    return <p style={{ color: 'var(--color-muted)', fontSize: '0.85em', textAlign: 'center' }}>No voicing available</p>;
  }

  const pressedFrets = voicing.filter(f => f > 0);
  if (pressedFrets.length === 0) return null;

  const maxPressed = Math.max(...pressedFrets);
  const hasOpenStrings = voicing.some(f => f === 0);

  // Window: start at the lowest pressed fret (min 1 if open strings present)
  let startFret = hasOpenStrings ? 1 : Math.min(...pressedFrets);
  const endFret = Math.max(startFret + 4, maxPressed);
  const COLS = endFret - startFret + 1;

  const COL_W = 36;
  const ROW_H = 28;
  const NUM_STR = 6;
  const PAD = { top: 28, left: 32, right: 12, bottom: 10 };

  const svgW = PAD.left + COLS * COL_W + PAD.right;
  const svgH = PAD.top + (NUM_STR - 1) * ROW_H + PAD.bottom;

  // String 0 (low E) at bottom row
  const strY = (s) => PAD.top + (NUM_STR - 1 - s) * ROW_H;
  // Center X of each fret slot
  const slotCX = (f) => PAD.left + (f - startFret) * COL_W + COL_W / 2;

  const showNut = startFret === 1;

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} width="100%" style={{ display: 'block', maxWidth: svgW }}>
      {/* Fret position label for higher-up barre chords */}
      {!showNut && (
        <text x={PAD.left - 2} y={PAD.top - 8} textAnchor="middle" fontSize="9" fill="var(--color-muted)">
          {startFret}fr
        </text>
      )}

      {/* Nut */}
      {showNut && (
        <rect x={PAD.left - 4} y={PAD.top} width={5} height={(NUM_STR - 1) * ROW_H}
          fill="var(--color-text)" rx={1} />
      )}

      {/* Fret lines */}
      {Array.from({ length: COLS }, (_, i) => (
        <line key={i}
          x1={PAD.left + (i + 1) * COL_W} y1={PAD.top}
          x2={PAD.left + (i + 1) * COL_W} y2={PAD.top + (NUM_STR - 1) * ROW_H}
          stroke="var(--color-fret)" strokeWidth={1} />
      ))}

      {/* String lines */}
      {Array.from({ length: NUM_STR }, (_, s) => (
        <line key={s}
          x1={PAD.left - (showNut ? 4 : 0)} y1={strY(s)}
          x2={PAD.left + COLS * COL_W} y2={strY(s)}
          stroke="var(--color-string)" strokeWidth={0.5 + s * 0.22} />
      ))}

      {/* Open / muted indicators to the left of each string */}
      {voicing.map((fret, s) => {
        const cy = strY(s);
        const cx = PAD.left - 14;
        if (fret === 0) {
          return <circle key={s} cx={cx} cy={cy} r={5} fill="none" stroke="var(--color-text)" strokeWidth={1.5} />;
        }
        if (fret === -1) {
          const d = 4;
          return (
            <g key={s}>
              <line x1={cx - d} y1={cy - d} x2={cx + d} y2={cy + d} stroke="var(--color-muted)" strokeWidth={1.5} />
              <line x1={cx + d} y1={cy - d} x2={cx - d} y2={cy + d} stroke="var(--color-muted)" strokeWidth={1.5} />
            </g>
          );
        }
        return null;
      })}

      {/* Finger dots for pressed frets */}
      {voicing.map((fret, s) => {
        if (fret <= 0) return null;
        const cx = slotCX(fret);
        const cy = strY(s);
        return <circle key={s} cx={cx} cy={cy} r={8} fill="var(--color-accent)" opacity={0.92} />;
      })}
    </svg>
  );
}

// ─── Tone.js strum ─────────────────────────────────────────────────────────────
async function strumChord(toneNotes) {
  if (!toneNotes || toneNotes.length === 0) return;
  try {
    const Tone = await import('tone');
    await Tone.start();
    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 1.4 },
    }).toDestination();
    synth.set({ volume: -6 });
    const now = Tone.now();
    toneNotes.forEach((note, i) => {
      synth.triggerAttackRelease(note, '4n', now + i * 0.048);
    });
    setTimeout(() => synth.dispose(), 4000);
  } catch (err) {
    console.warn('Audio error:', err);
  }
}

// ─── Chord Card ───────────────────────────────────────────────────────────────
function ChordCard({ chord, isSelected, onClick }) {
  const qualityColor = {
    major: 'var(--color-accent)',
    minor: 'var(--color-scale)',
    diminished: 'var(--color-muted)',
  }[chord.quality];

  return (
    <div
      onClick={onClick}
      style={{
        ...styles.card,
        border: `2px solid ${isSelected ? qualityColor : 'var(--color-border)'}`,
        background: isSelected ? 'var(--color-card-active)' : 'var(--color-card)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ ...styles.roman, color: qualityColor }}>{chord.roman}</span>
        <span style={{ fontSize: '0.72em', color: 'var(--color-muted)', textTransform: 'capitalize' }}>
          {chord.quality}
        </span>
      </div>
      <div style={styles.chordName}>{chord.name}</div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ChordLibrary() {
  const [key, setKey] = useState('C');
  const [selectedIdx, setSelectedIdx] = useState(null);

  const chords = getDiatonicChords(key);
  const selected = selectedIdx !== null ? chords[selectedIdx] : null;
  const voicing = selected ? getVoicing(selected.root, selected.quality) : null;
  const toneNotes = voicing ? voicingToToneNotes(voicing) : [];

  const handleCardClick = (idx) => {
    setSelectedIdx(prev => prev === idx ? null : idx);
  };

  const handleKeyChange = (e) => {
    setKey(e.target.value);
    setSelectedIdx(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── Key selector ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <label style={styles.label}>Key</label>
        <select value={key} onChange={handleKeyChange} style={styles.select}>
          {NOTES.map(n => <option key={n} value={n}>{n} major</option>)}
        </select>
      </div>

      {/* ── 7-chord grid ── */}
      <div style={styles.grid}>
        {chords.map((chord, idx) => (
          <ChordCard
            key={idx}
            chord={chord}
            isSelected={selectedIdx === idx}
            onClick={() => handleCardClick(idx)}
          />
        ))}
      </div>

      {/* ── Detail panel ── */}
      {selected && (
        <div style={styles.detail}>
          <div style={styles.detailHeader}>
            <div>
              <span style={styles.detailTitle}>{selected.name}</span>
              <span style={styles.detailSub}>
                {' '}{selected.roman} · {key} major ·{' '}
                <span style={{ textTransform: 'capitalize' }}>{selected.quality}</span>
              </span>
            </div>
            <button onClick={() => strumChord(toneNotes)} style={styles.playBtn}>
              ▶ Play
            </button>
          </div>

          <div style={styles.diagramWrap}>
            <ChordDiagram voicing={voicing} />
          </div>

          {/* String-by-string fret numbers */}
          {voicing && (
            <div style={styles.voicingRow}>
              {['E', 'A', 'D', 'G', 'B', 'e'].map((str, i) => (
                <div key={i} style={styles.voicingCell}>
                  <div style={{ fontSize: '0.7em', color: 'var(--color-muted)' }}>{str}</div>
                  <div style={{ fontWeight: 700 }}>
                    {voicing[i] === -1 ? '×' : voicing[i] === 0 ? 'O' : voicing[i]}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  label: {
    fontWeight: 600,
    fontSize: '0.85em',
    color: 'var(--color-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  select: {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    background: 'var(--color-card)',
    color: 'var(--color-text)',
    fontSize: '1em',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
    gap: 10,
  },
  card: {
    padding: '12px 14px',
    borderRadius: 10,
    cursor: 'pointer',
    transition: 'border-color 0.15s, background 0.15s',
    userSelect: 'none',
  },
  roman: {
    fontSize: '0.8em',
    fontWeight: 700,
    fontFamily: 'serif',
  },
  chordName: {
    fontSize: '1.25em',
    fontWeight: 700,
    marginTop: 4,
    color: 'var(--color-text)',
  },
  detail: {
    background: 'var(--color-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  detailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  detailTitle: {
    fontSize: '1.5em',
    fontWeight: 700,
  },
  detailSub: {
    fontSize: '0.85em',
    color: 'var(--color-muted)',
    marginLeft: 4,
  },
  playBtn: {
    padding: '9px 20px',
    background: 'var(--color-accent)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '0.95em',
  },
  diagramWrap: {
    display: 'flex',
    justifyContent: 'center',
    padding: '16px 0',
    background: 'var(--color-fretboard)',
    borderRadius: 10,
    maxWidth: 240,
    alignSelf: 'center',
    width: '100%',
  },
  voicingRow: {
    display: 'flex',
    justifyContent: 'space-around',
    background: 'var(--color-fretboard)',
    borderRadius: 8,
    padding: '10px 0',
  },
  voicingCell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    fontSize: '0.9em',
    minWidth: 30,
  },
};
