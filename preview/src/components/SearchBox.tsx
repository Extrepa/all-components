import React from 'react';
import './SearchBox.css';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBox({ value, onChange }: SearchBoxProps) {
  return (
    <div className="search-box">
      <input
        type="text"
        className="search-input"
        placeholder="🔍 Search components..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

