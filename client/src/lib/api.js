// Small fetch wrapper: always sends the session cookie and parses JSON errors.
export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    // Keep the HTTP status so callers can tell 404 from 401 without reading the message
    throw Object.assign(new Error(data.error || `Request failed (${res.status})`), { status: res.status })
  }
  return res.status === 204 ? null : res.json()
}
