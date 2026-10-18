import { API_URL } from '../api/client'

export default function Header({ totalProductos, totalStock }) {
  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-brasa-700 via-brasa-600 to-amber-500 text-white">
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-amber-300/20 blur-2xl" />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-end md:justify-between lg:px-8">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-amber-100">Sistema de inventario</p>
          <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">🍗 Pollería · Catálogo</h1>
          <p className="mt-2 max-w-xl text-sm text-orange-50/90">
            Registra productos, controla el stock por sucursal y explora nuestro plato estrella en 3D.
          </p>
        </div>
        <div className="flex gap-3">
          <Stat label="Productos" value={totalProductos} />
          <Stat label="Stock total" value={totalStock} />
        </div>
      </div>
      <p className="relative mx-auto max-w-7xl truncate px-4 pb-3 text-[11px] text-orange-100/70 sm:px-6 lg:px-8">
        API: {API_URL}
      </p>
    </header>
  )
}

function Stat({ label, value }) {
  return (
    <div className="min-w-[110px] rounded-xl bg-white/15 px-4 py-3 backdrop-blur">
      <p className="text-xs text-orange-50/80">{label}</p>
      <p className="text-2xl font-bold">{value ?? '—'}</p>
    </div>
  )
}
