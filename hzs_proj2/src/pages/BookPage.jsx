import React, { useState } from 'react';
import '../styles/BookPage.css';
import BookAddForm from '../components/BookAddForm';
import BookEditForm from '../components/BookEditForm';
import { addBook, updateBook, deleteBook } from '../utils/api';

export default function BookPage() {
  const [action, setAction] = useState('add');
  const [editData, setEditData] = useState(null);
  const [message, setMessage] = useState('');

  const resetState = () => {
    setEditData(null);
    setMessage('');
  };

  // Add a new book
  const handleAdd = async (bookData) => {
    try {
      const newBook = await addBook(bookData);
      setMessage(`Book ${newBook.book_id} added successfully.`);
    } catch (err) {
      setMessage(`Failed to add book: ${err.message}`);
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
      setAction('add');
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
    } catch (err) {
      setMessage(`Failed to delete book: ${err.message}`);
    }
  };

  return (
    <div className="book-page">
      <h2>Book Management</h2>
      <div className="book-actions">
        {['add', 'edit'].map((act) => (
          <button
            key={act}
            className={action === act ? 'active' : ''}
            onClick={() => { setAction(act); resetState(); }}
          >
            {act.charAt(0).toUpperCase() + act.slice(1)}
          </button>
        ))}
      </div>

      <div className="book-content">
        {action === 'add' && (
          <BookAddForm onSubmit={handleAdd} />
        )}

        {action === 'edit' && (
          <BookEditForm onSubmit={handleUpdate}/>
        )}

      </div>
      {message && <div className="message">{message}</div>}
    </div>
  );
}
