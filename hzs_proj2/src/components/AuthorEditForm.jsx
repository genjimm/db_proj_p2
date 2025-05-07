import React, { useState, useEffect } from 'react';
import { getAuthorById, updateAuthor, deleteAuthor } from '../utils/api';

function AuthorEditForm() {
  const [authorId, setAuthorId] = useState('');
  const [authorData, setAuthorData] = useState(null);
  const [formData, setFormData] = useState({
    f_name: '',
    l_name: '',
    email: '',
    state: '',
    country: '',
    street: '',
    city: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const data = await getAuthorById(authorId);
      setAuthorData(data);
      setFormData({
        f_name: data.f_name,
        l_name: data.l_name,
        email: data.email,
        state: data.state || '',
        country: data.country || '',
        street: data.street || '',
        city: data.city || ''
      });
      setMessage('');
      setError('');
    } catch (err) {
      setError(`Failed to fetch author: ${err.message}`);
      setAuthorData(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      const updated = await updateAuthor(authorId, formData);
      setMessage(`Author ${updated.author_id} updated successfully.`);
      setError('');
    } catch (err) {
      setError(`Update failed: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete author ${authorId}?`)) return;
    try {
      await deleteAuthor(authorId);
      setMessage(`Author ${authorId} deleted successfully.`);
      setAuthorData(null);
      setFormData({
        f_name: '',
        l_name: '',
        email: '',
        state: '',
        country: '',
        street: '',
        city: ''
      });
    } catch (err) {
      setError(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div className="author-form">
      <form onSubmit={handleSearch}>
        <label>Author ID:</label>
        <input
          type="text"
          value={authorId}
          onChange={(e) => setAuthorId(e.target.value)}
          required
        />
        <button type="submit">Search</button>
      </form>

      {error && <div className="form-error">{error}</div>}
      {message && <div className="form-message">{message}</div>}

      {authorData && (
        <div className="update-section">
          <div className="form-group">
            <label>First Name:</label>
            <input
              name="f_name"
              type="text"
              value={formData.f_name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Last Name:</label>
            <input
              name="l_name"
              type="text"
              value={formData.l_name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>State/Province:</label>
            <input
              name="state"
              type="text"
              value={formData.state}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Country:</label>
            <input
              name="country"
              type="text"
              value={formData.country}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Street:</label>
            <input
              name="street"
              type="text"
              value={formData.street}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>City:</label>
            <input
              name="city"
              type="text"
              value={formData.city}
              onChange={handleChange}
            />
          </div>
          <button onClick={handleUpdate}>Update Author</button>
          <button onClick={handleDelete} style={{ marginLeft: '8px' }}>Delete Author</button>
        </div>
      )}
    </div>
  );
}

export default AuthorEditForm; 