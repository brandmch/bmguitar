import React, { useState } from 'react';
import FretboardTrainer from './FretboardTrainer.jsx';
import ScaleVisualizer from './ScaleVisualizer.jsx';
import ChordLibrary from './ChordLibrary.jsx';

// ─── Global CSS variables injected once ───────────────────────────────────────
const CSS_VARS = `
  :root {
    --color-bg:          #0f1117;
    --color-surface:     #181c27;
    --color-card:        #1e2333;
    --color-card-active: #252b40;
    --color-border:      #2e3650;
    --color-text:        #e8eaf0;
    --color-muted:       #6b7494;
    --color-accent:      #5b7cfa;
    --color-correct:     #34c77b;
    --color-wrong:       #f05252;
    --color-scale:       #4db8c0;
    --color-root:        #f5a623;
    --color-fretboard:   #12161f;
    --color-string:      #8090b8;
    --color-fret:        #303858;
    --color-marker:      #2a3050;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--color-bg);
    color: var(--color-text);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    -webkit-font-smoothing: antialiased;
  }
`;

function GlobalStyles() {
  return <style>{CSS_VARS}</style>;
}

const TABS = [
  { id: 'trainer',    label: 'Fretboard Trainer',  Component: FretboardTrainer },
  { id: 'scales',     label: 'Scale Visualizer',   Component: ScaleVisualizer  },
  { id: 'chords',     label: 'Chord Library',      Component: ChordLibrary     },
];

export default function GuitarApp() {
  const [activeTab, setActiveTab] = useState('trainer');
  const active = TABS.find(t => t.id === activeTab);

  return (
    <>
      <GlobalStyles />
      <div style={styles.shell}>
        {/* ── App header ── */}
        <header style={styles.header}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>🎸</span>
            <span style={styles.logoText}>BM Guitar</span>
          </div>

          {/* ── Tab bar ── */}
          <nav style={styles.tabs}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  ...styles.tab,
                  ...(activeTab === tab.id ? styles.tabActive : {}),
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </header>

        {/* ── Content ── */}
        <main style={styles.main}>
          <active.Component />
        </main>
      </div>
    </>
  );
}

const styles = {
  shell: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--color-bg)',
  },
  header: {
    background: 'var(--color-surface)',
    borderBottom: '1px solid var(--color-border)',
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    flexWrap: 'wrap',
    minHeight: 58,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  logoIcon: {
    fontSize: '1.4em',
  },
  logoText: {
    fontWeight: 700,
    fontSize: '1.05em',
    letterSpacing: '0.03em',
    color: 'var(--color-text)',
  },
  tabs: {
    display: 'flex',
    gap: 4,
    flexWrap: 'wrap',
    padding: '8px 0',
  },
  tab: {
    padding: '7px 16px',
    background: 'transparent',
    border: '1px solid transparent',
    borderRadius: 8,
    color: 'var(--color-muted)',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '0.9em',
    transition: 'color 0.15s, border-color 0.15s, background 0.15s',
    whiteSpace: 'nowrap',
  },
  tabActive: {
    color: 'var(--color-text)',
    background: 'var(--color-card)',
    borderColor: 'var(--color-border)',
  },
  main: {
    flex: 1,
    padding: '24px 20px',
    maxWidth: 900,
    width: '100%',
    margin: '0 auto',
  },
};
