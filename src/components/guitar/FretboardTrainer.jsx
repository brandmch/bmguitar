import React, { useState, useCallback, useEffect } from 'react';
import FretboardSVG from './FretboardSVG.jsx';
import { NOTES, getNoteNameAt } from './musicTheory.js';

const NUM_STRINGS = 6;
const NUM_FRETS = 12;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomNote() {
  return NOTES[randomInt(0, 11)];
}

function randomFretPosition() {
  return { string: randomInt(0, NUM_STRINGS - 1), fret: randomInt(1, NUM_FRETS) };
}

// Returns all (string, fret) positions where a note lives (frets 1–12)
function allPositionsForNote(noteName) {
  const positions = [];
  for (let s = 0; s < NUM_STRINGS; s++) {
    for (let f = 1; f <= NUM_FRETS; f++) {
      if (getNoteNameAt(s, f) === noteName) positions.push({ string: s, fret: f });
    }
  }
  return positions;
}

export default function FretboardTrainer() {
  const [mode, setMode] = useState('findNote'); // 'findNote' | 'nameFret'
  const [targetNote, setTargetNote] = useState(randomNote);
  const [targetPos, setTargetPos] = useState(randomFretPosition);
  const [feedback, setFeedback] = useState(null); // { string, fret, correct }
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const advance = useCallback(() => {
    setFeedback(null);
    if (mode === 'findNote') {
      setTargetNote(randomNote());
    } else {
      setTargetPos(randomFretPosition());
    }
  }, [mode]);

  // Reset when mode changes
  useEffect(() => {
    setFeedback(null);
    setTargetNote(randomNote());
    setTargetPos(randomFretPosition());
  }, [mode]);

  // ── Find the Note mode ──
  const handleFretClick = useCallback((s, f) => {
    if (feedback) return; // wait for next question
    const clicked = getNoteNameAt(s, f);
    const correct = clicked === targetNote;
    setFeedback({ string: s, fret: f, correct });
    setScore(sc => ({ correct: sc.correct + (correct ? 1 : 0), total: sc.total + 1 }));
    setTimeout(advance, 900);
  }, [feedback, targetNote, advance]);

  // ── Name the Fret mode ──
  const handleNoteButton = useCallback((note) => {
    if (feedback) return;
    const correct = note === getNoteNameAt(targetPos.string, targetPos.fret);
    setFeedback({ ...targetPos, correct, guessedNote: note });
    setScore(sc => ({ correct: sc.correct + (correct ? 1 : 0), total: sc.total + 1 }));
    setTimeout(advance, 900);
  }, [feedback, targetPos, advance]);

  // Build highlight list for fretboard
  const highlights = [];
  if (mode === 'findNote') {
    if (feedback) {
      const { string, fret, correct } = feedback;
      // Show the clicked position
      highlights.push({
        string, fret,
        fill: correct ? 'var(--color-correct)' : 'var(--color-wrong)',
        label: getNoteNameAt(string, fret),
      });
      // If wrong, also reveal all correct positions
      if (!correct) {
        allPositionsForNote(targetNote).forEach(({ string: s, fret: f }) => {
          highlights.push({ string: s, fret: f, fill: 'var(--color-correct)', label: targetNote });
        });
      }
    }
  } else {
    // Name the Fret: always show target position
    const { string, fret } = targetPos;
    let fill = 'var(--color-accent)';
    let label = '?';
    if (feedback) {
      fill = feedback.correct ? 'var(--color-correct)' : 'var(--color-wrong)';
      label = getNoteNameAt(string, fret);
    }
    highlights.push({ string, fret, fill, label });
  }

  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── Header row ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <button
          onClick={() => setMode(m => m === 'findNote' ? 'nameFret' : 'findNote')}
          style={styles.modeBtn}
        >
          Mode: {mode === 'findNote' ? 'Find the Note' : 'Name the Fret'}
        </button>
        <div style={styles.score}>
          {score.correct}/{score.total}
          {score.total > 0 && <span style={{ marginLeft: 6, opacity: 0.7 }}>{accuracy}%</span>}
        </div>
      </div>

      {/* ── Prompt ── */}
      <div style={styles.prompt}>
        {mode === 'findNote' ? (
          <>
            Find all <strong style={{ fontSize: '1.5em', color: 'var(--color-accent)' }}>{targetNote}</strong> on the fretboard
          </>
        ) : (
          <>
            What note is highlighted?
          </>
        )}
      </div>

      {/* ── Fretboard ── */}
      <div style={styles.fretboardWrap}>
        <FretboardSVG
          highlights={highlights}
          onFretClick={mode === 'findNote' ? handleFretClick : null}
        />
      </div>

      {/* ── Note buttons (Name the Fret mode) ── */}
      {mode === 'nameFret' && (
        <div style={styles.noteGrid}>
          {NOTES.map(note => {
            let bg = 'var(--color-card)';
            if (feedback) {
              const correctNote = getNoteNameAt(targetPos.string, targetPos.fret);
              if (note === correctNote) bg = 'var(--color-correct)';
              else if (note === feedback.guessedNote) bg = 'var(--color-wrong)';
            }
            return (
              <button
                key={note}
                onClick={() => handleNoteButton(note)}
                disabled={!!feedback}
                style={{ ...styles.noteBtn, background: bg }}
              >
                {note}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Find the Note: click hint ── */}
      {mode === 'findNote' && !feedback && (
        <p style={{ textAlign: 'center', opacity: 0.5, fontSize: '0.85em', margin: 0 }}>
          Click every fret where this note appears
        </p>
      )}
    </div>
  );
}

const styles = {
  modeBtn: {
    padding: '8px 16px',
    background: 'var(--color-accent)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9em',
  },
  score: {
    fontWeight: 700,
    fontSize: '1.1em',
    color: 'var(--color-text)',
    background: 'var(--color-card)',
    padding: '6px 14px',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
  },
  prompt: {
    textAlign: 'center',
    fontSize: '1.1em',
    background: 'var(--color-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 10,
    padding: '14px 20px',
  },
  fretboardWrap: {
    background: 'var(--color-fretboard)',
    borderRadius: 10,
    padding: '10px 6px',
    overflowX: 'auto',
  },
  noteGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: 8,
  },
  noteBtn: {
    padding: '10px 0',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '1em',
    transition: 'background 0.15s',
    color: 'var(--color-text)',
  },
};
