import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const Select = ({ 
  options = [], 
  value = "", 
  onChange, 
  placeholder = "Select an option...", 
  className = "",
  label = "",
  error = "",
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectOption = (option) => {
    onChange(option.value)
    setIsOpen(false)
  }

  const getDisplayText = () => {
    if (!value) return placeholder
    const selectedOption = options.find(opt => opt.value === value)
    return selectedOption ? selectedOption.label : value
  }

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative" ref={dropdownRef}>
        {/* Dropdown Trigger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-4 py-3 text-left bg-white border rounded-lg shadow-sm transition-all duration-200 flex items-center justify-between ${
            error 
              ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
              : 'border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500'
          } ${isOpen ? 'ring-1 ring-primary-500 border-primary-500' : ''}`}
        >
          <span className={!value ? 'text-gray-500' : 'text-gray-900'}>
            {getDisplayText()}
          </span>
          <ChevronDown 
            className={`w-5 h-5 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`} 
          />
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              {options.length === 0 ? (
                <div className="px-4 py-3 text-gray-500 text-sm">
                  No options available
                </div>
              ) : (
                options.map((option) => {
                  const isSelected = value === option.value
                  
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelectOption(option)}
                      className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                        isSelected
                          ? 'bg-primary-50 text-primary-900 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option.label}</span>
                        {isSelected && (
                          <span className="text-primary-600">✓</span>
                        )}
                      </div>
                    </button>
                  )
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

export default Select 