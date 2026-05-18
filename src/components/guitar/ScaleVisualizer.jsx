import React, { useState, useMemo } from 'react';
import FretboardSVG from './FretboardSVG.jsx';
import { NOTES, SCALE_TYPES, getScaleSet, getNoteAt } from './musicTheory.js';

const NUM_STRINGS = 6;

export default function ScaleVisualizer() {
  const [root, setRoot] = useState('C');
  const [scaleType, setScaleType] = useState('Major');

  const highlights = useMemo(() => {
    const scaleSet = getScaleSet(root, scaleType);
    const rootIdx = NOTES.indexOf(root);
    const result = [];

    for (let s = 0; s < NUM_STRINGS; s++) {
      for (let f = 1; f <= 12; f++) {
        const noteIdx = getNoteAt(s, f);
        if (!scaleSet[noteIdx]) continue;
        const isRoot = noteIdx === rootIdx;
        result.push({
          string: s,
          fret: f,
          fill: isRoot ? 'var(--color-root)' : 'var(--color-scale)',
          label: NOTES[noteIdx],
        });
      }
    }
    return result;
  }, [root, scaleType]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── Controls ── */}
      <div style={styles.controls}>
        <label style={styles.label}>
          Root
          <select
            value={root}
            onChange={e => setRoot(e.target.value)}
            style={styles.select}
          >
            {NOTES.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>

        <label style={styles.label}>
          Scale
          <select
            value={scaleType}
            onChange={e => setScaleType(e.target.value)}
            style={styles.select}
          >
            {SCALE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
      </div>

      {/* ── Title ── */}
      <div style={styles.title}>
        {root} {scaleType}
        <span style={styles.noteList}>
          {' — '}
          {(() => {
            const scaleSet = getScaleSet(root, scaleType);
            return NOTES.filter((_, i) => scaleSet[i]).join('  ');
          })()}
        </span>
      </div>

      {/* ── Fretboard ── */}
      <div style={styles.fretboardWrap}>
        <FretboardSVG highlights={highlights} />
      </div>

      {/* ── Legend ── */}
      <div style={styles.legend}>
        <span style={{ ...styles.dot, background: 'var(--color-root)' }} />
        <span>Root note ({root})</span>
        <span style={{ ...styles.dot, background: 'var(--color-scale)', marginLeft: 16 }} />
        <span>Scale note</span>
      </div>
    </div>
  );
}

const styles = {
  controls: {
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    fontSize: '0.85em',
    fontWeight: 600,
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
    minWidth: 160,
  },
  title: {
    fontSize: '1.2em',
    fontWeight: 700,
    padding: '12px 18px',
    background: 'var(--color-card)',
    borderRadius: 10,
    border: '1px solid var(--color-border)',
  },
  noteList: {
    fontWeight: 400,
    color: 'var(--color-muted)',
    fontSize: '0.9em',
  },
  fretboardWrap: {
    background: 'var(--color-fretboard)',
    borderRadius: 10,
    padding: '10px 6px',
    overflowX: 'auto',
  },
  legend: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: '0.85em',
    color: 'var(--color-muted)',
  },
  dot: {
    display: 'inline-block',
    width: 14,
    height: 14,
    borderRadius: '50%',
    flexShrink: 0,
  },
};
