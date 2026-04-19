import { useMemo, useState } from 'react';
import api from '../api/client';
import { useAppData } from '../context/AppContext';
import TableCard from '../components/TableCard';

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

  const updateLine = (idx, patch) => {
    const lines = [...poForm.lines];
    lines[idx] = { ...lines[idx], ...patch };
    setPoForm({ ...poForm, lines });
  };

  const addLine = () => setPoForm({ ...poForm, lines: [...poForm.lines, { ...emptyLine }] });

  const createPo = async (e) => {
    e.preventDefault();
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
      <section className="form-card">
        <h3>Create Purchase Order</h3>
        <form onSubmit={createPo} className="form-grid">
          <label>
            PO Number
            <input value={poForm.poNumber} onChange={(e) => setPoForm({ ...poForm, poNumber: e.target.value })} />
          </label>
          <label>
            Vendor
            <select value={poForm.vendorId} onChange={(e) => setPoForm({ ...poForm, vendorId: e.target.value })}>
              <option value="">Select vendor</option>
              {vendors.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Remarks
            <input value={poForm.remarks} onChange={(e) => setPoForm({ ...poForm, remarks: e.target.value })} />
          </label>

          {poForm.lines.map((line, idx) => (
            <div className="line-row" key={`line-${idx}`}>
              <select value={line.itemId} onChange={(e) => updateLine(idx, { itemId: e.target.value })}>
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
                onChange={(e) => updateLine(idx, { quantity: e.target.value })}
              />
              <input
                type="text"
                placeholder="Batch"
                value={line.batchCode}
                onChange={(e) => updateLine(idx, { batchCode: e.target.value })}
              />
              <input
                type="date"
                value={line.expiryDate}
                onChange={(e) => updateLine(idx, { expiryDate: e.target.value })}
              />
            </div>
          ))}

          <div className="row-actions">
            <button type="button" onClick={addLine}>
              Add Line
            </button>
            <button type="submit" disabled={!canCreate}>
              Create PO
            </button>
          </div>
        </form>
      </section>

      <TableCard title="Purchase Orders">
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
      </TableCard>
    </div>
  );
}
