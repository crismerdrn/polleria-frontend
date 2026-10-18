import { Suspense, lazy, useMemo } from 'react'
import { api } from './api/client'
import { useAsync } from './hooks/useAsync'
import Header from './components/Header'
import ProductForm from './components/ProductForm'
import ProductList from './components/ProductList'
import Spinner from './components/Spinner'

const PlatoEstrella3D = lazy(() => import('./components/PlatoEstrella3D'))

export default function App() {
  const catalogos = useAsync(api.getCatalogos, { medidas: [], tipos: [], pollerias: [] })
  const products = useAsync(api.getProducts, [])

  const productList = Array.isArray(products.data) ? products.data : []
  const totalStock = useMemo(
    () => productList.reduce((acc, p) => acc + (Number(p.stock_actual) || 0), 0),
    [productList],
  )

  return (
    <div className="min-h-screen">
      <Header
        totalProductos={products.loading && !productList.length ? null : productList.length}
        totalStock={products.loading && !productList.length ? null : totalStock.toLocaleString('es-PE')}
      />

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-5 lg:px-8">
        <div className="space-y-6 lg:col-span-2">
          <ProductForm
            catalogos={catalogos.data}
            catalogosLoading={catalogos.loading}
            catalogosError={catalogos.error}
            onReloadCatalogos={catalogos.reload}
            onCreated={products.reload}
          />
        </div>
        <div className="space-y-6 lg:col-span-3">
          <Suspense
            fallback={
              <div className="card flex h-[420px] items-center justify-center text-brasa-600">
                <Spinner className="h-8 w-8" />
              </div>
            }
          >
            <PlatoEstrella3D />
          </Suspense>
        </div>
        <div className="lg:col-span-5">
          <ProductList
            products={productList}
            loading={products.loading}
            error={products.error}
            onReload={products.reload}
          />
        </div>
      </main>

      <footer className="pb-8 text-center text-xs text-stone-400">
        Pollería · Catálogo e Inventario — React + Vite + Tailwind CSS + React Three Fiber
      </footer>
    </div>
  )
}
