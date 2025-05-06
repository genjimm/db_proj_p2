import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getBookById, updateBook, deleteBook } from '../utils/api';

function BookEditForm() {
  const [bookId, setBookId] = useState('');
  const [bookData, setBookData] = useState(null);
  const [formData, setFormData] = useState({ b_name: '', topic: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const data = await getBookById(bookId);
      setBookData(data);
      setFormData({ b_name: data.b_name, topic: data.topic });
      setMessage('');
      setError('');
    } catch (err) {
      setError(`Fetch error: ${err.message}`);
      setBookData(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      const updated = await updateBook(bookId, formData);
      setMessage(`Book ${updated.book_id} updated.`);
      setError('');
    } catch (err) {
      setError(`Update error: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete book ${bookId}?`)) return;
    try {
      await deleteBook(bookId);
      setMessage(`Book ${bookId} deleted.`);
      setBookData(null);
      setFormData({ b_name: '', topic: '' });
    } catch (err) {
      setError(`Delete error: ${err.message}`);
    }
  };

  return (
    <div className="book-form">
      <form onSubmit={handleSearch}>
        <label>Book ID:</label>
        <input
          type="text"
          value={bookId}
          onChange={(e) => setBookId(e.target.value)}
          required
        />
        <button type="submit">Search</button>
      </form>

      {error && <div className="form-error">{error}</div>}
      {message && <div className="form-message">{message}</div>}

      {bookData && (
        <div className="update-section">
          <div className="form-group">
            <label>Book Name:</label>
            <input
              name="b_name"
              type="text"
              value={formData.b_name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Topic:</label>
            <input
              name="topic"
              type="text"
              value={formData.topic}
              onChange={handleChange}
            />
          </div>
          <button onClick={handleUpdate}>Update Book</button>
          <button onClick={handleDelete} style={{ marginLeft: '8px' }}>Delete Book</button>
        </div>
      )}
    </div>
  );
}

export default BookEditForm;