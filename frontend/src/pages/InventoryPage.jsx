import { useState } from 'react';
import { Button, Stack, TextField } from '@mui/material';
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

const getStockTone = (totalQuantity, reorderLevel) => {
  if (totalQuantity <= reorderLevel) return 'critical';
  if (totalQuantity <= reorderLevel * 1.4) return 'warning';
  return 'healthy';
};

const getStockLabel = (totalQuantity, reorderLevel) => {
  if (totalQuantity <= reorderLevel) return 'Reorder now';
  if (totalQuantity <= reorderLevel * 1.4) return 'Watch closely';
  return 'Healthy stock';
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

        <Stack component="form" onSubmit={submitItem} spacing={1.2}>
          <TextField
            label="Name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
          <TextField
            label="SKU"
            value={form.sku}
            onChange={(event) => setForm({ ...form, sku: event.target.value })}
            required
          />
          <TextField
            label="Category"
            value={form.category}
            onChange={(event) => setForm({ ...form, category: event.target.value })}
          />
          <TextField
            label="Unit"
            value={form.unit}
            onChange={(event) => setForm({ ...form, unit: event.target.value })}
          />
          <TextField
            label="Reorder Level"
            type="number"
            inputProps={{ min: 0 }}
            value={form.reorderLevel}
            onChange={(event) => setForm({ ...form, reorderLevel: event.target.value })}
          />

          <Button type="submit" startIcon={<FiPlusCircle />}>
            Create Item
          </Button>
        </Stack>
      </section>

      <TableCard title="Inventory Summary" subtitle="Aggregate stock view by item and batch count.">
        {inventorySummary.length === 0 ? (
          <EmptyState
            icon={<FiArchive />}
            title="No inventory batches yet"
            description="Use Load Demo Data on dashboard or receive a purchase order to populate this section."
          />
        ) : (
          <div className="summary-list">
            {inventorySummary.map((row) => {
              const tone = getStockTone(row.totalQuantity, row.reorderLevel);
              const fill = Math.max(8, Math.min(100, (row.totalQuantity / Math.max(1, row.reorderLevel * 2)) * 100));

              return (
                <article key={row.itemId} className={`summary-item stock-${tone}`}>
                  <div className="summary-main">
                    <p className="summary-sku">{row.sku}</p>
                    <h4>{row.name}</h4>
                  </div>

                  <div className="summary-metrics">
                    <span className="stat-chip">Qty: {row.totalQuantity}</span>
                    <span className="stat-chip">Reorder: {row.reorderLevel}</span>
                    <span className="stat-chip">Batches: {row.batchCount}</span>
                    <span className={`stat-chip stock-chip ${tone}`}>{getStockLabel(row.totalQuantity, row.reorderLevel)}</span>
                  </div>

                  <div className="summary-bar" role="img" aria-label={`Stock coverage ${Math.round(fill)} percent`}>
                    <span style={{ width: `${fill}%` }} />
                  </div>
                </article>
              );
            })}
          </div>
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
          <div className="catalog-grid">
            {items.map((item) => (
              <article key={item._id} className="catalog-tile">
                <p className="catalog-sku">{item.sku}</p>
                <h4>{item.name}</h4>
                <div className="catalog-meta">
                  <span className="pill">{item.category}</span>
                  <span className="pill">Unit: {item.unit}</span>
                  <span className="pill">Reorder: {item.reorderLevel}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </TableCard>
    </div>
  );
}
