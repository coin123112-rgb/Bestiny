/**
 * Format seconds → "m:ss" string
 * @param {number} secs
 * @returns {string}
 */
export function formatTime(secs) {
  if (!secs || isNaN(secs) || !isFinite(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Parse LRC timestamp "[mm:ss.xx]" → seconds
 * @param {string} ts e.g. "02:34.50"
 * @returns {number}
 */
export function parseLrcTimestamp(ts) {
  const [min, sec] = ts.split(':');
  return parseFloat(min) * 60 + parseFloat(sec);
}

/**
 * Parse plain LRC text into synced lines array
 * @param {string} lrc
 * @returns {{ time: number, text: string }[]}
 */
export function parseLrc(lrc) {
  if (!lrc) return [];
  const lines = [];
  const regex = /\[(\d{2}:\d{2}(?:\.\d+)?)\](.*)/g;
  let match;
  while ((match = regex.exec(lrc)) !== null) {
    lines.push({ time: parseLrcTimestamp(match[1]), text: match[2].trim() });
  }
  return lines.sort((a, b) => a.time - b.time);
}
