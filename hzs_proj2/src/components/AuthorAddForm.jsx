import React, { useState } from 'react';

function AuthorAddForm({ onSubmit }) {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { f_name, l_name, email } = formData;
    if (!f_name.trim() || !l_name.trim() || !email.trim()) {
      setError('First name, last name and email are required');
      return;
    }
    setError('');
    onSubmit(formData);
  };

  return (
    <form className="author-form" onSubmit={handleSubmit}>
      <h2 className="form-title">Add Author</h2>
      {error && <div className="form-error">{error}</div>}
      <div className="form-group">
        <label htmlFor="f_name">First Name</label>
        <input
          id="f_name"
          name="f_name"
          type="text"
          value={formData.f_name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="l_name">Last Name</label>
        <input
          id="l_name"
          name="l_name"
          type="text"
          value={formData.l_name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="state">State/Province</label>
        <input
          id="state"
          name="state"
          type="text"
          value={formData.state}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="country">Country</label>
        <input
          id="country"
          name="country"
          type="text"
          value={formData.country}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="street">Street</label>
        <input
          id="street"
          name="street"
          type="text"
          value={formData.street}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="city">City</label>
        <input
          id="city"
          name="city"
          type="text"
          value={formData.city}
          onChange={handleChange}
        />
      </div>
      <button type="submit" className="form-button">
        Add Author
      </button>
    </form>
  );
}

export default AuthorAddForm; 