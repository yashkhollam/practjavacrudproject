import { useEffect, useState } from 'react'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')
const emptyForm = { name: '', description: '', price: '' }

export default function App() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadProducts() {
    setLoading(true)
    try {
      const response = await fetch(`${API}/api/products`)
      if (!response.ok) throw new Error(`API returned ${response.status}`)
      setProducts(await response.json())
      setMessage('')
    } catch (error) {
      setMessage(`Could not load products. Check that the backend is running. (${error.message})`)
    } finally { setLoading(false) }
  }

  useEffect(() => { loadProducts() }, [])

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    const isEdit = editingId !== null
    try {
      const response = await fetch(`${API}/api/products${isEdit ? `/${editingId}` : ''}`, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, price: Number(form.price) })
      })
      if (!response.ok) {
        const body = await response.text()
        throw new Error(body || `Request failed: ${response.status}`)
      }
      setForm(emptyForm)
      setEditingId(null)
      setMessage(isEdit ? 'Product updated successfully.' : 'Product created successfully.')
      await loadProducts()
    } catch (error) { setMessage(`Save failed: ${error.message}`) }
  }

  function startEdit(product) {
    setEditingId(product.id)
    setForm({ name: product.name, description: product.description, price: String(product.price) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function deleteProduct(id) {
    if (!window.confirm('Delete this product?')) return
    try {
      const response = await fetch(`${API}/api/products/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error(`Request failed: ${response.status}`)
      setMessage('Product deleted.')
      await loadProducts()
    } catch (error) { setMessage(`Delete failed: ${error.message}`) }
  }

  function cancelEdit() { setEditingId(null); setForm(emptyForm) }

  return <main className="container">
    <header>
      <div className="eyebrow">SPRING BOOT + REACT</div>
      <h1>Product Manager</h1>
      <p>A simple full-stack CRUD application deployed on Render.</p>
    </header>

    <section className="card">
      <h2>{editingId ? 'Update product' : 'Add a product'}</h2>
      <form onSubmit={handleSubmit}>
        <label>Product name<input name="name" value={form.name} onChange={handleChange} required maxLength="100" placeholder="e.g. Wireless Mouse" /></label>
        <label>Description<textarea name="description" value={form.description} onChange={handleChange} required maxLength="500" rows="3" placeholder="Short product description" /></label>
        <label>Price (₹)<input name="price" type="number" min="0.01" step="0.01" value={form.price} onChange={handleChange} required placeholder="499.00" /></label>
        <div className="actions">
          <button type="submit">{editingId ? 'Save changes' : 'Create product'}</button>
          {editingId && <button type="button" className="secondary" onClick={cancelEdit}>Cancel</button>}
        </div>
      </form>
    </section>

    {message && <div className="message" role="status">{message}</div>}

    <section className="list-section">
      <div className="list-heading"><h2>Products</h2><button className="secondary refresh" onClick={loadProducts}>Refresh</button></div>
      {loading ? <p className="muted">Loading products…</p> : products.length === 0 ? <p className="muted">No products yet. Add your first one above.</p> :
        <div className="table-wrap"><table>
          <thead><tr><th>Name</th><th>Description</th><th>Price</th><th>Actions</th></tr></thead>
          <tbody>{products.map(product => <tr key={product.id}>
            <td data-label="Name"><strong>{product.name}</strong></td>
            <td data-label="Description">{product.description}</td>
            <td data-label="Price">₹{Number(product.price).toFixed(2)}</td>
            <td data-label="Actions"><div className="row-actions"><button className="small secondary" onClick={() => startEdit(product)}>Edit</button><button className="small danger" onClick={() => deleteProduct(product.id)}>Delete</button></div></td>
          </tr>)}</tbody>
        </table></div>}
    </section>
    <footer>Demo project · React frontend · Spring Boot REST API · PostgreSQL database</footer>
  </main>
}
