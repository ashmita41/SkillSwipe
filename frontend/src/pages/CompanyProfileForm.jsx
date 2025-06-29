import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building, Globe, MapPin, Link, Search } from 'lucide-react'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { profileAPI } from '../utils/api'

const CompanyProfileForm = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [companiesLoading, setCompaniesLoading] = useState(false)
  const [existingCompanies, setExistingCompanies] = useState([])
  const [selectedCompanyId, setSelectedCompanyId] = useState('')
  
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
  const [profileCreated, setProfileCreated] = useState(false)

  // Load existing companies on mount
  useEffect(() => {
    loadExistingCompanies()
  }, [])

  const loadExistingCompanies = async () => {
    setCompaniesLoading(true)
    try {
      const response = await profileAPI.getAllCompanies()
      setExistingCompanies(response.results || [])
    } catch (error) {
      console.error('Failed to load companies:', error)
      setExistingCompanies([])
    } finally {
      setCompaniesLoading(false)
    }
  }

  // Handle company selection from dropdown
  const handleCompanySelect = (companyId) => {
    setSelectedCompanyId(companyId)
    
    if (companyId === '') {
      // Clear form for new company
      setFormData({
        name: '',
        about: '',
        location: '',
        website: '',
        linkedin_url: '',
        logo_url: ''
      })
      return
    }

    if (companyId === 'join_existing') {
      // Redirect to dashboard - they want to join existing
      navigate('/dashboard')
      return
    }

    // Auto-fill form with selected company data
    const selectedCompany = existingCompanies.find(company => company.id === companyId)
    if (selectedCompany) {
      setFormData({
        name: selectedCompany.name || '',
        about: selectedCompany.about || '',
        location: selectedCompany.location || '',
        website: selectedCompany.website || '',
        linkedin_url: selectedCompany.linkedin_url || '',
        logo_url: selectedCompany.logo_url || ''
      })
    }
  }

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
    } catch {
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Don't allow resubmission if profile was already created
    if (profileCreated) {
      console.log('Profile already created, ignoring submit')
      return
    }
    
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

      const response = await profileAPI.createCompanyProfile(profileData)
      console.log('Company profile created successfully:', response)
      
      // Set local flag to prevent form operations
      setProfileCreated(true)
      
      // Set flag to prevent immediate profile status re-check
      sessionStorage.setItem('profileJustCreated', 'true')
      sessionStorage.setItem('profileCreatedTime', Date.now().toString())
      
      console.log('Profile creation flags set, navigating to dashboard')
      
      // Show success message to user
      alert('Company profile created successfully! Redirecting to dashboard...')
      
      // Try multiple navigation approaches
      console.log('Attempting navigation to dashboard')
      
      // Immediate navigation
      navigate('/dashboard', { replace: true })
      
      // Force page navigation as backup
      setTimeout(() => {
        console.log('Backup navigation - checking if still on form page')
        if (window.location.pathname.includes('create-company-profile')) {
          console.log('Still on form page, forcing window navigation')
          window.location.href = '/dashboard'
        }
      }, 500)
    } catch (error) {
      console.error('Profile creation failed:', error)
      
      // Handle validation errors from backend
      if (error.message && typeof error.message === 'object') {
        setErrors(error.message)
      } else {
        setErrors({ general: error.message || 'Failed to create profile. Please try again.' })
      }
    } finally {
      // Only set loading to false if profile creation failed
      if (!profileCreated) {
        setLoading(false)
      }
      // If profile was created successfully, keep loading state to show redirect progress
    }
  }




  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Building className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-4">
            Create Your Company Profile
          </h1>
          <p className="text-xl text-gray-600">
            Tell developers about your company and attract top talent
          </p>
        </div>

        {/* Company Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Company Profile</h2>
            <p className="text-gray-600">Set up your company profile or select existing company</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {errors.general && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{errors.general}</p>
              </div>
            )}

            {/* Company Selection Dropdown */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <div className="flex items-center mb-6">
                  <Search className="w-6 h-6 text-primary-500 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">Select or Create Company</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Selection
                    </label>
                    <select
                      value={selectedCompanyId}
                      onChange={(e) => handleCompanySelect(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      disabled={companiesLoading}
                    >
                      <option value="">Create New Company</option>
                      <option value="join_existing">I want to join an existing company (Go to Dashboard)</option>
                      {existingCompanies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name} ({company.location})
                        </option>
                      ))}
                    </select>
                    {companiesLoading && (
                      <p className="text-sm text-gray-500 mt-2">Loading companies...</p>
                    )}
                  </div>

                  {selectedCompanyId && selectedCompanyId !== 'join_existing' && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> You've selected an existing company. The form below is auto-filled with their information. 
                        You can review and modify any details if needed before creating your profile.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

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
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
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
        </div>
      </div>
    </div>
  )
}

export default CompanyProfileForm 