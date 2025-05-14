import React from 'react';
import './CopyList.css'; 

function CopyList({ copies, bookId, onCopyAdded }) {

  const handleAddCopy = async () => {
    try {
      const res = await fetch(`/book/${bookId}/copy`, { method: 'POST' });
      if (res.ok) {
        if (onCopyAdded) {
          onCopyAdded();
        }
      } else {
        console.error('Failed to add copy, status code:', res.status);
      }
    } catch (error) {
      console.error('Failed to add copy request:', error);
    }
  };

  return (
    <div className="copy-list">
      <h3>Copy List</h3>
      {/* Display copy list, show prompt if no copies */}
      {copies.length > 0 ? (
        <ul>
          {copies.map(copy => (
            <li key={copy.id}>
              Copy ID: {copy.id}, Status: {copy.status}
            </li>
          ))}
        </ul>
      ) : (
        <p>No copy information available</p>
      )}
      {/* Add copy button */}
      <button onClick={handleAddCopy}>Add Copy</button>
    </div>
  );
}

export default CopyList;