export function fuzzyScore(query: string, target: string): number {
  if (!query) return 0;
  const q = query.toLowerCase();
  const t = target.toLowerCase();

  if (t.includes(q)) {
    const idx = t.indexOf(q);
    return 100 - idx * 0.05 + (q.length / t.length) * 30;
  }

  let qi = 0;
  let lastMatch = -1;
  let score = 0;
  let consecutive = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      if (lastMatch >= 0 && ti - lastMatch === 1) {
        consecutive += 1;
        score += 2 + consecutive;
      } else {
        consecutive = 0;
        score += 1;
      }
      lastMatch = ti;
      qi += 1;
    }
  }
  if (qi < q.length) return 0;
  return Math.max(1, score - (t.length - q.length) * 0.04);
}
