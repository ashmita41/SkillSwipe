import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Briefcase, MapPin, DollarSign, Clock, Users, Edit, Trash2, Plus, Search, Filter, Eye, TrendingUp, Heart, MessageCircle, BarChart3, Calendar, Target } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { jobAPI, swipeAPI } from '../utils/api'
import Header from '../components/Header'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useNavigate } from 'react-router-dom'

const MyJobs = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedJob, setSelectedJob] = useState(null)
  const [jobStats, setJobStats] = useState(null)

  useEffect(() => {
    if (user?.role !== 'company') {
      navigate('/dashboard')
      return
    }
    loadJobs()
    loadJobStats()
  }, [user, navigate])

  const loadJobs = async () => {
    try {
      setLoading(true)
      const response = await jobAPI.getJobs()
      setJobs(response.results || [])
    } catch (error) {
      console.error('Failed to load jobs:', error)
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  const loadJobStats = async () => {
    try {
      const response = await jobAPI.getJobStatistics()
      setJobStats(response)
    } catch (error) {
      console.error('Failed to load job statistics:', error)
      setJobStats(null)
    }
  }

  const getJobSpecificStats = async () => {
    try {
      // This would be a new API endpoint for individual job stats
      await swipeAPI.getDashboard('my_swipes')
      
      // Filter and count swipes/matches for this specific job
      const jobSpecificData = {
        total_views: Math.floor(Math.random() * 50) + 10, // Placeholder - would come from actual view tracking
        total_likes: Math.floor(Math.random() * 20) + 5,  // Placeholder - would come from swipe data
        total_matches: Math.floor(Math.random() * 8) + 2, // Placeholder - would come from match data
        recent_activity: Math.floor(Math.random() * 15) + 3 // Placeholder - last 7 days activity
      }
      
      return jobSpecificData
    } catch (error) {
      console.error('Failed to get job specific stats:', error)
      return null
    }
  }

  const handleJobStatsClick = async (job) => {
    setSelectedJob(job)
    const stats = await getJobSpecificStats(job.id)
    setSelectedJob({ ...job, stats })
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'closed': return 'bg-red-100 text-red-700'
      case 'draft': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getJobTypeColor = (jobType) => {
    switch (jobType) {
      case 'full-time': return 'bg-blue-100 text-blue-700'
      case 'part-time': return 'bg-purple-100 text-purple-700'
      case 'contract': return 'bg-orange-100 text-orange-700'
      case 'intern': return 'bg-pink-100 text-pink-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchTerm || 
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.tech_stack?.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const JobCard = ({ job }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
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
                <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                <p className="text-gray-600">{job.company_name}</p>
              </div>
            </div>
            
            {/* Job Meta */}
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Posted {formatDate(job.created_at)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{job.total_applicants || 0} applicants</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                {job.status?.charAt(0).toUpperCase() + job.status?.slice(1)}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getJobTypeColor(job.job_type)}`}>
                {job.job_type?.charAt(0).toUpperCase() + job.job_type?.slice(1).replace('-', ' ')}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                {job.work_mode?.charAt(0).toUpperCase() + job.work_mode?.slice(1)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button 
              onClick={() => handleJobStatsClick(job)}
              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all duration-300"
              title="View job statistics"
            >
              <BarChart3 className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-all duration-300">
              <Edit className="w-5 h-5" />
            </button>
            <button
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-300"
              title="Close job posting"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Description Preview */}
        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
          {job.description?.substring(0, 120)}...
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
              {job.tech_stack.slice(0, 3).map((tech, index) => (
                <span key={index} className="px-2 py-1 bg-primary-100 text-primary-700 rounded-md text-xs font-medium">
                  {tech}
                </span>
              ))}
              {job.tech_stack.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
                  +{job.tech_stack.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Performance Indicators */}
        <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-blue-600 mb-1">
              <Eye className="w-4 h-4" />
              <span className="text-sm font-semibold">{Math.floor(Math.random() * 100) + 20}</span>
            </div>
            <span className="text-xs text-gray-500">Views</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-red-600 mb-1">
              <Heart className="w-4 h-4" />
              <span className="text-sm font-semibold">{Math.floor(Math.random() * 30) + 5}</span>
            </div>
            <span className="text-xs text-gray-500">Likes</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-green-600 mb-1">
              <Target className="w-4 h-4" />
              <span className="text-sm font-semibold">{Math.floor(Math.random() * 10) + 2}</span>
            </div>
            <span className="text-xs text-gray-500">Matches</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button 
            onClick={() => handleJobStatsClick(job)}
            className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span>View Analytics</span>
          </button>
          <button className="px-4 py-2 border border-primary-500 text-primary-500 rounded-lg font-medium hover:bg-primary-50 transition-all duration-300">
            Edit Job
          </button>
        </div>
      </div>
    </motion.div>
  )

  const getOverallJobStats = () => {
    const totalJobs = jobs.length
    const activeJobs = jobs.filter(job => job.status === 'active').length
    const draftJobs = jobs.filter(job => job.status === 'draft').length
    const closedJobs = jobs.filter(job => job.status === 'closed').length

    return {
      totalJobs,
      activeJobs,
      draftJobs,
      closedJobs,
      totalViews: jobStats?.total_applications || 0,
      avgMatchScore: 85 // Placeholder
    }
  }

  const stats = getOverallJobStats()

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
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Job Postings</h1>
            <p className="text-gray-600 text-lg">Manage your job postings and track their performance</p>
          </div>
          <button
            onClick={() => navigate('/create-job')}
            className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Post New Job</span>
          </button>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
                <p className="text-gray-600">Total Jobs</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.activeJobs}</p>
                <p className="text-gray-600">Active Jobs</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
                <p className="text-gray-600">Total Applications</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.avgMatchScore}%</p>
                <p className="text-gray-600">Match Rate</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search your jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="closed">Closed</option>
          </select>
        </motion.div>

        {/* Jobs Grid */}
        {filteredJobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No jobs found' : 'No job postings yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Create your first job posting to start hiring developers'
              }
            </p>
            {(!searchTerm && statusFilter === 'all') && (
              <button
                onClick={() => navigate('/create-job')}
                className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Create Your First Job</span>
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <JobCard job={job} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Job Stats Modal */}
      <AnimatePresence>
        {selectedJob && (
          <JobStatsModal 
            job={selectedJob} 
            onClose={() => setSelectedJob(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  )
}

const JobStatsModal = ({ job, onClose }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const stats = job.stats || {
    total_views: Math.floor(Math.random() * 100) + 20,
    total_likes: Math.floor(Math.random() * 30) + 5,
    total_matches: Math.floor(Math.random() * 10) + 2,
    recent_activity: Math.floor(Math.random() * 15) + 3
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
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-8 border-b border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-100 to-purple-100 rounded-2xl flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
                <p className="text-lg text-gray-600">{job.company?.name || job.company_name}</p>
                <p className="text-sm text-gray-500 flex items-center space-x-1 mt-1">
                  <Calendar className="w-4 h-4" />
                  <span>Posted on {formatDate(job.created_at)}</span>
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
        </div>

        {/* Stats Content */}
        <div className="p-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stats.total_views}</div>
              <div className="text-sm text-gray-600">Total Views</div>
            </div>

            <div className="bg-red-50 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stats.total_likes}</div>
              <div className="text-sm text-gray-600">Likes Received</div>
            </div>

            <div className="bg-green-50 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stats.total_matches}</div>
              <div className="text-sm text-gray-600">Matches Created</div>
            </div>

            <div className="bg-purple-50 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stats.recent_activity}</div>
              <div className="text-sm text-gray-600">Recent Activity</div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              <span>Performance Insights</span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Conversion Rate (Likes/Views)</span>
                <span className="font-semibold text-gray-900">
                  {((stats.total_likes / stats.total_views) * 100).toFixed(1)}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Match Rate (Matches/Likes)</span>
                <span className="font-semibold text-gray-900">
                  {((stats.total_matches / stats.total_likes) * 100).toFixed(1)}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Days Active</span>
                <span className="font-semibold text-gray-900">
                  {Math.floor((new Date() - new Date(job.created_at)) / (1000 * 60 * 60 * 24))} days
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button className="flex-1 bg-gradient-to-r from-primary-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2">
              <Edit className="w-5 h-5" />
              <span>Edit Job Posting</span>
            </button>
            
            <button className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span>View Applicants</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default MyJobs 