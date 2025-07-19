import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bookmark, MapPin, DollarSign, Clock, Monitor, Building, Trash2, ExternalLink, Calendar, Users, Briefcase, Search, Github, Linkedin, Globe } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { wishlistAPI, jobAPI } from '../utils/api'
import Header from '../components/Header'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const Wishlist = () => {
  const { user } = useAuth()
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadWishlist()
  }, [])

  const loadWishlist = async () => {
    try {
      setLoading(true)
      const response = await wishlistAPI.getWishlist()
      setWishlistItems(response.results || [])
    } catch (error) {
      console.error('Failed to load wishlist:', error)
      setWishlistItems([])
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = async (wishlistId) => {
    try {
      await wishlistAPI.removeFromWishlist(wishlistId)
      setWishlistItems(prev => prev.filter(item => item.id !== wishlistId))
    } catch (error) {
      console.error('Failed to remove from wishlist:', error)
    }
  }

  const clearWishlist = async () => {
    if (!window.confirm('Are you sure you want to clear your entire wishlist?')) return
    
    try {
      await wishlistAPI.clearWishlist()
      setWishlistItems([])
    } catch (error) {
      console.error('Failed to clear wishlist:', error)
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

  const getWorkModeIcon = (workMode) => {
    switch (workMode) {
      case 'remote': return '🏠'
      case 'in-office': return '🏢'
      case 'hybrid': return '🔄'
      default: return '💼'
    }
  }

  const getJobTypeColor = (jobType) => {
    switch (jobType) {
      case 'full-time': return 'bg-green-100 text-green-700'
      case 'part-time': return 'bg-blue-100 text-blue-700'
      case 'contract': return 'bg-orange-100 text-orange-700'
      case 'intern': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const JobWishlistCard = ({ item }) => {
    const job = item.job_post

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5, scale: 1.02 }}
        className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-100 to-purple-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
                    {job.title}
                  </h3>
                  <p className="text-gray-600">{job.company?.name}</p>
                </div>
              </div>
              
              {/* Job Meta */}
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Saved {formatDate(item.saved_on)}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getJobTypeColor(job.job_type)}`}>
                  {job.job_type?.charAt(0).toUpperCase() + job.job_type?.slice(1).replace('-', ' ')}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium flex items-center space-x-1">
                  <span>{getWorkModeIcon(job.work_mode)}</span>
                  <span>{job.work_mode?.charAt(0).toUpperCase() + job.work_mode?.slice(1).replace('-', ' ')}</span>
                </span>
                {job.experience_required && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {job.experience_required?.charAt(0).toUpperCase() + job.experience_required?.slice(1)} Level
                  </span>
                )}
              </div>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => removeFromWishlist(item.id)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-300"
              title="Remove from wishlist"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Description Preview */}
          <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
            {job.description?.substring(0, 150)}...
          </p>

          {/* Salary */}
          {(job.salary_min || job.salary_max) && (
            <div className="flex items-center space-x-2 mb-4">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {job.salary_min && job.salary_max 
                  ? `${formatSalary(job.salary_min)} - ${formatSalary(job.salary_max)}`
                  : formatSalary(job.salary_min || job.salary_max)
                }
              </span>
            </div>
          )}

          {/* Tech Stack */}
          {job.tech_stack?.length > 0 && (
            <div className="mb-4">
              <span className="text-sm text-gray-500 block mb-2">Tech Stack:</span>
              <div className="flex flex-wrap gap-1">
                {job.tech_stack.slice(0, 4).map((tech, index) => (
                  <span key={index} className="px-2 py-1 bg-primary-100 text-primary-700 rounded-md text-xs font-medium">
                    {tech}
                  </span>
                ))}
                {job.tech_stack.length > 4 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
                    +{job.tech_stack.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={() => setSelectedJob(job)}
              className="flex-1 bg-gradient-to-r from-primary-500 to-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:from-primary-600 hover:to-purple-600 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View Details</span>
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  const ProfileWishlistCard = ({ item }) => {
    const profile = item.wishlisted_user

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5, scale: 1.02 }}
        className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {profile.first_name} {profile.last_name}
                  </h3>
                  <p className="text-gray-600">@{profile.username}</p>
                </div>
              </div>
              
              {/* Profile Meta */}
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Saved {formatDate(item.saved_on)}</span>
                </div>
              </div>

              {/* Role Badge */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  {profile.role === 'developer' ? 'Developer' : 'Company'}
                </span>
              </div>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => removeFromWishlist(item.id)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-300"
              title="Remove from wishlist"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Basic Info */}
          <div className="mb-4 text-sm text-gray-600">
            <p>Email: {profile.email}</p>
            <p>Role: {profile.role}</p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:from-green-600 hover:to-blue-600 transition-all duration-300 flex items-center justify-center space-x-2">
              <ExternalLink className="w-4 h-4" />
              <span>View Profile</span>
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  // Filter items based on search
  const filteredItems = wishlistItems.filter(item => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    
    if (item.item_type === 'job') {
      const job = item.job_post
      return (
        job.title?.toLowerCase().includes(searchLower) ||
        job.company?.name?.toLowerCase().includes(searchLower) ||
        job.description?.toLowerCase().includes(searchLower) ||
        job.location?.toLowerCase().includes(searchLower) ||
        job.tech_stack?.some(tech => tech.toLowerCase().includes(searchLower))
      )
    } else if (item.item_type === 'profile') {
      const profile = item.wishlisted_user
      return (
        profile.username?.toLowerCase().includes(searchLower) ||
        profile.first_name?.toLowerCase().includes(searchLower) ||
        profile.last_name?.toLowerCase().includes(searchLower) ||
        profile.email?.toLowerCase().includes(searchLower)
      )
    }
    
    return false
  })

  // Group items by type for display
  const jobItems = filteredItems.filter(item => item.item_type === 'job')
  const profileItems = filteredItems.filter(item => item.item_type === 'profile')

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <Bookmark className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-gray-600 text-lg">
            Your saved jobs and profiles in one place
          </p>
        </motion.div>

        {/* Search and Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search your wishlist..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
            />
          </div>

          {/* Clear All Button */}
          {wishlistItems.length > 0 && (
            <button
              onClick={clearWishlist}
              className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-300 font-medium"
            >
              Clear All
            </button>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Bookmark className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{wishlistItems.length}</p>
                <p className="text-gray-600">Total Items</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{jobItems.length}</p>
                <p className="text-gray-600">Saved Jobs</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{profileItems.length}</p>
                <p className="text-gray-600">Saved Profiles</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bookmark className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No results found' : 'Your wishlist is empty'}
            </h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Start exploring and save interesting jobs and profiles'
              }
            </p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Job Items Section */}
            {jobItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                  <Briefcase className="w-6 h-6 text-primary-600" />
                  <span>Saved Jobs ({jobItems.length})</span>
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {jobItems.map((item) => (
                      <JobWishlistCard key={item.id} item={item} />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* Profile Items Section */}
            {profileItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                  <Users className="w-6 h-6 text-green-600" />
                  <span>Saved Profiles ({profileItems.length})</span>
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {profileItems.map((item) => (
                      <ProfileWishlistCard key={item.id} item={item} />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Job Detail Modal */}
      <AnimatePresence>
        {selectedJob && (
          <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}

const JobDetailModal = ({ job, onClose }) => {
  const formatSalary = (amount) => {
    if (!amount) return 'Not specified'
    return `₹${(amount / 100000).toFixed(1)}L`
  }

  const getWorkModeIcon = (workMode) => {
    switch (workMode) {
      case 'remote': return '🏠'
      case 'in-office': return '🏢'
      case 'hybrid': return '🔄'
      default: return '💼'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-8 border-b border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-100 to-purple-100 rounded-2xl flex items-center justify-center">
                <Building className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
                <p className="text-lg text-gray-600">{job.company?.name}</p>
                <p className="text-sm text-gray-500 flex items-center space-x-1 mt-1">
                  <MapPin className="w-4 h-4" />
                  <span>{job.location}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              {job.job_type?.charAt(0).toUpperCase() + job.job_type?.slice(1).replace('-', ' ')}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium flex items-center space-x-1">
              <span>{getWorkModeIcon(job.work_mode)}</span>
              <span>{job.work_mode?.charAt(0).toUpperCase() + job.work_mode?.slice(1).replace('-', ' ')}</span>
            </span>
            {job.experience_required && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {job.experience_required?.charAt(0).toUpperCase() + job.experience_required?.slice(1)} Level
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Salary */}
          {(job.salary_min || job.salary_max) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-primary-600" />
                <span>Salary Range</span>
              </h3>
              <p className="text-gray-700">
                {job.salary_min && job.salary_max 
                  ? `${formatSalary(job.salary_min)} - ${formatSalary(job.salary_max)}`
                  : formatSalary(job.salary_min || job.salary_max)
                }
              </p>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Description</h3>
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {job.description}
            </div>
          </div>

          {/* Tech Stack */}
          {job.tech_stack?.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <Monitor className="w-5 h-5 text-primary-600" />
                <span>Required Technologies</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.tech_stack.map((tech, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-2 bg-primary-100 text-primary-700 rounded-lg text-sm font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Apply Button */}
          <div className="pt-4">
            <button className="w-full bg-gradient-to-r from-primary-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-primary-600 hover:to-purple-600 transition-all duration-300 flex items-center justify-center space-x-2">
              <ExternalLink className="w-5 h-5" />
              <span>Apply Now</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Wishlist 