import { useState } from 'react';
import { Button, Stack, TextField } from '@mui/material';
import { FiArchive, FiPackage, FiPlusCircle } from 'react-icons/fi';
import api from '../api/client';
import { useAppData } from '../context/AppContext';
import TableCard from '../components/TableCard';
import EmptyState from '../components/EmptyState';
import PageBanner from '../components/PageBanner';

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

const getExpiryStatus = (expiryDate) => {
  const now = new Date();
  const exp = new Date(expiryDate);
  const diff = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
  
  let progress = 100;
  if (diff > 0) {
     // Assuming 365 days is very safe (0 progress filling)
     progress = Math.max(5, Math.min(100, 100 - (diff / 365) * 100));
  }

  if (diff <= 0) return { label: 'Expired', tone: 'critical', progress: 100 };
  if (diff <= 7) return { label: `Expiring Soon! (In ${diff} days)`, tone: 'critical', progress };
  if (diff <= 30) return { label: `Expiring (In ${diff} days)`, tone: 'warning', progress };

  const months = Math.floor(diff / 30);
  if (months > 0) return { label: `Safe (In ${months} month${months > 1 ? 's' : ''})`, tone: 'healthy', progress };
  return { label: `Safe (In ${diff} days)`, tone: 'healthy', progress };
};

const getStockLabel = (totalQuantity, reorderLevel) => {
  if (totalQuantity <= reorderLevel) return 'Reorder now';
  if (totalQuantity <= reorderLevel * 1.4) return 'Watch closely';
  return 'Healthy stock';
};

export default function InventoryPage() {
  const { inventorySummary, items, batches, fetchAll, setError } = useAppData();
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
    <div className="inventory-layout">
      <PageBanner
        badge="Stock Management"
        badgeIcon={<FiPackage />}
        title="Inventory Command Center"
        description="Monitor stock health, manage catalog items, and track batch-level expiry across your hospital supply chain."
        theme="emerald"
      />
      <section className="inventory-hero-layout">
        <TableCard title="Inventory Health Summary" subtitle="Interactive stock view by item and batch count.">
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

                    <div className="summary-bar-wrapper">
                      <div className="summary-bar" role="img" aria-label={`Stock coverage ${Math.round(fill)} percent`}>
                        <span style={{ width: `${fill}%` }} />
                      </div>
                      <span className="summary-percent">{Math.round(fill)}%</span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </TableCard>
      </section>

      {/* Bottom Section: Split Layout */}
      <div className="inventory-bottom-layout">
        {/* Left Column: Form and Catalog */}
        <div className="inventory-left-col">
          <section className="form-card pin-card" style={{ marginBottom: '20px' }}>
            <header className="section-head">
              <h3>Add Inventory Item</h3>
              <p>Create catalog entries with reorder policy and unit metadata.</p>
            </header>

            <Stack component="form" onSubmit={submitItem} spacing={1.2}>
              <TextField
                label="Name"
                placeholder="e.g., Surgical Gloves"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
              />
              <TextField
                label="SKU"
                placeholder="e.g., MED-GLV-001"
                value={form.sku}
                onChange={(event) => setForm({ ...form, sku: event.target.value })}
                required
              />
              <TextField
                label="Category"
                placeholder="e.g., Consumables"
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
              />
              <TextField
                label="Unit"
                placeholder="e.g., boxes"
                value={form.unit}
                onChange={(event) => setForm({ ...form, unit: event.target.value })}
              />
              <TextField
                label="Reorder Level"
                placeholder="e.g., 40"
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

        {/* Right Column: Batch Details */}
        <div className="inventory-right-col">
          <TableCard title="Batch Details" subtitle="Granular stock breakdown by individual batch code and expiry.">
            {batches.length === 0 ? (
              <EmptyState
                icon={<FiArchive />}
                title="No batches available"
                description="Batches appear here when purchase orders are received or demo data is loaded."
              />
            ) : (
              <div className="batch-table-shell">
                <table className="batch-table">
                  <thead>
                    <tr>
                      <th>Batch Code</th>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th>Expiry Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batches.map((batch) => {
                      const status = getExpiryStatus(batch.expiryDate);
                      return (
                        <tr key={batch._id}>
                          <td>
                            <span className="batch-code">{batch.batchCode}</span>
                          </td>
                          <td>{batch.itemId?.name || 'N/A'}</td>
                          <td>{batch.quantity}</td>
                          <td>
                            <div className="expiry-progress-wrapper">
                              <span className={`pill po-pill ${status.tone}`}>{status.label}</span>
                              <div className={`expiry-progress-bar ${status.tone}`}>
                                <span style={{ width: `${status.progress}%` }} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </TableCard>
        </div>
      </div>
    </div>
  );
}

