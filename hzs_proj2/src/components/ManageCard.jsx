import React from 'react';

export default function ManageCard({ title, children }) {
  return (
    <div className="manage-card">
      <h2 className="manage-card-title">{title}</h2>
      <div className="manage-card-actions">
        {children  }
      </div>
    </div>
  );
}