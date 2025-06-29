import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Building, Globe, MapPin, Link } from 'lucide-react'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { profileAPI } from '../utils/api'

const CompanyProfileForm = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Required fields
    name: '',
    about: '',
    location: '',
    
    // Optional fields
    website: '',
    linkedin_url: '',
    logo_url: ''
  })
  
  const [errors, setErrors] = useState({})

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    // Required field validation
    if (!formData.name.trim()) newErrors.name = 'Company name is required'
    if (!formData.about.trim()) newErrors.about = 'Company description is required'
    if (!formData.location.trim()) newErrors.location = 'Company location is required'
    
    // URL validation for optional fields
    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = 'Please enter a valid website URL'
    }
    if (formData.linkedin_url && !formData.linkedin_url.includes('linkedin.com')) {
      newErrors.linkedin_url = 'Please enter a valid LinkedIn URL'
    }
    if (formData.logo_url && !isValidUrl(formData.logo_url)) {
      newErrors.logo_url = 'Please enter a valid logo URL'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      // Prepare data for API - remove empty optional fields
      const profileData = { ...formData }
      Object.keys(profileData).forEach(key => {
        if (profileData[key] === '') {
          delete profileData[key]
        }
      })

      await profileAPI.createCompanyProfile(profileData)
      
      // Success - redirect to dashboard
      navigate('/dashboard')
    } catch (error) {
      console.error('Profile creation failed:', error)
      
      // Handle validation errors from backend
      if (error.message && typeof error.message === 'object') {
        setErrors(error.message)
      } else {
        setErrors({ general: error.message || 'Failed to create profile. Please try again.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Building className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-4">Create Your Company Profile</h1>
          <p className="text-xl text-gray-600">Tell developers about your company and attract top talent</p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100"
        >
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {errors.general && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{errors.general}</p>
              </div>
            )}

            {/* Required Information Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <div className="flex items-center mb-6">
                  <Building className="w-6 h-6 text-primary-500 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">Company Information</h2>
                  <span className="ml-2 text-sm text-red-500">* Required</span>
                </div>

                <div className="space-y-6">
                  <Input
                    label="Company Name"
                    type="text"
                    placeholder="Your company name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    error={errors.name}
                    required
                  />

                  <Textarea
                    label="About Company"
                    placeholder="Describe your company, mission, culture, and what makes you unique. This helps developers understand your company better..."
                    value={formData.about}
                    onChange={(e) => handleInputChange('about', e.target.value)}
                    error={errors.about}
                    required
                    rows={6}
                    maxLength={1000}
                  />

                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-3" />
                    <div className="flex-1">
                      <Input
                        label="Company Location"
                        type="text"
                        placeholder="City, State/Country (e.g., San Francisco, CA)"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        error={errors.location}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Optional Information Section */}
              <div className="space-y-6">
                <div className="flex items-center mb-6">
                  <Link className="w-6 h-6 text-primary-500 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">Additional Information</h2>
                  <span className="ml-2 text-sm text-gray-500">Optional</span>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start space-x-3">
                    <Globe className="w-5 h-5 text-gray-400 mt-3" />
                    <div className="flex-1">
                      <Input
                        label="Company Website"
                        type="url"
                        placeholder="https://www.yourcompany.com"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        error={errors.website}
                      />
                    </div>
                  </div>

                  <Input
                    label="LinkedIn Company Page"
                    type="url"
                    placeholder="https://www.linkedin.com/company/yourcompany"
                    value={formData.linkedin_url}
                    onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                    error={errors.linkedin_url}
                  />

                  <Input
                    label="Company Logo URL"
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={formData.logo_url}
                    onChange={(e) => handleInputChange('logo_url', e.target.value)}
                    error={errors.logo_url}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-8 border-t border-gray-200">
              <Button type="submit" disabled={loading} size="lg">
                {loading ? <LoadingSpinner size="sm" /> : 'Create Company Profile'}
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Tips for a Great Company Profile</h3>
            <ul className="text-sm text-blue-800 text-left space-y-2">
              <li>• Be specific about your company culture and values</li>
              <li>• Mention your tech stack and development practices</li>
              <li>• Highlight unique perks and benefits you offer</li>
              <li>• Keep the tone professional yet engaging</li>
              <li>• Include information about growth opportunities</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default CompanyProfileForm 