import React from 'react';

export function ActionGroup({ children }) {
  return <div className="action-group">{children}</div>;
}

// components/ActionButton.jsx
export function ActionButton({ onClick, children }) {
  return (
    <button className="action-button" onClick={onClick}>
      {children}
    </button>
  );
}