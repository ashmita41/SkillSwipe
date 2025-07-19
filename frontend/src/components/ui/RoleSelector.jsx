import React from 'react'
import { Code, Building } from 'lucide-react'

const RoleSelector = ({ value, onChange, error }) => {
  const roles = [
    {
      value: 'developer',
      label: 'Developer',
      description: 'Looking for exciting opportunities to code and create',
      icon: Code,
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      value: 'company',
      label: 'Company',
      description: 'Seeking talented developers to join our team',
      icon: Building,
      gradient: 'from-green-500 to-teal-600'
    }
  ]

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        I am a <span className="text-red-500">*</span>
      </label>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((role) => {
          const Icon = role.icon
          const isSelected = value === role.value
          
          return (
            <div
              key={role.value}
              onClick={() => onChange(role.value)}
              className={`
                relative cursor-pointer rounded-xl p-6 border-2 transition-all duration-300 transform hover:scale-105
                ${isSelected 
                  ? 'border-primary-500 bg-primary-50 shadow-lg ring-2 ring-primary-200' 
                  : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-md'
                }
              `}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`
                  w-16 h-16 rounded-full flex items-center justify-center mb-4 
                  bg-gradient-to-r ${role.gradient} shadow-lg
                  ${isSelected ? 'scale-110' : ''}
                  transition-transform duration-300
                `}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className={`
                  text-lg font-semibold mb-2 transition-colors duration-300
                  ${isSelected ? 'text-primary-700' : 'text-gray-900'}
                `}>
                  {role.label}
                </h3>
                
                <p className={`
                  text-sm transition-colors duration-300
                  ${isSelected ? 'text-primary-600' : 'text-gray-600'}
                `}>
                  {role.description}
                </p>
              </div>
              
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

export default RoleSelector 