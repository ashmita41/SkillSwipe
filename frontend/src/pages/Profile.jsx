import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, MapPin, DollarSign, Edit, ExternalLink, Github, Linkedin, Calendar, Briefcase, Award, Code, Database, Monitor, Cloud, Cpu } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { profileAPI } from '../utils/api'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const Profile = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [user?.role])

  const loadProfile = async () => {
    try {
      setLoading(true)
      console.log('Loading profile for user role:', user?.role)
      let response
      if (user?.role === 'developer') {
        response = await profileAPI.getDeveloperProfile()
        console.log('Developer profile response:', response)
      } else {
        response = await profileAPI.getCompanyProfile()
        console.log('Company profile response:', response)
      }
      setProfile(response)
    } catch (error) {
      console.error('Failed to load profile:', error)
      console.error('Error details:', error.message)
      
      // If it's a 404 error, the profile doesn't exist yet
      if (error.message && error.message.includes('404')) {
        console.log('Profile not found - user needs to create one')
      }
      
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const formatSalary = (amount) => {
    if (!amount) return 'Not specified'
    return `₹${(amount / 100000).toFixed(1)}L`
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleEdit = () => {
    if (user?.role === 'developer') {
      navigate('/developer-profile')
    } else {
      navigate('/company-profile')
    }
  }

  const DeveloperProfile = ({ profile }) => (
    <div className="space-y-8">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Experience</p>
                <p className="font-medium">{profile.experience_years || 0} years</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">{profile.current_location || 'Not specified'}</p>
              </div>
            </div>
            {(profile.salary_expectation_min || profile.salary_expectation_max) && (
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Salary Expectation</p>
                  <p className="font-medium">
                    {formatSalary(profile.salary_expectation_min)} - {formatSalary(profile.salary_expectation_max)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 mb-1">Willing to Relocate</p>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                profile.willing_to_relocate 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {profile.willing_to_relocate ? 'Yes' : 'No'}
              </span>
            </div>
            {profile.top_two_cities?.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Preferred Cities</p>
                <div className="flex flex-wrap gap-2">
                  {profile.top_two_cities.map((city, index) => (
                    <span key={index} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                      {city}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Technical Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {profile.top_languages?.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Code className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">Programming Languages</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.top_languages.map((lang, index) => (
                <span key={index} className="px-3 py-2 bg-primary-100 text-primary-700 rounded-lg font-medium">
                  {lang}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.tools?.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Cpu className="w-5 h-5 text-secondary-600" />
              <h3 className="text-lg font-semibold text-gray-900">Tools & Frameworks</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.tools.map((tool, index) => (
                <span key={index} className="px-3 py-2 bg-secondary-100 text-secondary-700 rounded-lg font-medium">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.databases?.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Database className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Databases</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.databases.map((db, index) => (
                <span key={index} className="px-3 py-2 bg-green-100 text-green-700 rounded-lg font-medium">
                  {db}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.clouds?.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Cloud className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Cloud Platforms</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.clouds.map((cloud, index) => (
                <span key={index} className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium">
                  {cloud}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">About Me</h3>
          <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
        </div>
      )}

      {/* Achievements */}
      {(profile.certifications || profile.awards || profile.open_source) && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Award className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
          </div>
          <div className="space-y-4">
            {profile.certifications && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Certifications</h4>
                <p className="text-gray-600">{profile.certifications}</p>
              </div>
            )}
            {profile.awards && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Awards</h4>
                <p className="text-gray-600">{profile.awards}</p>
              </div>
            )}
            {profile.open_source && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Open Source Contributions</h4>
                <p className="text-gray-600">{profile.open_source}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Links */}
      {(profile.github || profile.leetcode || profile.linkedin || profile.hackerrank || profile.github_for_geeks) && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.github && (
              <a 
                href={profile.github} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-300"
              >
                <Github className="w-5 h-5 text-gray-700" />
                <span className="font-medium text-gray-900">GitHub</span>
                <ExternalLink className="w-4 h-4 text-gray-500 ml-auto" />
              </a>
            )}
            {profile.leetcode && (
              <a 
                href={profile.leetcode} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-300"
              >
                <Code className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-gray-900">LeetCode</span>
                <ExternalLink className="w-4 h-4 text-gray-500 ml-auto" />
              </a>
            )}
            {profile.hackerrank && (
              <a 
                href={profile.hackerrank} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-300"
              >
                <Code className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900">HackerRank</span>
                <ExternalLink className="w-4 h-4 text-gray-500 ml-auto" />
              </a>
            )}
            {profile.github_for_geeks && (
              <a 
                href={profile.github_for_geeks} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-300"
              >
                <Code className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-900">GeeksforGeeks</span>
                <ExternalLink className="w-4 h-4 text-gray-500 ml-auto" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )

  const CompanyProfile = ({ profile }) => (
    <div className="space-y-8">
      {/* Basic Info */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">{profile.location || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">{formatDate(profile.created_at)}</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {profile.website && (
              <div className="flex items-center space-x-3">
                <ExternalLink className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Website</p>
                  <a 
                    href={profile.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium text-primary-600 hover:text-primary-700"
                  >
                    {profile.website}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* About */}
      {profile.about && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">About Company</h3>
          <p className="text-gray-600 leading-relaxed">{profile.about}</p>
        </div>
      )}

      {/* Links */}
      {(profile.website || profile.linkedin_url) && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.website && (
              <a 
                href={profile.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-300"
              >
                <ExternalLink className="w-5 h-5 text-gray-700" />
                <span className="font-medium text-gray-900">Company Website</span>
                <ExternalLink className="w-4 h-4 text-gray-500 ml-auto" />
              </a>
            )}
            {profile.linkedin_url && (
              <a 
                href={profile.linkedin_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-300"
              >
                <Linkedin className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">LinkedIn</span>
                <ExternalLink className="w-4 h-4 text-gray-500 ml-auto" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <Header />
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <Header />
        <div className="text-center py-20">
          <div className="w-32 h-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-16 h-16 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">No profile found</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-8">
            {user?.role === 'developer' 
              ? "It looks like you haven't created your developer profile yet. Set up your profile to start matching with companies!"
              : "It looks like you haven't created your company profile yet. Set up your profile to start hiring developers!"
            }
          </p>
          <button 
            onClick={handleEdit}
            className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
          >
            <Edit className="w-5 h-5" />
            <span>Create {user?.role === 'developer' ? 'Developer' : 'Company'} Profile</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8"
        >
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center">
                  <span className="text-4xl font-bold">
                    {profile.name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">
                    {profile.name || user?.username}
                  </h1>
                  <p className="text-xl text-white/80 capitalize mb-2">
                    {user?.role}
                  </p>
                  {(profile.last_updated || profile.created_at) && (
                    <p className="text-white/70">
                      Last updated: {formatDate(profile.last_updated || profile.created_at)}
                    </p>
                  )}
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEdit}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all duration-300"
              >
                <Edit className="w-5 h-5" />
                <span>Edit Profile</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Profile Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {user?.role === 'developer' ? (
            <DeveloperProfile profile={profile} />
          ) : (
            <CompanyProfile profile={profile} />
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default Profile 