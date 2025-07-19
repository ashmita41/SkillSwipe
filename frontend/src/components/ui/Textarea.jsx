import React from 'react'

const Textarea = ({
  label = "",
  placeholder = "",
  value = "",
  onChange,
  error = "",
  required = false,
  rows = 4,
  maxLength = null,
  className = "",
  ...props
}) => {
  const handleChange = (e) => {
    if (maxLength && e.target.value.length > maxLength) {
      return
    }
    onChange(e)
  }

  return (
    <div className={`${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
          {maxLength && (
            <span className="text-gray-500 text-xs ml-2">
              {value.length}/{maxLength}
            </span>
          )}
        </label>
      )}
      
      <textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-4 py-3 border rounded-lg shadow-sm transition-all duration-200 resize-none focus:outline-none ${
          error 
            ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
            : 'border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500'
        }`}
        {...props}
      />
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

export default Textarea 