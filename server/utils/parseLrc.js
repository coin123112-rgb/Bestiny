'use strict';

/**
 * Parse LRC-format lyrics string into synced lines.
 * LRC format: [mm:ss.xx] lyric text
 * @param {string} lrc
 * @returns {{ time: number, text: string }[]}
 */
function parseLrc(lrc) {
  if (!lrc) return [];
  const lines  = [];
  const regex  = /\[(\d{1,2}):(\d{2})(?:\.(\d+))?\](.*)/g;
  let match;

  while ((match = regex.exec(lrc)) !== null) {
    const minutes = parseInt(match[1], 10);
    const seconds = parseInt(match[2], 10);
    const centis  = match[3] ? parseInt(match[3].padEnd(2, '0').slice(0, 2), 10) : 0;
    const time    = minutes * 60 + seconds + centis / 100;
    const text    = match[4].trim();
    lines.push({ time, text });
  }

  return lines.sort((a, b) => a.time - b.time);
}

module.exports = { parseLrc };
