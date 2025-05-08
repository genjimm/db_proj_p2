import React, { useState } from 'react';
import '../styles/RentalPage.css';
import RentalAddForm from '../components/RentalAddForm';
import RentalList from '../components/RentalList';
import { addRental } from '../utils/api';

export default function RentalPage() {
  const [action, setAction] = useState('add');
  const [message, setMessage] = useState('');

  const resetState = () => {
    setMessage('');
  };

  // Add a new rental
  const handleAdd = async (rentalData) => {
    try {
      const newRental = await addRental(rentalData);
      if (newRental && newRental.rental_id) {
        console.log('租借记录创建成功，ID:', newRental.rental_id);
        setMessage(`Rental ${newRental.rental_id} created successfully.`);
      } else {
        setMessage('Rental creation failed: No rental_id found in response');
      }
    } catch (err) {
      setMessage(`Failed to create rental: ${err.message}`);
    }
  };

  return (
    <div className="rental-page">
      <h2>Rental Management</h2>
      <div className="rental-actions">
        {['add', 'list'].map((act) => (
          <button
            key={act}
            className={action === act ? 'active' : ''}
            onClick={() => { setAction(act); resetState(); }}
          >
            {act === 'add' ? 'Create Rental' : 'Rental List'}
          </button>
        ))}
      </div>

      <div className="rental-content">
        {action === 'add' && (
          <RentalAddForm onSubmit={handleAdd} />
        )}

        {action === 'list' && (
          <RentalList />
        )}
      </div>
    </div>
  );
}
