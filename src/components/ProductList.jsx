import { useMemo, useState } from 'react'
import Spinner from './Spinner'

const currency = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })
const number = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 2 })

function stockBadge(stock) {
  if (stock <= 0) return { text: 'Agotado', cls: 'bg-red-100 text-red-700 ring-red-200' }
  if (stock < 10) return { text: 'Bajo', cls: 'bg-amber-100 text-amber-800 ring-amber-200' }
  return { text: 'OK', cls: 'bg-emerald-100 text-emerald-700 ring-emerald-200' }
}

export default function ProductList({ products, loading, error, onReload }) {
  const [query, setQuery] = useState('')
  const [categoria, setCategoria] = useState('')
  const [view, setView] = useState('table')

  const categorias = useMemo(
    () => [...new Set(products.map((p) => p.categoria).filter(Boolean))].sort(),
    [products],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter(
      (p) =>
        (!categoria || p.categoria === categoria) &&
        (!q || p.nombre?.toLowerCase().includes(q) || p.descripcion?.toLowerCase().includes(q)),
    )
  }, [products, query, categoria])

  return (
    <section className="card p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold">Catálogo de productos</h2>
          <p className="text-sm text-stone-500">
            {loading ? 'Cargando…' : `${filtered.length} de ${products.length} productos`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar…"
            className="input w-40 sm:w-52"
            aria-label="Buscar productos"
          />
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="input w-auto"
            aria-label="Filtrar por categoría"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <div className="flex rounded-lg bg-stone-100 p-1">
            {[
              ['table', 'Tabla'],
              ['grid', 'Tarjetas'],
            ].map(([v, l]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                  view === v ? 'bg-white text-brasa-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <button onClick={onReload} className="btn-ghost" disabled={loading} title="Refrescar">
            {loading ? <Spinner /> : '↻'} Refrescar
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg bg-red-50 p-6 text-center text-sm text-red-700">
          <p>Error al cargar productos: {error.message}</p>
          <button onClick={onReload} className="mt-2 font-semibold underline">
            Reintentar
          </button>
        </div>
      ) : loading && !products.length ? (
        <SkeletonRows />
      ) : !filtered.length ? (
        <div className="rounded-lg border border-dashed border-stone-300 p-10 text-center text-sm text-stone-500">
          {products.length ? 'Ningún producto coincide con el filtro.' : 'Aún no hay productos registrados.'}
        </div>
      ) : view === 'table' ? (
        <ProductTable products={filtered} />
      ) : (
        <ProductGrid products={filtered} />
      )}
    </section>
  )
}

function ProductTable({ products }) {
  return (
    <div className="-mx-5 overflow-x-auto sm:mx-0">
      <table className="min-w-full divide-y divide-stone-200 text-sm">
        <thead>
          <tr className="text-left text-xs font-semibold uppercase tracking-wide text-stone-500">
            <th className="px-4 py-3">Producto</th>
            <th className="px-4 py-3">Categoría</th>
            <th className="px-4 py-3">Medida</th>
            <th className="px-4 py-3 text-right">Stock actual</th>
            <th className="px-4 py-3 text-right">Precio</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {products.map((p) => {
            const badge = stockBadge(p.stock_actual)
            return (
              <tr key={p.id_producto} className="transition hover:bg-brasa-50/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Thumb src={p.image_url} alt={p.nombre} className="h-11 w-11" />
                    <div>
                      <p className="font-semibold text-stone-800">{p.nombre}</p>
                      <p className="line-clamp-1 text-xs text-stone-500">{p.descripcion || '—'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-brasa-100 px-2.5 py-1 text-xs font-medium text-brasa-700">
                    {p.categoria}
                  </span>
                </td>
                <td className="px-4 py-3 text-stone-600">{p.medida}</td>
                <td className="px-4 py-3 text-right">
                  <span className="font-semibold">{number.format(p.stock_actual)}</span>
                  <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${badge.cls}`}>
                    {badge.text}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-bold text-brasa-700">{currency.format(p.precio_venta)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function ProductGrid({ products }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((p) => {
        const badge = stockBadge(p.stock_actual)
        return (
          <article
            key={p.id_producto}
            className="group overflow-hidden rounded-xl bg-white ring-1 ring-stone-200 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="relative">
              <Thumb src={p.image_url} alt={p.nombre} className="h-40 w-full rounded-none" />
              <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-brasa-700 shadow">
                {p.categoria}
              </span>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-stone-800">{p.nombre}</h3>
                <p className="whitespace-nowrap font-bold text-brasa-700">{currency.format(p.precio_venta)}</p>
              </div>
              <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-stone-500">{p.descripcion || '—'}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-stone-600">
                <span>Medida: {p.medida}</span>
                <span className="flex items-center gap-2">
                  Stock: <b>{number.format(p.stock_actual)}</b>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${badge.cls}`}>
                    {badge.text}
                  </span>
                </span>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}

function Thumb({ src, alt, className = '' }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center rounded-lg bg-gradient-to-br from-brasa-100 to-amber-100 text-xl ${className}`}>
        🍗
      </div>
    )
  }
  const url = /images\.unsplash\.com/.test(src) && !src.includes('?') ? `${src}?w=400&q=70&auto=format&fit=crop` : src
  return (
    <img
      src={url}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`rounded-lg object-cover ${className}`}
    />
  )
}

function SkeletonRows() {
  return (
    <div className="space-y-3">
      <p className="text-center text-xs text-stone-400">
        Si la API estaba inactiva puede tardar hasta un minuto en despertar…
      </p>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-3">
          <div className="h-11 w-11 rounded-lg bg-stone-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 rounded bg-stone-200" />
            <div className="h-3 w-1/2 rounded bg-stone-100" />
          </div>
          <div className="h-3 w-16 rounded bg-stone-200" />
        </div>
      ))}
    </div>
  )
}
