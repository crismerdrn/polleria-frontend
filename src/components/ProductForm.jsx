import { useState } from 'react'
import { api } from '../api/client'
import { useToast } from './Toast'
import Spinner from './Spinner'

const EMPTY = {
  nombre: '',
  descripcion: '',
  precio_venta: '',
  id_medida: '',
  id_tipo_producto: '',
  id_polleria: '',
  stock_inicial: '',
  image_url: '',
}

function validate(v) {
  const e = {}
  const nombre = v.nombre.trim()
  if (!nombre) e.nombre = 'El nombre es obligatorio.'
  else if (nombre.length < 3) e.nombre = 'Mínimo 3 caracteres.'
  else if (nombre.length > 100) e.nombre = 'Máximo 100 caracteres.'

  if (v.descripcion.length > 255) e.descripcion = 'Máximo 255 caracteres.'

  const precio = Number(v.precio_venta)
  if (v.precio_venta === '') e.precio_venta = 'El precio es obligatorio.'
  else if (Number.isNaN(precio) || precio <= 0) e.precio_venta = 'Debe ser mayor a 0.'

  const stock = Number(v.stock_inicial)
  if (v.stock_inicial === '') e.stock_inicial = 'El stock inicial es obligatorio.'
  else if (Number.isNaN(stock) || stock < 0) e.stock_inicial = 'No puede ser negativo.'

  if (!v.id_medida) e.id_medida = 'Selecciona una medida.'
  if (!v.id_tipo_producto) e.id_tipo_producto = 'Selecciona un tipo.'
  if (!v.id_polleria) e.id_polleria = 'Selecciona una sucursal.'

  if (v.image_url && !/^https?:\/\/\S+$/i.test(v.image_url.trim())) e.image_url = 'URL inválida.'
  return e
}

export default function ProductForm({ catalogos, catalogosLoading, catalogosError, onReloadCatalogos, onCreated }) {
  const toast = useToast()
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const medidas = catalogos?.medidas ?? []
  const tipos = catalogos?.tipos ?? []
  const pollerias = catalogos?.pollerias ?? []
  const selectsDisabled = catalogosLoading || !!catalogosError

  const handleChange = (e) => {
    const { name, value } = e.target
    const next = { ...values, [name]: value }
    setValues(next)
    if (touched[name]) setErrors(validate(next))
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched((t) => ({ ...t, [name]: true }))
    setErrors(validate(values))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate(values)
    setErrors(errs)
    setTouched(Object.keys(EMPTY).reduce((acc, k) => ({ ...acc, [k]: true }), {}))
    if (Object.keys(errs).length) {
      toast.error('Revisa los campos marcados en rojo.')
      return
    }

    const payload = {
      nombre: values.nombre.trim(),
      descripcion: values.descripcion.trim() || null,
      precio_venta: Number(values.precio_venta),
      id_medida: Number(values.id_medida),
      id_tipo_producto: Number(values.id_tipo_producto),
      id_polleria: Number(values.id_polleria),
      stock_inicial: Number(values.stock_inicial),
      image_url: values.image_url.trim() || null,
    }

    setSubmitting(true)
    try {
      await api.createProduct(payload)
      toast.success(`Producto "${payload.nombre}" registrado con éxito.`)
      setValues(EMPTY)
      setErrors({})
      setTouched({})
      onCreated?.()
    } catch (err) {
      toast.error(`No se pudo registrar: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const fieldError = (name) => (touched[name] ? errors[name] : undefined)

  return (
    <form onSubmit={handleSubmit} noValidate className="card p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Registrar producto</h2>
          <p className="text-sm text-stone-500">Agrega un nuevo producto al catálogo.</p>
        </div>
        {catalogosLoading && <Spinner className="h-5 w-5 text-brasa-600" />}
      </div>

      {catalogosError && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          <span>Error al cargar catálogos: {catalogosError.message}</span>
          <button type="button" onClick={onReloadCatalogos} className="font-semibold underline">
            Reintentar
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nombre del producto" error={fieldError('nombre')} className="sm:col-span-2" required>
          <input
            name="nombre"
            value={values.nombre}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Ej. 1/2 Pollo a la Brasa"
            className={`input ${fieldError('nombre') ? 'input-error' : ''}`}
          />
        </Field>

        <Field label="Descripción" error={fieldError('descripcion')} className="sm:col-span-2">
          <textarea
            name="descripcion"
            rows={2}
            value={values.descripcion}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Ej. Con papas fritas y ensalada"
            className={`input resize-none ${fieldError('descripcion') ? 'input-error' : ''}`}
          />
        </Field>

        <Field label="Precio de venta (S/)" error={fieldError('precio_venta')} required>
          <input
            name="precio_venta"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={values.precio_venta}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="0.00"
            className={`input ${fieldError('precio_venta') ? 'input-error' : ''}`}
          />
        </Field>

        <Field label="Stock inicial" error={fieldError('stock_inicial')} required>
          <input
            name="stock_inicial"
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={values.stock_inicial}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="0"
            className={`input ${fieldError('stock_inicial') ? 'input-error' : ''}`}
          />
        </Field>

        <Select
          label="Medida"
          name="id_medida"
          options={medidas}
          value={values.id_medida}
          onChange={handleChange}
          onBlur={handleBlur}
          error={fieldError('id_medida')}
          disabled={selectsDisabled}
          loading={catalogosLoading}
        />
        <Select
          label="Tipo de producto"
          name="id_tipo_producto"
          options={tipos}
          value={values.id_tipo_producto}
          onChange={handleChange}
          onBlur={handleBlur}
          error={fieldError('id_tipo_producto')}
          disabled={selectsDisabled}
          loading={catalogosLoading}
        />
        <Select
          label="Sucursal"
          name="id_polleria"
          options={pollerias}
          value={values.id_polleria}
          onChange={handleChange}
          onBlur={handleBlur}
          error={fieldError('id_polleria')}
          disabled={selectsDisabled}
          loading={catalogosLoading}
          className="sm:col-span-2"
        />

        <Field label="URL de imagen (opcional)" error={fieldError('image_url')} className="sm:col-span-2">
          <input
            name="image_url"
            type="url"
            value={values.image_url}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="https://..."
            className={`input ${fieldError('image_url') ? 'input-error' : ''}`}
          />
        </Field>
      </div>

      <div className="mt-6 flex items-center justify-end gap-2">
        <button
          type="button"
          className="btn-ghost"
          disabled={submitting}
          onClick={() => {
            setValues(EMPTY)
            setErrors({})
            setTouched({})
          }}
        >
          Limpiar
        </button>
        <button type="submit" className="btn-primary" disabled={submitting || selectsDisabled}>
          {submitting && <Spinner />}
          {submitting ? 'Registrando…' : 'Registrar producto'}
        </button>
      </div>
    </form>
  )
}

function Field({ label, error, required, className = '', children }) {
  return (
    <label className={`block ${className}`}>
      <span className="label">
        {label} {required && <span className="text-brasa-600">*</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  )
}

function Select({ label, name, options, value, onChange, onBlur, error, disabled, loading, className }) {
  return (
    <Field label={label} error={error} required className={className}>
      <select
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        className={`input ${error ? 'input-error' : ''}`}
      >
        <option value="">{loading ? 'Cargando…' : `Selecciona ${label.toLowerCase()}`}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.nombre}
          </option>
        ))}
      </select>
    </Field>
  )
}
