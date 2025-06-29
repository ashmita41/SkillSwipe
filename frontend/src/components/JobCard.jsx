import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  Building, 
  Briefcase, 
  Monitor, 
  Calendar,
  Star,
  Users,
  Bookmark,
  BookmarkCheck,
  Eye
} from 'lucide-react'
import { wishlistAPI } from '../utils/api'

const JobCard = ({ job, onWishlistChange, onViewDetails }) => {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)

  const {
    id,
    title,
    company_name,
    company_location,
    description,
    location,
    job_type,
    work_mode,
    tech_stack = [],
    salary_min,
    salary_max,
    experience_required,
    created_at,
    match_score
  } = job

  const handleWishlistToggle = async (e) => {
    e.stopPropagation()
    setWishlistLoading(true)
    
    try {
      if (isWishlisted) {
        // Remove from wishlist logic would need wishlist item ID
        // For now, we'll just add to wishlist
        console.log('Remove from wishlist functionality to be implemented')
      } else {
        await wishlistAPI.addToWishlist(id)
        setIsWishlisted(true)
        if (onWishlistChange) onWishlistChange(job, true)
      }
    } catch (error) {
      console.error('Failed to update wishlist:', error)
    } finally {
      setWishlistLoading(false)
    }
  }

  const handleViewDetails = (e) => {
    e.stopPropagation()
    if (onViewDetails) onViewDetails(job)
  }

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Salary not specified'
    if (min && max) return `₹${(min/100000).toFixed(1)}L - ₹${(max/100000).toFixed(1)}L`
    if (min) return `₹${(min/100000).toFixed(1)}L+`
    return `Up to ₹${(max/100000).toFixed(1)}L`
  }

  const formatExperience = (exp) => {
    const expMap = {
      'entry': 'Entry Level',
      'mid': 'Mid Level',
      'senior': 'Senior Level',
      'lead': 'Lead/Principal'
    }
    return expMap[exp] || exp
  }

  const formatWorkMode = (mode) => {
    const modeMap = {
      'remote': 'Remote',
      'hybrid': 'Hybrid',
      'onsite': 'On-site'
    }
    return modeMap[mode] || mode
  }

  const formatJobType = (type) => {
    const typeMap = {
      'full-time': 'Full-time',
      'part-time': 'Part-time',
      'contract': 'Contract',
      'freelance': 'Freelance'
    }
    return typeMap[type] || type
  }

  const getWorkModeColor = (mode) => {
    const colorMap = {
      'remote': 'bg-green-100 text-green-800',
      'hybrid': 'bg-blue-100 text-blue-800',
      'onsite': 'bg-purple-100 text-purple-800'
    }
    return colorMap[mode] || 'bg-gray-100 text-gray-800'
  }

  const getJobTypeColor = (type) => {
    const colorMap = {
      'full-time': 'bg-primary-100 text-primary-800',
      'part-time': 'bg-orange-100 text-orange-800',
      'contract': 'bg-indigo-100 text-indigo-800',
      'freelance': 'bg-pink-100 text-pink-800'
    }
    return colorMap[type] || 'bg-gray-100 text-gray-800'
  }

  const timeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just posted'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return `${Math.floor(diffInDays / 7)}w ago`
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl shadow-xl border border-gray-100 h-[600px] overflow-hidden relative"
    >
      {/* Header with Company Info */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{company_name}</h2>
                <div className="flex items-center text-white/80 text-sm">
                  <MapPin className="w-4 h-4 mr-1" />
                  {company_location}
                </div>
              </div>
            </div>
            {match_score && (
              <div className="flex items-center space-x-1 bg-white/20 backdrop-blur px-3 py-1 rounded-full">
                <Star className="w-4 h-4 text-yellow-300" />
                <span className="text-sm font-semibold">{match_score}%</span>
              </div>
            )}
          </div>
          
          <h1 className="text-2xl font-bold mb-2">{title}</h1>
          
          {/* Job Type & Work Mode Tags */}
          <div className="flex space-x-2">
            <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-sm font-medium">
              {formatJobType(job_type)}
            </span>
            <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-sm font-medium">
              {formatWorkMode(work_mode)}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6 h-full overflow-y-auto">
        {/* Key Information Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="flex items-center text-gray-600 mb-2">
              <DollarSign className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Salary</span>
            </div>
            <div className="font-bold text-gray-900">
              {formatSalary(salary_min, salary_max)}
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="flex items-center text-gray-600 mb-2">
              <Users className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Experience</span>
            </div>
            <div className="font-bold text-gray-900">
              {formatExperience(experience_required)}
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <div className="flex items-center text-gray-600 mb-2">
            <MapPin className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Location</span>
          </div>
          <div className="font-semibold text-gray-900">{location}</div>
        </div>

        {/* Tech Stack */}
        {tech_stack && tech_stack.length > 0 && (
          <div>
            <div className="flex items-center text-gray-600 mb-3">
              <Monitor className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Tech Stack</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {tech_stack.slice(0, 6).map((tech, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
                >
                  {tech}
                </span>
              ))}
              {tech_stack.length > 6 && (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                  +{tech_stack.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <div className="flex items-center text-gray-600 mb-2">
            <Briefcase className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">About the Role</span>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed line-clamp-4">
            {description}
          </p>
        </div>

        {/* Posted Time */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            Posted {timeAgo(created_at)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            onClick={handleViewDetails}
            className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2 hover:shadow-lg transition-all duration-300"
          >
            <Eye className="w-4 h-4" />
            <span>View Details</span>
          </button>
          
          <button
            onClick={handleWishlistToggle}
            disabled={wishlistLoading}
            className={`px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-300 ${
              isWishlisted
                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${wishlistLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
          >
            {isWishlisted ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {isWishlisted ? 'Saved' : 'Save'}
            </span>
          </button>
        </div>
      </div>

      {/* Swipe Indicator Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-6 transform -rotate-12 opacity-0 transition-opacity duration-200 swipe-left">
          <div className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold text-lg border-4 border-red-400">
            PASS
          </div>
        </div>
        <div className="absolute top-20 right-6 transform rotate-12 opacity-0 transition-opacity duration-200 swipe-right">
          <div className="bg-green-500 text-white px-4 py-2 rounded-xl font-bold text-lg border-4 border-green-400">
            LIKE
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default JobCard 