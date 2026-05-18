// ─── Note system ───────────────────────────────────────────────────────────────
export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Standard tuning open string note indices (low E → high e)
// E=4, A=9, D=2, G=7, B=11, E=4
export const OPEN_STRINGS = [4, 9, 2, 7, 11, 4];

// Open string names for labels (displayed low→high, index 0 = low E)
export const STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'e'];

// Open string octaves for Tone.js note construction
const OPEN_OCTAVES = [2, 2, 3, 3, 3, 4];

export function noteIndex(noteName) {
  return NOTES.indexOf(noteName);
}

// Returns the NOTES index (0–11) at a given string/fret
export function getNoteAt(stringIdx, fret) {
  return (OPEN_STRINGS[stringIdx] + fret) % 12;
}

export function getNoteNameAt(stringIdx, fret) {
  return NOTES[getNoteAt(stringIdx, fret)];
}

// Returns a Tone.js-ready note string, e.g. "E2", "C#4"
export function getToneNote(stringIdx, fret) {
  const openNote = OPEN_STRINGS[stringIdx];
  const semitones = openNote + fret;
  const noteIdx = semitones % 12;
  const octaveDelta = Math.floor(semitones / 12);
  return `${NOTES[noteIdx]}${OPEN_OCTAVES[stringIdx] + octaveDelta}`;
}

// ─── Scale system ──────────────────────────────────────────────────────────────
export const SCALE_TYPES = ['Major', 'Minor', 'Pentatonic Major', 'Pentatonic Minor'];

export const SCALE_FORMULAS = {
  Major:              [0, 2, 4, 5, 7, 9, 11],
  Minor:              [0, 2, 3, 5, 7, 8, 10],
  'Pentatonic Major': [0, 2, 4, 7, 9],
  'Pentatonic Minor': [0, 3, 5, 7, 10],
};

// Returns an array of 12 booleans indexed by NOTES (true = in scale)
export function getScaleSet(rootName, scaleType) {
  const root = noteIndex(rootName);
  const set = new Array(12).fill(false);
  SCALE_FORMULAS[scaleType].forEach(interval => {
    set[(root + interval) % 12] = true;
  });
  return set;
}

// ─── Chord / diatonic system ───────────────────────────────────────────────────
export const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

// Chord qualities for each scale degree of a major key
const DIATONIC_QUALITIES = ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'];

const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];

const CHORD_INTERVALS = {
  major:      [0, 4, 7],
  minor:      [0, 3, 7],
  diminished: [0, 3, 6],
};

export function getDiatonicChords(keyName) {
  const root = noteIndex(keyName);
  return MAJOR_SCALE_INTERVALS.map((interval, degree) => {
    const chordRoot = (root + interval) % 12;
    const quality = DIATONIC_QUALITIES[degree];
    const rootName = NOTES[chordRoot];
    const suffix = quality === 'major' ? '' : quality === 'minor' ? 'm' : '°';
    const noteSet = CHORD_INTERVALS[quality].map(i => (chordRoot + i) % 12);
    return {
      degree,
      roman: ROMAN_NUMERALS[degree],
      root: rootName,
      quality,
      name: rootName + suffix,
      noteSet,
    };
  });
}

// ─── Chord voicings ────────────────────────────────────────────────────────────
// Each voicing: 6 numbers [low-E, A, D, G, B, high-e]
//   -1 = muted, 0 = open, 1–N = fret number
//
// For barre chords the numbers are absolute fret positions (not relative).

const VOICINGS = {
  // ── Major chords ──
  C_major:   [-1,  3,  2,  0,  1,  0],
  'C#_major':[-1,  4,  3,  1,  2,  1],
  D_major:   [-1, -1,  0,  2,  3,  2],
  'D#_major':[-1,  6,  5,  3,  4,  3],
  E_major:   [ 0,  2,  2,  1,  0,  0],
  F_major:   [ 1,  3,  3,  2,  1,  1],
  'F#_major':[ 2,  4,  4,  3,  2,  2],
  G_major:   [ 3,  2,  0,  0,  0,  3],
  'G#_major':[ 4,  6,  6,  5,  4,  4],
  A_major:   [-1,  0,  2,  2,  2,  0],
  'A#_major':[-1,  1,  3,  3,  3,  1],
  B_major:   [-1,  2,  4,  4,  4,  2],

  // ── Minor chords ──
  C_minor:   [-1,  3,  5,  5,  4,  3],
  'C#_minor':[-1,  4,  6,  6,  5,  4],
  D_minor:   [-1, -1,  0,  2,  3,  1],
  'D#_minor':[-1,  6,  8,  8,  7,  6],
  E_minor:   [ 0,  2,  2,  0,  0,  0],
  F_minor:   [ 1,  3,  3,  1,  1,  1],
  'F#_minor':[ 2,  4,  4,  2,  2,  2],
  G_minor:   [ 3,  5,  5,  3,  3,  3],
  'G#_minor':[ 4,  6,  6,  4,  4,  4],
  A_minor:   [-1,  0,  2,  2,  1,  0],
  'A#_minor':[-1,  1,  3,  3,  2,  1],
  B_minor:   [-1,  2,  4,  4,  3,  2],

  // ── Diminished chords ──
  C_diminished:   [-1,  3,  4,  5,  4, -1],
  'C#_diminished':[-1,  4,  5,  6,  5, -1],
  D_diminished:   [-1, -1,  0,  1,  0,  1],
  'D#_diminished':[-1, -1,  1,  2,  1,  2],
  E_diminished:   [ 0,  1,  2,  3,  2, -1],
  F_diminished:   [ 1,  2,  3,  4,  3, -1],
  'F#_diminished':[-1,  2,  3,  4,  3, -1],
  G_diminished:   [-1,  3,  4,  5,  4, -1],
  'G#_diminished':[-1,  0,  1,  1,  0, -1],
  A_diminished:   [-1,  0,  1,  2,  1, -1],
  'A#_diminished':[-1,  1,  2,  3,  2, -1],
  B_diminished:   [-1,  2,  3,  4,  3, -1],
};

export function getVoicing(rootName, quality) {
  return VOICINGS[`${rootName}_${quality}`] ?? null;
}

// Returns Tone.js note strings for non-muted strings in a voicing
export function voicingToToneNotes(voicing) {
  return voicing
    .map((fret, stringIdx) => fret === -1 ? null : getToneNote(stringIdx, fret))
    .filter(Boolean);
}
