import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Code, User, Award, Star } from 'lucide-react'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import MultiSelect from '../components/ui/MultiSelect'
import Select from '../components/ui/Select'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { profileAPI } from '../utils/api'

// Options data
const PROGRAMMING_LANGUAGES = [
  'JavaScript', 'Python', 'Java', 'TypeScript', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
  'Swift', 'Kotlin', 'Dart', 'Scala', 'R', 'MATLAB', 'Perl', 'Haskell', 'Lua', 'Shell'
]

const TOOLS_FRAMEWORKS = [
  'React', 'Angular', 'Vue.js', 'Node.js', 'Django', 'Flask', 'Spring', 'Laravel', 'Rails',
  'Express.js', 'FastAPI', 'ASP.NET', 'Flutter', 'React Native', 'Docker', 'Kubernetes',
  'Jenkins', 'Git', 'Webpack', 'Vite'
]

const IDES = [
  'VS Code', 'IntelliJ IDEA', 'WebStorm', 'PyCharm', 'Eclipse', 'Sublime Text', 'Atom',
  'Vim', 'Emacs', 'Xcode', 'Android Studio', 'NetBeans', 'PhpStorm', 'CLion', 'RubyMine'
]

const DATABASES = [
  'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server', 'Cassandra',
  'Elasticsearch', 'DynamoDB', 'Firebase', 'InfluxDB', 'Neo4j', 'CouchDB', 'MariaDB'
]

const OPERATING_SYSTEMS = [
  'Windows', 'macOS', 'Linux', 'Ubuntu', 'CentOS', 'Red Hat', 'Debian', 'FreeBSD', 'Android', 'iOS'
]

const DOMAINS = [
  'Web Development', 'Mobile Development', 'Data Science', 'Machine Learning', 'AI',
  'DevOps', 'Cloud Computing', 'Cybersecurity', 'Game Development', 'IoT', 'Blockchain',
  'AR/VR', 'Desktop Applications', 'Backend Development', 'Frontend Development'
]

const CLOUD_PLATFORMS = [
  'AWS', 'Google Cloud', 'Microsoft Azure', 'DigitalOcean', 'Heroku', 'Vercel', 'Netlify',
  'Firebase', 'IBM Cloud', 'Oracle Cloud', 'Alibaba Cloud', 'Linode', 'Vultr'
]

const EXPERIENCE_OPTIONS = [
  { value: 0, label: 'Fresher (0 years)' },
  { value: 1, label: '1 year' },
  { value: 2, label: '2 years' },
  { value: 3, label: '3 years' },
  { value: 4, label: '4 years' },
  { value: 5, label: '5 years' },
  { value: 6, label: '6 years' },
  { value: 7, label: '7 years' },
  { value: 8, label: '8 years' },
  { value: 9, label: '9 years' },
  { value: 10, label: '10+ years' }
]

const CITY_OPTIONS = [
  'San Francisco', 'New York', 'Seattle', 'Austin', 'Boston', 'Chicago', 'Los Angeles',
  'Denver', 'Atlanta', 'Miami', 'Phoenix', 'Dallas', 'Portland', 'Toronto', 'Vancouver',
  'London', 'Berlin', 'Amsterdam', 'Paris', 'Barcelona', 'Bangalore', 'Mumbai', 'Delhi',
  'Hyderabad', 'Pune', 'Chennai', 'Remote'
]

const DeveloperProfileForm = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Required fields
    name: '',
    bio: '',
    current_location: '',
    experience_years: '',
    top_languages: [],
    
    // Optional technical skills
    tools: [],
    ides: [],
    databases: [],
    operating_systems: [],
    domains: [],
    clouds: [],
    
    // Optional achievements
    certifications: '',
    awards: '',
    open_source: '',
    
    // Optional job preferences
    salary_expectation_min: '',
    salary_expectation_max: '',
    willing_to_relocate: false,
    top_two_cities: [],
    
    // Optional profile links
    github: '',
    leetcode: '',
    github_for_geeks: '',
    hackerrank: ''
  })
  
  const [errors, setErrors] = useState({})
  const [currentStep, setCurrentStep] = useState(1)
  const [canSubmit, setCanSubmit] = useState(false)
  const [profileCreated, setProfileCreated] = useState(false)
  const totalSteps = 4

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateStep = (step) => {
    const newErrors = {}
    
    if (step === 1) {
      // Basic Information
      if (!formData.name.trim()) newErrors.name = 'Name is required'
      if (!formData.bio.trim()) newErrors.bio = 'Bio is required'
      if (!formData.current_location.trim()) newErrors.current_location = 'Current location is required'
      if (formData.experience_years === '') newErrors.experience_years = 'Experience years is required'
    } else if (step === 2) {
      // Technical Skills
      if (formData.top_languages.length === 0) newErrors.top_languages = 'At least one programming language is required'
    }
    // Steps 3 and 4 are optional
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    // Don't allow form operations if profile was already created
    if (profileCreated) {
      console.log('Profile already created, ignoring nextStep')
      return
    }
    
    console.log('nextStep called, current step:', currentStep)
    if (validateStep(currentStep)) {
      const newStep = Math.min(currentStep + 1, totalSteps)
      console.log('Moving to step:', newStep)
      setCurrentStep(newStep)
      
      // If we just moved to the final step, add a small delay to prevent immediate submission
      if (newStep === totalSteps) {
        console.log('Reached final step, preventing immediate submission')
        setCanSubmit(false)
        setTimeout(() => {
          console.log('Step 4 rendered, ready for user input')
          setCanSubmit(true)
        }, 500)
      } else {
        // For other steps, allow immediate progression
        setCanSubmit(true)
      }
    } else {
      console.log('Step validation failed for step:', currentStep)
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('handleSubmit called, current step:', currentStep, 'canSubmit:', canSubmit)
    
    // Only allow submission on the final step
    if (currentStep !== totalSteps) {
      console.log('Form submitted but not on final step, preventing submission')
      return
    }
    
    // Prevent immediate submission after reaching step 4
    if (!canSubmit) {
      console.log('Form submitted too quickly after reaching step 4, preventing submission')
      return
    }
    
    // Validate all required fields
    if (!validateStep(1) || !validateStep(2)) {
      setCurrentStep(1) // Go back to first step to show errors
      return
    }

    setLoading(true)
    
    // Prepare data for API
    const profileData = {
      ...formData,
      experience_years: parseInt(formData.experience_years),
      salary_expectation_min: formData.salary_expectation_min ? parseInt(formData.salary_expectation_min) : null,
      salary_expectation_max: formData.salary_expectation_max ? parseInt(formData.salary_expectation_max) : null,
      city: formData.current_location, 
      job_preferences: {},
    }

    // Remove empty string fields but keep null values and empty arrays
    Object.keys(profileData).forEach(key => {
      if (profileData[key] === '') {
        delete profileData[key]
      }
    })

    console.log('Final profile data being sent:', profileData)

    try {
      const response = await profileAPI.createDeveloperProfile(profileData)
      console.log('Profile created successfully:', response)
      
      // Set local flag to prevent form operations
      setProfileCreated(true)
      
      // Set flag to prevent immediate profile status re-check
      sessionStorage.setItem('profileJustCreated', 'true')
      sessionStorage.setItem('profileCreatedTime', Date.now().toString())
      
      console.log('Profile creation flags set, navigating to dashboard')
      
      // Show success message to user
      alert('Profile created successfully! Redirecting to dashboard...')
      
      // Try multiple navigation approaches
      console.log('Attempting navigation to dashboard')
      
      // Immediate navigation
      navigate('/dashboard', { replace: true })
      
      // Force page navigation as backup
      setTimeout(() => {
        console.log('Backup navigation - checking if still on form page')
        if (window.location.pathname.includes('create-developer-profile')) {
          console.log('Still on form page, forcing window navigation')
          window.location.href = '/dashboard'
        }
      }, 500)
    
    } catch (error) {
      console.error('Profile creation failed:', error)
      
      // Handle validation errors from backend
      if (error.validationErrors) {
        console.error('Validation errors:', error.validationErrors)
        setErrors(error.validationErrors)
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

  const renderStepContent = () => {
    switch(currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <User className="w-12 h-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h3>
              <p className="text-gray-600">Tell us about yourself</p>
            </div>

            <Input
              label="Full Name"
              type="text"
              placeholder="Your full name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={errors.name}
              required
            />

            <Textarea
              label="Bio"
              placeholder="Tell us about yourself, your experience, and what you're passionate about..."
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              error={errors.bio}
              required
              rows={4}
              maxLength={500}
            />

            <Input
              label="Current Location"
              type="text"
              placeholder="City, State/Country"
              value={formData.current_location}
              onChange={(e) => handleInputChange('current_location', e.target.value)}
              error={errors.current_location}
              required
            />

            <Select
              label="Years of Experience"
              options={EXPERIENCE_OPTIONS}
              value={formData.experience_years}
              onChange={(value) => handleInputChange('experience_years', value)}
              placeholder="Select your experience level"
              error={errors.experience_years}
              required
            />
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Code className="w-12 h-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Technical Skills</h3>
              <p className="text-gray-600">What technologies do you work with?</p>
            </div>

            <MultiSelect
              label="Top Programming Languages"
              options={PROGRAMMING_LANGUAGES}
              value={formData.top_languages}
              onChange={(value) => handleInputChange('top_languages', value)}
              maxSelections={2}
              placeholder="Select your top 2 programming languages"
              error={errors.top_languages}
            />

            <MultiSelect
              label="Tools & Frameworks"
              options={TOOLS_FRAMEWORKS}
              value={formData.tools}
              onChange={(value) => handleInputChange('tools', value)}
              maxSelections={2}
              placeholder="Select your top 2 tools/frameworks"
            />

            <MultiSelect
              label="IDEs & Editors"
              options={IDES}
              value={formData.ides}
              onChange={(value) => handleInputChange('ides', value)}
              maxSelections={2}
              placeholder="Select your preferred IDEs/editors"
            />

            <MultiSelect
              label="Databases"
              options={DATABASES}
              value={formData.databases}
              onChange={(value) => handleInputChange('databases', value)}
              maxSelections={2}
              placeholder="Select databases you work with"
            />

            <MultiSelect
              label="Operating Systems"
              options={OPERATING_SYSTEMS}
              value={formData.operating_systems}
              onChange={(value) => handleInputChange('operating_systems', value)}
              maxSelections={2}
              placeholder="Select your preferred operating systems"
            />

            <MultiSelect
              label="Domain Expertise"
              options={DOMAINS}
              value={formData.domains}
              onChange={(value) => handleInputChange('domains', value)}
              maxSelections={2}
              placeholder="Select your areas of expertise"
            />

            <MultiSelect
              label="Cloud Platforms"
              options={CLOUD_PLATFORMS}
              value={formData.clouds}
              onChange={(value) => handleInputChange('clouds', value)}
              maxSelections={2}
              placeholder="Select cloud platforms you use"
            />
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Award className="w-12 h-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Achievements</h3>
              <p className="text-gray-600">Showcase your accomplishments (optional)</p>
            </div>

            <Textarea
              label="Certifications"
              placeholder="List your professional certifications..."
              value={formData.certifications}
              onChange={(e) => handleInputChange('certifications', e.target.value)}
              rows={3}
            />

            <Textarea
              label="Awards & Recognition"
              placeholder="Any awards or recognition you've received..."
              value={formData.awards}
              onChange={(e) => handleInputChange('awards', e.target.value)}
              rows={3}
            />

            <Textarea
              label="Open Source Contributions"
              placeholder="Describe your open source projects and contributions..."
              value={formData.open_source}
              onChange={(e) => handleInputChange('open_source', e.target.value)}
              rows={3}
            />
          </motion.div>
        )

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Star className="w-12 h-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Preferences & Links</h3>
              <p className="text-gray-600">Job preferences and profile links (optional)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Minimum Salary Expectation"
                type="number"
                placeholder="e.g., 80000"
                value={formData.salary_expectation_min}
                onChange={(e) => handleInputChange('salary_expectation_min', e.target.value)}
              />

              <Input
                label="Maximum Salary Expectation"
                type="number"
                placeholder="e.g., 120000"
                value={formData.salary_expectation_max}
                onChange={(e) => handleInputChange('salary_expectation_max', e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="willing_to_relocate"
                checked={formData.willing_to_relocate}
                onChange={(e) => handleInputChange('willing_to_relocate', e.target.checked)}
                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="willing_to_relocate" className="text-sm font-medium text-gray-700">
                I'm willing to relocate for the right opportunity
              </label>
            </div>

            {formData.willing_to_relocate && (
              <MultiSelect
                label="Preferred Cities"
                options={CITY_OPTIONS}
                value={formData.top_two_cities}
                onChange={(value) => handleInputChange('top_two_cities', value)}
                maxSelections={2}
                placeholder="Select your top 2 preferred cities"
              />
            )}

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Profile Links</h4>
              
              <Input
                label="GitHub URL"
                type="url"
                placeholder="https://github.com/username"
                value={formData.github}
                onChange={(e) => handleInputChange('github', e.target.value)}
              />

              <Input
                label="LeetCode URL"
                type="url"
                placeholder="https://leetcode.com/username"
                value={formData.leetcode}
                onChange={(e) => handleInputChange('leetcode', e.target.value)}
              />

              <Input
                label="GeeksforGeeks URL"
                type="url"
                placeholder="https://auth.geeksforgeeks.org/user/username"
                value={formData.github_for_geeks}
                onChange={(e) => handleInputChange('github_for_geeks', e.target.value)}
              />

              <Input
                label="HackerRank URL"
                type="url"
                placeholder="https://www.hackerrank.com/username"
                value={formData.hackerrank}
                onChange={(e) => handleInputChange('hackerrank', e.target.value)}
              />
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Code className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-4">Create Your Developer Profile</h1>
          <p className="text-xl text-gray-600">Let's build your professional profile to connect with amazing opportunities</p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            {Array.from({ length: totalSteps }, (_, i) => (
              <React.Fragment key={i}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    currentStep > i + 1
                      ? 'bg-green-500 text-white'
                      : currentStep === i + 1
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentStep > i + 1 ? '✓' : i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div
                    className={`w-16 h-1 transition-all duration-300 ${
                      currentStep > i + 1 ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="text-center text-sm text-gray-600">
            Step {currentStep} of {totalSteps}
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
        >
          <form onSubmit={handleSubmit} onKeyDown={(e) => {
            if (e.key === 'Enter' && currentStep < totalSteps) {
              e.preventDefault()
              console.log('Enter key pressed, preventing form submission on step:', currentStep)
            }
          }}>
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{errors.general}</p>
              </div>
            )}

            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-12 pt-8 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={currentStep === 1 ? 'invisible' : ''}
              >
                Previous
              </Button>

              <div className="flex space-x-4">
                {currentStep < totalSteps ? (
                  <Button type="button" onClick={nextStep}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={loading || !canSubmit}>
                    {loading ? <LoadingSpinner size="sm" /> : 
                     !canSubmit ? 'Loading Step...' : 'Create Profile'}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default DeveloperProfileForm 