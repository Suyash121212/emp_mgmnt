import React, { useState } from 'react';
import { HiX } from 'react-icons/hi';

export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  options = [],
  required = false,
  disabled = false,
  placeholder = '',
  rows = 4,
  helpText,
}) {
  const [skillInput, setSkillInput] = useState('');

  // Handle skills tag addition
  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = skillInput.trim().replace(/^,|,$/g, '');
      if (trimmed) {
        const currentSkills = Array.isArray(value) ? value : (value ? value.toString().split(',').map(s => s.trim()) : []);
        if (!currentSkills.includes(trimmed)) {
          const updated = [...currentSkills, trimmed];
          onChange({ target: { name, value: updated } });
        }
        setSkillInput('');
      }
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    const currentSkills = Array.isArray(value) ? value : (value ? value.toString().split(',').map(s => s.trim()) : []);
    const updated = currentSkills.filter(s => s !== skillToRemove);
    onChange({ target: { name, value: updated } });
  };

  const handleSkillInputChange = (e) => {
    const val = e.target.value;
    if (val.includes(',')) {
      const parts = val.split(',').map(p => p.trim()).filter(Boolean);
      const currentSkills = Array.isArray(value) ? value : (value ? value.toString().split(',').map(s => s.trim()) : []);
      const newSkills = Array.from(new Set([...currentSkills, ...parts]));
      onChange({ target: { name, value: newSkills } });
      setSkillInput('');
    } else {
      setSkillInput(val);
    }
  };

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {type === 'select' ? (
        <select
          id={name}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          disabled={disabled}
          className={`block w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error
              ? 'border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-400' : ''}`}
        >
          <option value="" disabled={required}>
            {placeholder || `Select ${label || 'an option'}`}
          </option>
          {options.map((opt) => {
            const optValue = typeof opt === 'object' ? opt.value : opt;
            const optLabel = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={optValue} value={optValue}>
                {optLabel}
              </option>
            );
          })}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          rows={rows}
          value={value ?? ''}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`block w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error
              ? 'border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-400' : ''}`}
        />
      ) : type === 'multiselect' ? (
        <div className="space-y-2">
          {/* Tag Badges */}
          {Array.isArray(value) && value.length > 0 && (
            <div className="flex flex-wrap gap-1.5 p-2 bg-gray-50 border border-gray-200 rounded-lg">
              {value.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                >
                  {skill}
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-1 text-blue-600 hover:text-blue-900 focus:outline-none"
                    >
                      <HiX className="w-3.5 h-3.5" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          )}
          {/* Skill text input */}
          <input
            id={name}
            type="text"
            value={skillInput}
            onChange={handleSkillInputChange}
            onKeyDown={handleSkillKeyDown}
            disabled={disabled}
            placeholder={placeholder || 'Type skill and press Enter or comma (e.g. React, Node.js)'}
            className={`block w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error
                ? 'border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-400' : ''}`}
          />
          <p className="text-xs text-gray-500">Press Enter or separate with commas to add skills</p>
        </div>
      ) : (
        <input
          id={name}
          type={type}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`block w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error
              ? 'border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-400' : ''}`}
        />
      )}

      {helpText && !error && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}

      {error && (
        <p className="text-xs font-medium text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}
