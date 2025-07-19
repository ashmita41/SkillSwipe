import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Briefcase, MapPin, DollarSign, Users, Monitor, Clock, Building } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { jobAPI } from '../utils/api'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import Select from '../components/ui/Select'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const CreateJob = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    job_type: 'full-time',
    work_mode: 'remote',
    tech_stack: [],
    location: '',
    salary_min: '',
    salary_max: '',
    experience_required: 'mid',
    status: 'active'
  })
  const [techInput, setTechInput] = useState('')
  const [errors, setErrors] = useState({})

  const jobTypes = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' }
  ]

  const workModes = [
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'onsite', label: 'On-site' }
  ]

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level (0-2 years)' },
    { value: 'mid', label: 'Mid Level (2-5 years)' },
    { value: 'senior', label: 'Senior Level (5-10 years)' },
    { value: 'lead', label: 'Lead/Principal (10+ years)' }
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleTechStackAdd = () => {
    if (techInput.trim() && !formData.tech_stack.includes(techInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tech_stack: [...prev.tech_stack, techInput.trim()]
      }))
      setTechInput('')
    }
  }

  const handleTechStackRemove = (tech) => {
    setFormData(prev => ({
      ...prev,
      tech_stack: prev.tech_stack.filter(t => t !== tech)
    }))
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleTechStackAdd()
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) newErrors.title = 'Job title is required'
    if (!formData.description.trim()) newErrors.description = 'Job description is required'
    if (!formData.location.trim()) newErrors.location = 'Location is required'
    if (formData.salary_min && formData.salary_max && parseInt(formData.salary_min) >= parseInt(formData.salary_max)) {
      newErrors.salary_max = 'Maximum salary must be greater than minimum salary'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setLoading(true)
      
      const jobData = {
        ...formData,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null
      }

      console.log('Creating job with data:', jobData)
      
      const response = await jobAPI.createJob(jobData)
      console.log('Job created successfully:', response)
      
      // Navigate back to dashboard
      navigate('/dashboard')
    } catch (error) {
      console.error('Failed to create job:', error)
      setErrors({ submit: 'Failed to create job. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold gradient-text mb-4">Create Job Posting</h1>
            <p className="text-xl text-gray-600">Find the perfect developer for your team</p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Building className="w-6 h-6 mr-3" />
                  Basic Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Input
                      label="Job Title"
                      placeholder="e.g., Senior React Developer"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      error={errors.title}
                      required
                    />
                  </div>
                  
                  <Select
                    label="Job Type"
                    value={formData.job_type}
                    onChange={(e) => handleInputChange('job_type', e.target.value)}
                    options={jobTypes}
                    required
                  />
                  
                  <Select
                    label="Work Mode"
                    value={formData.work_mode}
                    onChange={(e) => handleInputChange('work_mode', e.target.value)}
                    options={workModes}
                    required
                  />
                  
                  <div className="md:col-span-2">
                    <Input
                      label="Location"
                      placeholder="e.g., San Francisco, CA or Remote"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      error={errors.location}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Briefcase className="w-6 h-6 mr-3" />
                  Job Description
                </h2>
                
                <Textarea
                  label="Description"
                  placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                  rows={6}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  error={errors.description}
                  required
                />
              </div>

              {/* Requirements */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Users className="w-6 h-6 mr-3" />
                  Requirements
                </h2>
                
                <div className="space-y-6">
                  <Select
                    label="Experience Level"
                    value={formData.experience_required}
                    onChange={(e) => handleInputChange('experience_required', e.target.value)}
                    options={experienceLevels}
                    required
                  />

                  {/* Tech Stack */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tech Stack
                    </label>
                    <div className="flex space-x-2 mb-3">
                      <Input
                        placeholder="Add technology (e.g., React, Node.js, Python)"
                        value={techInput}
                        onChange={(e) => setTechInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={handleTechStackAdd}
                        variant="outline"
                      >
                        Add
                      </Button>
                    </div>
                    
                    {formData.tech_stack.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tech_stack.map((tech, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
                          >
                            {tech}
                            <button
                              type="button"
                              onClick={() => handleTechStackRemove(tech)}
                              className="ml-2 text-primary-600 hover:text-primary-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Compensation */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <DollarSign className="w-6 h-6 mr-3" />
                  Compensation
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <Input
                  label="Minimum Salary (₹ INR)"
                  type="number"
                  placeholder="600000"
                  value={formData.salary_min}
                  onChange={(e) => handleInputChange('salary_min', e.target.value)}
                />
                
                <Input
                  label="Maximum Salary (₹ INR)"
                  type="number"
                  placeholder="1200000"
                  value={formData.salary_max}
                  onChange={(e) => handleInputChange('salary_max', e.target.value)}
                  error={errors.salary_max}
                />
                </div>
                
                <p className="text-sm text-gray-500 mt-2">
                  Leave blank if you prefer not to disclose salary information
                </p>
              </div>

              {/* Error Message */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-800">{errors.submit}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-8"
                >
                  {loading ? <LoadingSpinner size="sm" /> : 'Create Job Posting'}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default CreateJob 