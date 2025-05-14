import React, { useState } from 'react';
import './AuthorList.css';  // Import style file

function AuthorList({ authors, bookId, onAuthorAdded }) {
  const [newAuthorId, setNewAuthorId] = useState('');  // Store the input value for new author ID

  // Handle adding author operation
  const handleAddAuthor = async () => {
    if (!newAuthorId) return;  // If input is empty, do not execute
    try {
      // Call the add author API (POST request)
      const res = await fetch(`/book/${bookId}/authors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorId: newAuthorId })  // Send author ID as JSON
      });
      if (res.ok) {
        // Clear input field after successful addition
        setNewAuthorId('');
        // Notify parent component to refresh author list
        if (onAuthorAdded) {
          onAuthorAdded();
        }
      } else {
        console.error('Failed to add author, status code:', res.status);
      }
    } catch (error) {
      console.error('Failed to add author request:', error);
    }
  };

  return (
    <div className="author-list">
      <h3>Author List</h3>
      {/* Author name list, show prompt if no authors */}
      {authors.length > 0 ? (
        <ul>
          {authors.map(author => (
            <li key={author.id}>{author.name}</li>
          ))}
        </ul>
      ) : (
        <p>No author information available</p>
      )}
      {/* Add author input field and button */}
      <div className="add-author">
        <input 
          type="text" 
          placeholder="Enter Author ID" 
          value={newAuthorId}
          onChange={e => setNewAuthorId(e.target.value)}  // Update input value state
        />
        <button onClick={handleAddAuthor}>Add Author</button>
      </div>
    </div>
  );
}

export default AuthorList;