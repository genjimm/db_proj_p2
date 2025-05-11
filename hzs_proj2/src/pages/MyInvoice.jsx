import React, { useEffect, useState } from 'react';
import { getUnpaidInvoices, payInvoice } from '../utils/api';

const MyInvoice = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [form, setForm] = useState({ method: '', card_holder_l_name: '', card_holder_f_name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getUnpaidInvoices();
      setInvoices(data);
    } catch (e) {
      setError(e.message || 'Failed to fetch invoices');
    }
    setLoading(false);
  };

  const handlePayClick = (invoice) => {
    setSelectedInvoice(invoice);
    setForm({ method: '', card_holder_l_name: '', card_holder_f_name: '' });
    setError('');
    setSuccess('');
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await payInvoice(selectedInvoice.invoice_id, form);
      setSuccess('Payment successful!');
      setSelectedInvoice(null);
      fetchInvoices();
    } catch (e) {
      setError(e.message || 'Payment failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
      <h2>My Invoices</h2>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
      <table border="1" cellPadding="8" style={{ width: '100%', marginTop: 16 }}>
        <thead>
          <tr>
            <th>Invoice ID</th>
            <th>Rental ID</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {invoices.length === 0 && (
            <tr><td colSpan={5}>No unpaid invoices</td></tr>
          )}
          {invoices.map(inv => (
            <tr key={inv.invoice_id}>
              <td>{inv.invoice_id}</td>
              <td>{inv.rental_id}</td>
              <td>{inv.invoic__amount}</td>
              <td>{inv.invoice_date}</td>
              <td>
                <button onClick={() => handlePayClick(inv)}>Pay</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedInvoice && (
        <div style={{ marginTop: 32, border: '1px solid #ccc', padding: 16 }}>
          <h3>Pay Invoice #{selectedInvoice.invoice_id}</h3>
          <form onSubmit={handlePaySubmit}>
            <div>
              <label>Payment Method:</label>
              <select name="method" value={form.method} onChange={handleFormChange} required>
                <option value="">Select</option>
                <option value="CASH">Cash</option>
                <option value="CREDIT">Credit Card</option>
                <option value="DEBIT">Debit Card</option>
                <option value="PAYPAL">PayPal</option>
              </select>
            </div>
            <div>
              <label>Cardholder Last Name:</label>
              <input name="card_holder_l_name" value={form.card_holder_l_name} onChange={handleFormChange} required />
            </div>
            <div>
              <label>Cardholder First Name:</label>
              <input name="card_holder_f_name" value={form.card_holder_f_name} onChange={handleFormChange} required />
            </div>
            <button type="submit" disabled={loading}>Confirm Payment</button>
            <button type="button" onClick={() => setSelectedInvoice(null)} style={{ marginLeft: 8 }}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default MyInvoice; 