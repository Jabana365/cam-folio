// "Oct 29, 2026" in the visitor's own locale
export function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, { dateStyle: 'medium' })
}
