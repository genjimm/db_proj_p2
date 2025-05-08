import React from 'react';
import PropTypes from 'prop-types';

function BookCopyList({ copies }) {
  if (!copies || copies.length === 0) {
    return <div className="no-data">No copies available for this book</div>;
  }

  return (
    <div className="copy-list">
      <h3>Book Copies</h3>
      <table className="copy-table">
        <thead>
          <tr>
            <th>Copy ID</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {copies.map((copy) => (
            <tr key={copy.copy_id}>
              <td>{copy.copy_id}</td>
              <td>
                <span className={`status-badge ${copy.status.toLowerCase()}`}>
                  {copy.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

BookCopyList.propTypes = {
  copies: PropTypes.arrayOf(
    PropTypes.shape({
      copy_id: PropTypes.number.isRequired,
      book_id: PropTypes.number.isRequired,
      status: PropTypes.string.isRequired
    })
  ).isRequired
};

export default BookCopyList; 