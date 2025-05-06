import React from 'react';

export default function DetailPanel({ title, children }) {
  return (
    <div className="detail-panel">
      <h1 className="detail-panel__title">{title}</h1>
      <div className="detail-panel__body">{children}</div>
    </div>
  );
}