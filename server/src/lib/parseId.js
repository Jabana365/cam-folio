const MAX_INT = 2147483647 // largest value an integer column can hold

// Strict id parsing: digits only and within the integer range, else null
export function parseId(value) {
  const s = String(value)
  if (!/^\d+$/.test(s)) return null
  const n = Number(s)
  return n >= 1 && n <= MAX_INT ? n : null
}
