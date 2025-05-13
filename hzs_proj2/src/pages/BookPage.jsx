import React, { useState } from 'react';
import '../styles/BookPage.css';
import BookAddForm from '../components/BookAddForm';
import BookEditForm from '../components/BookEditForm';
import BookCopyList from '../components/BookCopyList';
import BookInventory from '../components/BookInventory';
import { addBook, updateBook, deleteBook, addBookCopy, addAuthorToBook } from '../utils/api';

export default function BookPage() {
  const [activeForm, setActiveForm] = useState('inventory');
  const [editData, setEditData] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [authorFormData, setAuthorFormData] = useState({ book_id: '', author_id: '' });

  const resetState = () => {
    setEditData(null);
    setMessage('');
    setError('');
  };

  // Add a new book
  const handleAddBook = async (bookData) => {
    try {
      const newBook = await addBook(bookData);
      setMessage(`Book ${newBook.book_id} added successfully.`);
      setError('');
      setActiveForm('inventory'); // Switch to inventory view after adding
    } catch (err) {
      setError(`Failed to add book: ${err.message}`);
    }
  };

  // Load book data for editing
  const handleLoadForEdit = async (bookId) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/book/${bookId}`);
      if (!res.ok) throw new Error('Book not found');
      const data = await res.json();
      setEditData(data);
      setMessage('');
    } catch (err) {
      setMessage(`Failed to load book: ${err.message}`);
    }
  };

  // Update existing book
  const handleUpdate = async (bookData) => {
    if (!editData) return;
    try {
      const updated = await updateBook(editData.book_id, bookData);
      setMessage(`Book ${updated.book_id} updated successfully.`);
      setActiveForm('inventory'); // Switch to inventory view after updating
      setEditData(null);
    } catch (err) {
      setMessage(`Failed to update book: ${err.message}`);
    }
  };

  // Delete a book
  const handleDelete = async (bookId) => {
    if (!window.confirm(`Are you sure you want to delete book ${bookId}?`)) return;
    try {
      await deleteBook(bookId);
      setMessage(`Book ${bookId} deleted.`);
      setActiveForm('inventory'); // Switch to inventory view after deleting
    } catch (err) {
      setMessage(`Failed to delete book: ${err.message}`);
    }
  };

  const handleAddCopy = async (bookId) => {
    try {
      const newCopy = await addBookCopy(bookId, { status: 'AVAILABLE' });
      setMessage(`Book copy ${newCopy.copy_id} added successfully.`);
      setError('');
    } catch (err) {
      setError(`Failed to add book copy: ${err.message}`);
    }
  };

  const handleAddAuthor = async (e) => {
    e.preventDefault();
    const { book_id, author_id } = authorFormData;

    if (!book_id || !author_id) {
      setError('Book ID and Author ID are required');
      return;
    }

    try {
      const result = await addAuthorToBook(parseInt(book_id), parseInt(author_id));
      setMessage(`Author ${author_id} added to book ${book_id} successfully.`);
      setAuthorFormData({ book_id: '', author_id: '' });
      setError('');
    } catch (err) {
      setError(`Failed to add author to book: ${err.message}`);
    }
  };

  const handleAuthorFormChange = (e) => {
    const { name, value } = e.target;
    setAuthorFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="book-page">
      <h2>Book Management</h2>
      <div className="book-actions">
        <button
          className={activeForm === 'inventory' ? 'active' : ''}
          onClick={() => { setActiveForm('inventory'); resetState(); }}
        >
          View Inventory
        </button>
        <button
          className={activeForm === 'add' ? 'active' : ''}
          onClick={() => { setActiveForm('add'); resetState(); }}
        >
          Add Book
        </button>
        <button
          className={activeForm === 'edit' ? 'active' : ''}
          onClick={() => { setActiveForm('edit'); resetState(); }}
        >
          Edit Book
        </button>
        <button
          className={activeForm === 'author' ? 'active' : ''}
          onClick={() => { setActiveForm('author'); resetState(); }}
        >
          Add Author
        </button>
      </div>

      {error && <div className="error">{error}</div>}
      {message && <div className="message">{message}</div>}

      <div className="book-content">
        {activeForm === 'inventory' && <BookInventory />}
        {activeForm === 'add' && (
          <BookAddForm onSubmit={handleAddBook} />
        )}
        {activeForm === 'edit' && (
          <BookEditForm onSubmit={handleUpdate} onAddCopy={handleAddCopy} />
        )}
        {activeForm === 'author' && (
          <div className="form-section">
            <form className="book-form" onSubmit={handleAddAuthor}>
              <div className="form-group">
                <label htmlFor="book_id">Book ID</label>
                <input
                  id="book_id"
                  name="book_id"
                  type="text"
                  value={authorFormData.book_id}
                  onChange={handleAuthorFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="author_id">Author ID</label>
                <input
                  id="author_id"
                  name="author_id"
                  type="text"
                  value={authorFormData.author_id}
                  onChange={handleAuthorFormChange}
                  required
                />
              </div>
              <button type="submit" className="form-button">
                Add Author
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
