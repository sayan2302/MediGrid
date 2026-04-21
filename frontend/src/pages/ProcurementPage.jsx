import { useMemo, useState } from 'react';
import { Box, Button, MenuItem, Stack, TextField } from '@mui/material';
import { FiClipboard, FiPlusCircle, FiShoppingCart } from 'react-icons/fi';
import api from '../api/client';
import { useAppData } from '../context/AppContext';
import TableCard from '../components/TableCard';
import EmptyState from '../components/EmptyState';

const emptyLine = {
  itemId: '',
  quantity: 1,
  unitPrice: 0,
  batchCode: '',
  expiryDate: new Date().toISOString().slice(0, 10)
};

const statusSteps = ['Draft', 'Submitted', 'Approved', 'Received'];

const getStatusIndex = (status) => {
  const index = statusSteps.indexOf(status);
  return index === -1 ? 0 : index;
};

export default function ProcurementPage() {
  const { purchaseOrders, vendors, items, fetchAll, setError } = useAppData();
  const [poForm, setPoForm] = useState({
    poNumber: `PO-${Date.now()}`,
    vendorId: '',
    remarks: '',
    lines: [{ ...emptyLine }]
  });

  const canCreate = useMemo(
    () => poForm.vendorId && poForm.lines.every((line) => line.itemId && line.batchCode && line.expiryDate),
    [poForm]
  );

  const hasPrerequisites = items.length > 0 && vendors.length > 0;

  const updateLine = (index, patch) => {
    const lines = [...poForm.lines];
    lines[index] = { ...lines[index], ...patch };
    setPoForm({ ...poForm, lines });
  };

  const addLine = () => {
    setPoForm({ ...poForm, lines: [...poForm.lines, { ...emptyLine }] });
  };

  const createPo = async (event) => {
    event.preventDefault();
    try {
      await api.post('/purchase-orders', {
        ...poForm,
        lines: poForm.lines.map((line) => ({
          ...line,
          quantity: Number(line.quantity),
          unitPrice: Number(line.unitPrice)
        }))
      });

      setPoForm({
        poNumber: `PO-${Date.now()}`,
        vendorId: '',
        remarks: '',
        lines: [{ ...emptyLine }]
      });
      await fetchAll();
    } catch (error) {
      setError(error?.response?.data?.message || error.message);
    }
  };

  const transition = async (id, action) => {
    try {
      await api.post(`/purchase-orders/${id}/${action}`);
      await fetchAll();
    } catch (error) {
      setError(error?.response?.data?.message || error.message);
    }
  };

  return (
    <div className="page-grid two-col">
      <section className="form-card pin-card">
        <header className="section-head">
          <h3>Create Purchase Order</h3>
          <p>Build line items, submit for approval, and receive into inventory.</p>
        </header>

        {!hasPrerequisites ? (
          <EmptyState
            icon={<FiClipboard />}
            title="Setup missing"
            description="Add at least one item and one vendor to start procurement workflows."
          />
        ) : (
          <Stack component="form" onSubmit={createPo} spacing={1.6}>
            <TextField
              label="PO Number"
              value={poForm.poNumber}
              onChange={(event) => setPoForm({ ...poForm, poNumber: event.target.value })}
            />
            <TextField
              select
              label="Vendor"
              value={poForm.vendorId}
              onChange={(event) => setPoForm({ ...poForm, vendorId: event.target.value })}
            >
              <MenuItem value="">Select vendor</MenuItem>
              {vendors.map((vendor) => (
                <MenuItem key={vendor._id} value={vendor._id}>
                  {vendor.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Remarks"
              value={poForm.remarks}
              onChange={(event) => setPoForm({ ...poForm, remarks: event.target.value })}
            />

            {poForm.lines.map((line, index) => (
              <Box
                key={`line-${index}`}
                className="po-line-grid"
                sx={{
                  display: 'grid',
                  gap: 1.3,
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', xl: '1.4fr 0.7fr 1fr 1fr' }
                }}
              >
                <TextField
                  select
                  label="Item"
                  value={line.itemId}
                  onChange={(event) => updateLine(index, { itemId: event.target.value })}
                >
                  <MenuItem value="">Item</MenuItem>
                  {items.map((item) => (
                    <MenuItem key={item._id} value={item._id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  type="number"
                  label="Qty"
                  inputProps={{ min: 1 }}
                  value={line.quantity}
                  onChange={(event) => updateLine(index, { quantity: event.target.value })}
                />
                <TextField
                  label="Batch"
                  value={line.batchCode}
                  onChange={(event) => updateLine(index, { batchCode: event.target.value })}
                />
                <TextField
                  type="date"
                  label="Expiry"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: new Date().toISOString().slice(0, 10) }}
                  value={line.expiryDate}
                  onChange={(event) => updateLine(index, { expiryDate: event.target.value })}
                />
              </Box>
            ))}

            <div className="row-actions">
              <Button type="button" variant="outlined" onClick={addLine} startIcon={<FiPlusCircle />}>
                Add Line
              </Button>
              <Button type="submit" disabled={!canCreate} startIcon={<FiShoppingCart />}>
                Create PO
              </Button>
            </div>
          </Stack>
        )}
      </section>

      <TableCard title="Purchase Orders" subtitle="Status machine from Draft to Received.">
        {purchaseOrders.length === 0 ? (
          <EmptyState
            icon={<FiClipboard />}
            title="No purchase orders yet"
            description="Create your first PO to trigger approvals and stock intake workflow."
          />
        ) : (
          <div className="po-board">
            {purchaseOrders.map((po) => {
              const stepIndex = getStatusIndex(po.status);

              return (
                <article key={po._id} className={`po-card status-${po.status.toLowerCase()}`}>
                  <div className="po-head">
                    <div>
                      <p className="po-id">{po.poNumber}</p>
                      <h4>{po.vendorId?.name || 'Unknown vendor'}</h4>
                    </div>
                    <span className={`pill po-pill ${po.status.toLowerCase()}`}>{po.status}</span>
                  </div>

                  <div className="po-meta">
                    <span className="stat-chip">Lines: {po.lines.length}</span>
                    {po.remarks ? <span className="stat-chip">{po.remarks}</span> : null}
                  </div>

                  <div className="po-progress">
                    {statusSteps.map((step, index) => (
                      <span key={`${po._id}-${step}`} className={`po-step ${index <= stepIndex ? 'active' : ''}`}>
                        {step}
                      </span>
                    ))}
                  </div>

                  <div className="compact-actions">
                    {po.status === 'Draft' ? <button onClick={() => transition(po._id, 'submit')}>Submit</button> : null}
                    {po.status === 'Submitted' ? <button onClick={() => transition(po._id, 'approve')}>Approve</button> : null}
                    {po.status === 'Submitted' ? <button onClick={() => transition(po._id, 'reject')}>Reject</button> : null}
                    {po.status === 'Approved' ? <button onClick={() => transition(po._id, 'receive')}>Receive</button> : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </TableCard>
    </div>
  );
}
