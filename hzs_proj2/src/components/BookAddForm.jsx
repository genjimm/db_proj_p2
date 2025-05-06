import React, { useState } from 'react';

function BookAddForm({ onSubmit }) {
  const [formData, setFormData] = useState({ b_name: '', topic: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { b_name, topic } = formData;
    if (!b_name.trim() || !topic.trim()) {
      setError('书名和主题不能为空');
      return;
    }
    setError('');
    onSubmit(formData);
  };

  return (
    <form className="book-form" onSubmit={handleSubmit}>
      <h2 className="form-title">Add Book</h2>
      {error && <div className="form-error">{error}</div>}
      <div className="form-group">
        <label htmlFor="b_name">Book Name</label>
        <input
          id="b_name"
          name="b_name"
          type="text"
          value={formData.b_name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="topic">Topic</label>
        <input
          id="topic"
          name="topic"
          type="text"
          value={formData.topic}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit" className="form-button">
        Add Book
      </button>
    </form>
  );
}

export default BookAddForm;