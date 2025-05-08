import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { getBookById, updateBook, deleteBook, getBookCopies } from '../utils/api';
import BookCopyList from './BookCopyList';

function BookEditForm({ onAddCopy }) {
  const [bookId, setBookId] = useState('');
  const [bookData, setBookData] = useState(null);
  const [copies, setCopies] = useState([]);
  const [formData, setFormData] = useState({ b_name: '', topic: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const data = await getBookById(bookId);
      setBookData(data);
      setFormData({ b_name: data.b_name, topic: data.topic });
      
      // Fetch book copies
      const copiesData = await getBookCopies(bookId);
      setCopies(copiesData);
      
      setMessage('');
      setError('');
    } catch (err) {
      setError(`Failed to fetch book: ${err.message}`);
      setBookData(null);
      setCopies([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      const updated = await updateBook(bookId, formData);
      setMessage(`Book ${updated.book_id} updated successfully.`);
      setError('');
    } catch (err) {
      setError(`Failed to update book: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete book ${bookId}?`)) return;
    try {
      await deleteBook(bookId);
      setMessage(`Book ${bookId} deleted successfully.`);
      setBookData(null);
      setFormData({ b_name: '', topic: '' });
      setCopies([]);
      setError('');
    } catch (err) {
      setError(`Failed to delete book: ${err.message}`);
    }
  };

  const handleAddCopy = async () => {
    if (!bookId) {
      setError('Please search for a book first');
      return;
    }
    try {
      await onAddCopy(bookId);
      // Refresh copies list
      const copiesData = await getBookCopies(bookId);
      setCopies(copiesData);
      setMessage(`Book copy added successfully.`);
      setError('');
    } catch (err) {
      setError(`Failed to add book copy: ${err.message}`);
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
        <>
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
            <div className="button-group">
              <button onClick={handleUpdate}>Update Book</button>
              <button onClick={handleDelete} className="delete-button">Delete Book</button>
              <button onClick={handleAddCopy} className="add-copy-button">Add Copy</button>
            </div>
          </div>
          <BookCopyList copies={copies} />
        </>
      )}
    </div>
  );
}

BookEditForm.propTypes = {
  onAddCopy: PropTypes.func.isRequired
};

export default BookEditForm;