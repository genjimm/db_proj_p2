import React, { useState } from 'react';
import { addRental } from '../utils/api';

function RentalAddForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    customer_id: '',
    copy_id: '',
    borrow_date: '',
    expected_return_date: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { customer_id, copy_id, borrow_date, expected_return_date } = formData;

    if (!customer_id || !copy_id || !borrow_date || !expected_return_date) {
      setError('All fields are required');
      return;
    }

    // Validate dates
    const borrowDate = new Date(borrow_date);
    const expectedReturnDate = new Date(expected_return_date);
    if (expectedReturnDate <= borrowDate) {
      setError('Expected return date must be later than borrow date');
      return;
    }

    try {
      // Format dates to ISO string
      const rentalData = {
        ...formData,
        borrow_date: borrowDate.toISOString(),
        expected_return_date: expectedReturnDate.toISOString()
      };

      const newRental = await addRental(rentalData);
      onSubmit(newRental);
      setFormData({
        customer_id: '',
        copy_id: '',
        borrow_date: '',
        expected_return_date: ''
      });
      setError('');
    } catch (err) {
      console.error('Rental creation error:', err);
      setError(err.message || 'Failed to create rental');
    }
  };

  return (
    <form className="rental-form" onSubmit={handleSubmit}>
      <h2 className="form-title">Create Rental</h2>
      {error && <div className="form-error">{error}</div>}
      <div className="form-group">
        <label htmlFor="customer_id">Customer ID</label>
        <input
          id="customer_id"
          name="customer_id"
          type="text"
          value={formData.customer_id}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="copy_id">Book Copy ID</label>
        <input
          id="copy_id"
          name="copy_id"
          type="text"
          value={formData.copy_id}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="borrow_date">Borrow Date</label>
        <input
          id="borrow_date"
          name="borrow_date"
          type="datetime-local"
          value={formData.borrow_date}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="expected_return_date">Expected Return Date</label>
        <input
          id="expected_return_date"
          name="expected_return_date"
          type="datetime-local"
          value={formData.expected_return_date}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit" className="form-button">
        Create Rental
      </button>
    </form>
  );
}

export default RentalAddForm; 