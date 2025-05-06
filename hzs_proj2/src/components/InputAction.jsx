import React, { useState } from 'react';
import PropTypes from 'prop-types';

export default function InputAction({ 
  label,           // 字段标签，如 "Book ID"
  placeholder,     // 占位符，如 "Enter book ID"
  buttonText,      // 按钮文字
  onSubmit,        // 回调 value => …
}) {
  const [value, setValue] = useState('');
  return (
    <div className="input-action">
      <label className="input-action__label">{label}</label>
      <div className="input-action__row">
        <input
          className="input-action__input"
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={e => setValue(e.target.value)}
        />
        <button
          className="input-action__button"
          onClick={() => onSubmit(value)}
          disabled={!value.trim()}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}

InputAction.propTypes = {
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  buttonText: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
};