import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, X } from 'lucide-react'

const MultiSelect = ({ 
  options = [], 
  value = [], 
  onChange, 
  placeholder = "Select options...", 
  maxSelections = null,
  className = "",
  label = "",
  error = ""
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

  const handleToggleOption = (option) => {
    if (value.includes(option)) {
      // Remove option
      onChange(value.filter(item => item !== option))
    } else {
      // Add option (check max selections)
      if (!maxSelections || value.length < maxSelections) {
        onChange([...value, option])
      }
    }
  }

  const handleRemoveOption = (option, e) => {
    e.stopPropagation()
    onChange(value.filter(item => item !== option))
  }

  const getPlaceholderText = () => {
    if (value.length === 0) return placeholder
    if (maxSelections && value.length >= maxSelections) {
      return `Maximum ${maxSelections} selected`
    }
    return `${value.length} selected`
  }

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {maxSelections && (
            <span className="text-gray-500 text-xs ml-1">
              (Max {maxSelections})
            </span>
          )}
        </label>
      )}
      
      <div className="relative" ref={dropdownRef}>
        {/* Selected Tags Display */}
        {value.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {value.map((option, index) => (
              <motion.span
                key={option}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800 border border-primary-200"
              >
                {option}
                <button
                  type="button"
                  onClick={(e) => handleRemoveOption(option, e)}
                  className="ml-2 text-primary-600 hover:text-primary-800 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            ))}
          </div>
        )}

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
          <span className={value.length === 0 ? 'text-gray-500' : 'text-gray-900'}>
            {getPlaceholderText()}
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
                  const isSelected = value.includes(option)
                  const isDisabled = maxSelections && value.length >= maxSelections && !isSelected
                  
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => !isDisabled && handleToggleOption(option)}
                      disabled={isDisabled}
                      className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                        isSelected
                          ? 'bg-primary-50 text-primary-900 font-medium'
                          : isDisabled
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
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

export default MultiSelect 