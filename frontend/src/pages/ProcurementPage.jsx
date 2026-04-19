import { useMemo, useState } from 'react';
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
  expiryDate: ''
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
          <form onSubmit={createPo} className="form-grid">
            <label>
              PO Number
              <input
                value={poForm.poNumber}
                onChange={(event) => setPoForm({ ...poForm, poNumber: event.target.value })}
              />
            </label>
            <label>
              Vendor
              <select
                value={poForm.vendorId}
                onChange={(event) => setPoForm({ ...poForm, vendorId: event.target.value })}
              >
                <option value="">Select vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor._id} value={vendor._id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Remarks
              <input
                value={poForm.remarks}
                onChange={(event) => setPoForm({ ...poForm, remarks: event.target.value })}
              />
            </label>

            {poForm.lines.map((line, index) => (
              <div className="line-row" key={`line-${index}`}>
                <select value={line.itemId} onChange={(event) => updateLine(index, { itemId: event.target.value })}>
                  <option value="">Item</option>
                  {items.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={line.quantity}
                  onChange={(event) => updateLine(index, { quantity: event.target.value })}
                />
                <input
                  type="text"
                  placeholder="Batch"
                  value={line.batchCode}
                  onChange={(event) => updateLine(index, { batchCode: event.target.value })}
                />
                <input
                  type="date"
                  value={line.expiryDate}
                  onChange={(event) => updateLine(index, { expiryDate: event.target.value })}
                />
              </div>
            ))}

            <div className="row-actions">
              <button type="button" className="button-secondary" onClick={addLine}>
                <FiPlusCircle />
                Add Line
              </button>
              <button type="submit" disabled={!canCreate}>
                <FiShoppingCart />
                Create PO
              </button>
            </div>
          </form>
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
          <table>
            <thead>
              <tr>
                <th>PO</th>
                <th>Vendor</th>
                <th>Status</th>
                <th>Lines</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.map((po) => (
                <tr key={po._id}>
                  <td>{po.poNumber}</td>
                  <td>{po.vendorId?.name || '--'}</td>
                  <td>{po.status}</td>
                  <td>{po.lines.length}</td>
                  <td className="compact-actions">
                    {po.status === 'Draft' ? <button onClick={() => transition(po._id, 'submit')}>Submit</button> : null}
                    {po.status === 'Submitted' ? <button onClick={() => transition(po._id, 'approve')}>Approve</button> : null}
                    {po.status === 'Submitted' ? <button onClick={() => transition(po._id, 'reject')}>Reject</button> : null}
                    {po.status === 'Approved' ? <button onClick={() => transition(po._id, 'receive')}>Receive</button> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableCard>
    </div>
  );
}
