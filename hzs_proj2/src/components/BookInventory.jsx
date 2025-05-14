import React, { useState, useEffect } from 'react';
import { getAllBooks } from '../utils/api';
import '../styles/BookInventory.css';

function BookInventory() {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const data = await getAllBooks();
      setBooks(data);
      setError('');
    } catch (err) {
      setError(`Failed to fetch books: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading books...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="book-inventory">
      <h2>Book Inventory</h2>
      <div className="inventory-table">
        <table>
          <thead>
            <tr>
              <th>Book ID</th>
              <th>Title</th>
              <th>Topic</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.book_id}>
                <td>{book.book_id}</td>
                <td>{book.b_name}</td>
                <td>{book.topic}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BookInventory; 