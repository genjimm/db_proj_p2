import React, { useState } from 'react';
import '../styles/AuthorPage.css';
import AuthorAddForm from '../components/AuthorAddForm';
import AuthorEditForm from '../components/AuthorEditForm';
import { addAuthor } from '../utils/api';

export default function AuthorPage() {
  const [action, setAction] = useState('add');
  const [message, setMessage] = useState('');

  const resetState = () => {
    setMessage('');
  };

  // Add a new author
  const handleAdd = async (authorData) => {
    try {
      const newAuthor = await addAuthor(authorData);
      setMessage(`Author ${newAuthor.author_id} added successfully.`);
    } catch (err) {
      setMessage(`Failed to add author: ${err.message}`);
    }
  };

  return (
    <div className="author-page">
      <h2>Author Management</h2>
      <div className="author-actions">
        {['add', 'edit'].map((act) => (
          <button
            key={act}
            className={action === act ? 'active' : ''}
            onClick={() => { setAction(act); resetState(); }}
          >
            {act === 'add' ? 'Add Author' : 'Edit Author'}
          </button>
        ))}
      </div>

      <div className="author-content">
        {action === 'add' && (
          <AuthorAddForm onSubmit={handleAdd} />
        )}

        {action === 'edit' && (
          <AuthorEditForm />
        )}
      </div>
      {message && <div className="message">{message}</div>}
    </div>
  );
}
