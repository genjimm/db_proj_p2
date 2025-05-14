import React, { useState, useEffect } from 'react';
import { addRental } from '../utils/api';

function RentalAddForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    customer_id: '',
    copy_id: '',
    borrow_date: '',
    expected_return_date: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Set default time to current time
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Format date time string to YYYY-MM-DDThh:mm
    const formatDateTime = (date) => {
      return date.toISOString().slice(0, 16);
    };

    setFormData(prev => ({
      ...prev,
      borrow_date: formatDateTime(now),
      expected_return_date: formatDateTime(tomorrow)
    }));
  }, []);

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

    try {
      // Convert local time to UTC time
      const borrowDate = new Date(borrow_date);
      const expectedReturnDate = new Date(expected_return_date);

      // Check if date is valid
      if (isNaN(borrowDate.getTime()) || isNaN(expectedReturnDate.getTime())) {
        setError('Invalid date format');
        return;
      }

      // Check if expected return date is at least one day after rental date
      const oneDayInMs = 24 * 60 * 60 * 1000;
      if (expectedReturnDate.getTime() - borrowDate.getTime() < oneDayInMs) {
        setError('Expected return date must be at least one day after borrow date');
        return;
      }

      // Convert to ISO format to ensure consistency with curl command format
      const rentalData = {
        customer_id: parseInt(customer_id),
        copy_id: parseInt(copy_id),
        borrow_date: borrowDate.toISOString(),
        expected_return_date: expectedReturnDate.toISOString()
      };

      console.log('Data sent to backend:', rentalData);

      const newRental = await addRental(rentalData);
      if (newRental && newRental.rental_id) {
        setMessage(`Rental ${newRental.rental_id} created successfully.`);
        onSubmit(newRental);
        // Clear form
        setFormData({
          customer_id: '',
          copy_id: '',
          borrow_date: '',
          expected_return_date: ''
        });
        setError('');
      }
    } catch (err) {
      console.error('Rental creation error:', err);
      setError(err.message || 'Failed to create rental');
    }
  };

  return (
    <form className="rental-form" onSubmit={handleSubmit}>
      <h2 className="form-title">Create Rental</h2>
      {error && <div className="form-error">{error}</div>}
      {message && <div className="form-message">{message}</div>}
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