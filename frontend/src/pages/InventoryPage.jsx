import { useState } from 'react';
import api from '../api/client';
import { useAppData } from '../context/AppContext';
import TableCard from '../components/TableCard';

const initialForm = {
  name: '',
  sku: '',
  category: 'Consumables',
  unit: 'units',
  reorderLevel: 10
};

export default function InventoryPage() {
  const { inventorySummary, items, fetchAll, setError } = useAppData();
  const [form, setForm] = useState(initialForm);

  const submitItem = async (e) => {
    e.preventDefault();
    try {
      await api.post('/items', {
        ...form,
        reorderLevel: Number(form.reorderLevel)
      });
      setForm(initialForm);
      await fetchAll();
    } catch (error) {
      setError(error?.response?.data?.message || error.message);
    }
  };

  return (
    <div className="page-grid two-col">
      <section className="form-card">
        <h3>Add Inventory Item</h3>
        <form onSubmit={submitItem} className="form-grid">
          <label>
            Name
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label>
            SKU
            <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
          </label>
          <label>
            Category
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </label>
          <label>
            Unit
            <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
          </label>
          <label>
            Reorder Level
            <input
              type="number"
              min="0"
              value={form.reorderLevel}
              onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })}
            />
          </label>
          <button type="submit">Create Item</button>
        </form>
      </section>

      <TableCard title="Inventory Summary">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Total Qty</th>
              <th>Reorder</th>
              <th>Batches</th>
            </tr>
          </thead>
          <tbody>
            {inventorySummary.map((row) => (
              <tr key={row.itemId}>
                <td>{row.sku}</td>
                <td>{row.name}</td>
                <td>{row.totalQuantity}</td>
                <td>{row.reorderLevel}</td>
                <td>{row.batchCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>

      <TableCard title="Item Catalog">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Unit</th>
              <th>Reorder Level</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row._id}>
                <td>{row.name}</td>
                <td>{row.sku}</td>
                <td>{row.category}</td>
                <td>{row.unit}</td>
                <td>{row.reorderLevel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>
    </div>
  );
}
