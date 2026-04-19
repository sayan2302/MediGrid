import { useState } from 'react';
import { FiArchive, FiPlusCircle } from 'react-icons/fi';
import api from '../api/client';
import { useAppData } from '../context/AppContext';
import TableCard from '../components/TableCard';
import EmptyState from '../components/EmptyState';

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

  const submitItem = async (event) => {
    event.preventDefault();
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
      <section className="form-card pin-card">
        <header className="section-head">
          <h3>Add Inventory Item</h3>
          <p>Create catalog entries with reorder policy and unit metadata.</p>
        </header>

        <form onSubmit={submitItem} className="form-grid">
          <label>
            Name
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          </label>
          <label>
            SKU
            <input value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value })} required />
          </label>
          <label>
            Category
            <input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} />
          </label>
          <label>
            Unit
            <input value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} />
          </label>
          <label>
            Reorder Level
            <input
              type="number"
              min="0"
              value={form.reorderLevel}
              onChange={(event) => setForm({ ...form, reorderLevel: event.target.value })}
            />
          </label>

          <button type="submit">
            <FiPlusCircle />
            Create Item
          </button>
        </form>
      </section>

      <TableCard title="Inventory Summary" subtitle="Aggregate stock view by item and batch count.">
        {inventorySummary.length === 0 ? (
          <EmptyState
            icon={<FiArchive />}
            title="No inventory batches yet"
            description="Use Load Demo Data on dashboard or receive a purchase order to populate this section."
          />
        ) : (
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
        )}
      </TableCard>

      <TableCard title="Item Catalog" subtitle="Master list of medicines and consumables.">
        {items.length === 0 ? (
          <EmptyState
            icon={<FiArchive />}
            title="Catalog is empty"
            description="Create your first item using the form to start inventory planning."
          />
        ) : (
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
              {items.map((item) => (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td>{item.sku}</td>
                  <td>{item.category}</td>
                  <td>{item.unit}</td>
                  <td>{item.reorderLevel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableCard>
    </div>
  );
}
