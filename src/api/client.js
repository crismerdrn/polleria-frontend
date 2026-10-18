export const API_URL = (
  import.meta.env.VITE_API_URL || 'https://polleria-api-2itc.onrender.com'
).replace(/\/+$/, '')

const BASE = `${API_URL}/api/v1`

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message)
    this.status = status
    this.details = details
  }
}

function formatDetail(detail) {
  if (!detail) return null
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail
      .map((d) => {
        const field = Array.isArray(d.loc) ? d.loc.filter((l) => l !== 'body').join('.') : ''
        return field ? `${field}: ${d.msg}` : d.msg
      })
      .join(' · ')
  }
  return JSON.stringify(detail)
}

async function request(path, { timeout = 60000, ...options } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      signal: controller.signal,
      ...options,
    })
    const text = await res.text()
    const data = text ? safeJson(text) : null
    if (!res.ok) {
      const msg = formatDetail(data?.detail) || `Error ${res.status} en ${path}`
      throw new ApiError(msg, res.status, data)
    }
    return data
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new ApiError('La API tardó demasiado en responder. Intenta nuevamente.', 0)
    }
    if (err instanceof ApiError) throw err
    throw new ApiError('No se pudo conectar con la API.', 0)
  } finally {
    clearTimeout(timer)
  }
}

function safeJson(text) {
  try {
    return JSON.parse(text)
  } catch {
    return { detail: text }
  }
}

export const api = {
  getCatalogos: () => request('/catalogos'),
  getProducts: () => request('/products'),
  createProduct: (payload) =>
    request('/products', { method: 'POST', body: JSON.stringify(payload) }),
}
