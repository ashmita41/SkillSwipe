import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, DollarSign, MapPin, Clock, Monitor, Briefcase, Filter } from 'lucide-react'
import Button from './ui/Button'

const FilterPanel = ({ userRole, onFilterChange, onClose }) => {
  const [filters, setFilters] = useState({
    salary_min: 300000,
    salary_max: 2500000,
    location: '',
    experience: '',
    tech_stack: '',
    job_type: '',
    work_mode: ''
  })

  const handleSliderChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleSelectChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleApplyFilters = () => {
    const cleanedFilters = {}
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== '') {
        cleanedFilters[key] = filters[key]
      }
    })
    onFilterChange(cleanedFilters)
  }

  const handleClearFilters = () => {
    setFilters({
      salary_min: 300000,
      salary_max: 2500000,
      location: '',
      experience: '',
      tech_stack: '',
      job_type: '',
      work_mode: ''
    })
  }

  // Developer-specific filters
  const jobTypes = [
    { value: '', label: 'Any Job Type' },
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' }
  ]

  const workModes = [
    { value: '', label: 'Any Work Mode' },
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'onsite', label: 'On-site' }
  ]

  const experienceLevels = [
    { value: '', label: 'Any Experience' },
    { value: 'entry', label: 'Entry Level' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior Level' },
    { value: 'lead', label: 'Lead/Principal' }
  ]

  const techStacks = [
    'JavaScript', 'Python', 'Java', 'TypeScript', 'React', 'Node.js', 'Django', 
    'Flask', 'Spring', 'Angular', 'Vue.js', 'Docker', 'AWS', 'PostgreSQL', 'MongoDB'
  ]

  const popularCities = [
    'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata',
    'Gurugram', 'Noida', 'Ahmedabad', 'Jaipur', 'Kochi', 'Indore', 'Chandigarh', 'Bhubaneswar',
    'Thiruvananthapuram', 'Nagpur', 'Coimbatore', 'Vadodara', 'Mysuru'
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Filter className="w-6 h-6" />
              <h2 className="text-2xl font-bold">Customize Your Feed</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-white/80 mt-2">
            {userRole === 'developer' 
              ? 'Filter jobs based on your preferences'
              : 'Filter developers based on your requirements'
            }
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Salary Range Slider */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-gray-600" />
                <label className="font-semibold text-gray-900">
                  {userRole === 'developer' ? 'Salary Range' : 'Budget Range'}
                </label>
              </div>
              <div className="text-sm font-medium text-primary-600">
                ₹{(filters.salary_min/100000).toFixed(1)}L - ₹{(filters.salary_max/100000).toFixed(1)}L
              </div>
            </div>
            
            {/* Dual Range Slider */}
            <div className="relative">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-2 block">Minimum</label>
                  <input
                    type="range"
                    min="200000"
                    max="3000000"
                    step="50000"
                    value={filters.salary_min}
                    onChange={(e) => handleSliderChange('salary_min', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-2 block">Maximum</label>
                  <input
                    type="range"
                    min="300000"
                    max="5000000"
                    step="50000"
                    value={filters.salary_max}
                    onChange={(e) => handleSliderChange('salary_max', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location Filter */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <MapPin className="w-5 h-5 text-gray-600" />
              <label className="font-semibold text-gray-900">Location</label>
            </div>
            <select
              value={filters.location}
              onChange={(e) => handleSelectChange('location', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Any Location</option>
              {popularCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {userRole === 'developer' && (
            <>
              {/* Job Type Filter */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Briefcase className="w-5 h-5 text-gray-600" />
                  <label className="font-semibold text-gray-900">Job Type</label>
                </div>
                <select
                  value={filters.job_type}
                  onChange={(e) => handleSelectChange('job_type', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {jobTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Work Mode Filter */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Monitor className="w-5 h-5 text-gray-600" />
                  <label className="font-semibold text-gray-900">Work Mode</label>
                </div>
                <select
                  value={filters.work_mode}
                  onChange={(e) => handleSelectChange('work_mode', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {workModes.map(mode => (
                    <option key={mode.value} value={mode.value}>{mode.label}</option>
                  ))}
                </select>
              </div>

              {/* Tech Stack Filter */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Monitor className="w-5 h-5 text-gray-600" />
                  <label className="font-semibold text-gray-900">Technology</label>
                </div>
                <select
                  value={filters.tech_stack}
                  onChange={(e) => handleSelectChange('tech_stack', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Any Technology</option>
                  {techStacks.map(tech => (
                    <option key={tech} value={tech}>{tech}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Experience Level Filter */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Clock className="w-5 h-5 text-gray-600" />
              <label className="font-semibold text-gray-900">
                {userRole === 'developer' ? 'Required Experience' : 'Developer Experience'}
              </label>
            </div>
            <select
              value={filters.experience}
              onChange={(e) => handleSelectChange('experience', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {experienceLevels.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between">
          <Button
            variant="outline"
            onClick={handleClearFilters}
          >
            Clear All
          </Button>
          <div className="flex space-x-3">
            <Button
              variant="ghost"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApplyFilters}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Custom Slider Styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #8b5cf6, #a855f7);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #8b5cf6, #a855f7);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
      `}</style>
    </motion.div>
  )
}

export default FilterPanel 