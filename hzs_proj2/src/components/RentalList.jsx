import React, { useState } from 'react';
import { getRentalsByCustomer, returnRental } from '../utils/api';

function RentalList() {
  const [customerId, setCustomerId] = useState('');
  const [rentals, setRentals] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const data = await getRentalsByCustomer(customerId);
      setRentals(data);
      setError('');
      setMessage('');
    } catch (err) {
      setError(`Failed to fetch rentals: ${err.message}`);
      setRentals([]);
    }
  };

  const handleReturn = async (rentalId) => {
    if (window.confirm(`Are you sure you want to return rental ${rentalId}?`)) {
      try {
        await returnRental(rentalId);
        setMessage(`Rental ${rentalId} returned successfully.`);
        // Refresh the rental list
        const data = await getRentalsByCustomer(customerId);
        setRentals(data);
      } catch (err) {
        setError(`Failed to return rental: ${err.message}`);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not returned';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="rental-list">
      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          placeholder="Enter Customer ID"
          required
        />
        <button type="submit">Search</button>
      </form>

      {error && <div className="error">{error}</div>}
      {message && <div className="message">{message}</div>}

      {rentals.length > 0 ? (
        <table className="rental-table">
          <thead>
            <tr>
              <th>Rental ID</th>
              <th>Customer ID</th>
              <th>Copy ID</th>
              <th>Borrow Date</th>
              <th>Expected Return</th>
              <th>Actual Return</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rentals.map((rental) => (
              <tr key={rental.rental_id}>
                <td>{rental.rental_id}</td>
                <td>{rental.customer_id}</td>
                <td>{rental.copy_id}</td>
                <td>{formatDate(rental.borrow_date)}</td>
                <td>{formatDate(rental.expected_return_date)}</td>
                <td>{formatDate(rental.actual_return_date)}</td>
                <td>
                  {!rental.actual_return_date && (
                    <button
                      className="return-button"
                      onClick={() => handleReturn(rental.rental_id)}
                    >
                      Return
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-data">No rental records found</div>
      )}
    </div>
  );
}

export default RentalList; 