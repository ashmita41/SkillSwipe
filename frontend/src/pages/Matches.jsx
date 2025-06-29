import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, Calendar, MapPin, DollarSign, Briefcase, User, ExternalLink, Github, Linkedin } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { swipeAPI } from '../utils/api'
import Header from '../components/Header'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const Matches = () => {
  const { user } = useAuth()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState(null)

  useEffect(() => {
    loadMatches()
  }, [])

  const loadMatches = async () => {
    try {
      setLoading(true)
      const response = await swipeAPI.getMatches()
      setMatches(response.results || [])
    } catch (error) {
      console.error('Failed to load matches:', error)
      setMatches([])
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

  const MatchCard = ({ match }) => {
    // New match data structure: { match_id, matched_on, job_context, matched_user }
    const matchedUser = match.matched_user
    const jobContext = match.job_context

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5, scale: 1.02 }}
        className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group cursor-pointer"
        onClick={() => setSelectedMatch(match)}
      >
        {/* Header with match indicator */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-4 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white fill-current" />
              </div>
              <div>
                <h3 className="font-bold text-lg">It's a Match! 🎉</h3>
                <p className="text-white/80 text-sm">Matched on {formatDate(match.matched_on)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="p-6">
          {/* User Info */}
          <div className="flex items-start space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-100 to-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-primary-600">
                {matchedUser?.name?.charAt(0)?.toUpperCase() || matchedUser?.username?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-bold text-gray-900 mb-1">
                {matchedUser?.name || matchedUser?.username}
              </h4>
              <p className="text-sm text-gray-600 mb-2 capitalize">
                {matchedUser?.role}
              </p>
              {(matchedUser?.current_location || matchedUser?.location) && (
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span>{matchedUser?.current_location || matchedUser?.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Job Context (if applicable) */}
          {jobContext && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <Briefcase className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-gray-900">Matched via Job</span>
              </div>
              <h5 className="font-semibold text-gray-900">{jobContext.title}</h5>
              <p className="text-sm text-gray-600">{jobContext.company?.name}</p>
              {jobContext.salary_min && (
                <div className="flex items-center space-x-1 text-sm text-gray-500 mt-1">
                  <DollarSign className="w-3 h-3" />
                  <span>{formatSalary(jobContext.salary_min)} - {formatSalary(jobContext.salary_max)}</span>
                </div>
              )}
            </div>
          )}

          {/* Profile Preview */}
          {matchedUser?.role === 'developer' && (
            <div className="space-y-3">
              {/* Experience */}
              {matchedUser.experience_years !== undefined && (
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {matchedUser.experience_years} years experience
                  </span>
                </div>
              )}

              {/* Skills */}
              {matchedUser.top_languages?.length > 0 && (
                <div>
                  <span className="text-sm text-gray-500 block mb-1">Languages:</span>
                  <div className="flex flex-wrap gap-1">
                    {matchedUser.top_languages.slice(0, 3).map((lang, index) => (
                      <span key={index} className="px-2 py-1 bg-primary-100 text-primary-700 rounded-md text-xs font-medium">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Salary Expectation */}
              {matchedUser.salary_expectation_min && (
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {formatSalary(matchedUser.salary_expectation_min)} - {formatSalary(matchedUser.salary_expectation_max)}
                  </span>
                </div>
              )}

              {/* Bio Preview */}
              {matchedUser.bio && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {matchedUser.bio.substring(0, 120)}...
                </p>
              )}
            </div>
          )}

          {matchedUser?.role === 'company' && (
            <div className="space-y-3">
              {/* Company Bio */}
              {matchedUser.about && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {matchedUser.about.substring(0, 120)}...
                </p>
              )}

              {/* Company Info */}
              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                {matchedUser.website && (
                  <div className="flex items-center space-x-1">
                    <ExternalLink className="w-3 h-3" />
                    <span>Website</span>
                  </div>
                )}
                {matchedUser.total_users && (
                  <div className="flex items-center space-x-1">
                    <User className="w-3 h-3" />
                    <span>{matchedUser.total_users} team member{matchedUser.total_users !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-6">
            <button className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2 hover:shadow-lg transition-all duration-300">
              <MessageCircle className="w-4 h-4" />
              <span>Start Chat</span>
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation()
                setSelectedMatch(match)
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300"
            >
              View Profile
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  const MatchDetailModal = ({ match, onClose }) => {
    if (!match) return null

    const matchedUser = match.matched_user
    const jobContext = match.job_context

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold">
                    {matchedUser?.name?.charAt(0)?.toUpperCase() || matchedUser?.username?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{matchedUser?.name || matchedUser?.username}</h2>
                  <p className="text-white/80 capitalize">{matchedUser?.role}</p>
                  {jobContext && (
                    <p className="text-white/60 text-sm">via {jobContext.title}</p>
                  )}
                </div>
              </div>
              <button 
                onClick={onClose}
                className="text-white/80 hover:text-white text-2xl font-bold"
              >
                ×
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Job Context in Modal */}
            {jobContext && (
              <div className="bg-gradient-to-r from-blue-50 to-primary-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Briefcase className="w-5 h-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Match Context</h3>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">{jobContext.title}</h4>
                  <p className="text-sm text-gray-600">{jobContext.company?.name}</p>
                  {jobContext.location && (
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span>{jobContext.location}</span>
                    </div>
                  )}
                  {jobContext.salary_min && (
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <DollarSign className="w-4 h-4" />
                      <span>{formatSalary(jobContext.salary_min)} - {formatSalary(jobContext.salary_max)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bio/About */}
            {(matchedUser?.bio || matchedUser?.about) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
                <p className="text-gray-600 leading-relaxed">{matchedUser?.bio || matchedUser?.about}</p>
              </div>
            )}

            {/* Developer Details */}
            {matchedUser?.role === 'developer' && (
              <div className="space-y-4">
                {/* Experience & Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Experience</h4>
                    <p className="text-gray-600">{matchedUser.experience_years || 0} years</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Location</h4>
                    <p className="text-gray-600">{matchedUser.current_location || 'Not specified'}</p>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Technical Skills</h4>
                  <div className="space-y-3">
                    {matchedUser.top_languages?.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Languages:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {matchedUser.top_languages.map((lang, index) => (
                            <span key={index} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {matchedUser.tools?.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Tools:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {matchedUser.tools.map((tool, index) => (
                            <span key={index} className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm">
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Salary Expectations */}
                {matchedUser.salary_expectation_min && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Salary Expectations</h4>
                    <p className="text-gray-600">
                      {formatSalary(matchedUser.salary_expectation_min)} - {formatSalary(matchedUser.salary_expectation_max)}
                    </p>
                  </div>
                )}

                {/* Links */}
                {(matchedUser.github || matchedUser.github_for_geeks || matchedUser.leetcode) && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Professional Links</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {matchedUser.github && (
                        <a 
                          href={matchedUser.github} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg text-primary-600 hover:text-primary-700 hover:bg-gray-100 transition-colors"
                        >
                          <Github className="w-5 h-5" />
                          <span>GitHub</span>
                          <ExternalLink className="w-4 h-4 ml-auto" />
                        </a>
                      )}
                      {matchedUser.leetcode && (
                        <a 
                          href={matchedUser.leetcode} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg text-primary-600 hover:text-primary-700 hover:bg-gray-100 transition-colors"
                        >
                          <ExternalLink className="w-5 h-5" />
                          <span>LeetCode</span>
                          <ExternalLink className="w-4 h-4 ml-auto" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Company Details */}
            {matchedUser?.role === 'company' && (
              <div className="space-y-4">
                {/* Company Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-900 mb-2">Team Size</h5>
                    <p className="text-gray-600">{matchedUser.total_users || 1} team member{matchedUser.total_users !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-900 mb-2">Location</h5>
                    <p className="text-gray-600">{matchedUser.location || 'Not specified'}</p>
                  </div>
                </div>

                {/* Company Links */}
                {(matchedUser.website || matchedUser.linkedin_url) && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Company Links</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {matchedUser.website && (
                        <a 
                          href={matchedUser.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg text-primary-600 hover:text-primary-700 hover:bg-gray-100 transition-colors"
                        >
                          <ExternalLink className="w-5 h-5" />
                          <span>Website</span>
                          <ExternalLink className="w-4 h-4 ml-auto" />
                        </a>
                      )}
                      {matchedUser.linkedin_url && (
                        <a 
                          href={matchedUser.linkedin_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg text-primary-600 hover:text-primary-700 hover:bg-gray-100 transition-colors"
                        >
                          <Linkedin className="w-5 h-5" />
                          <span>LinkedIn</span>
                          <ExternalLink className="w-4 h-4 ml-auto" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 hover:shadow-lg transition-all duration-300">
                <MessageCircle className="w-5 h-5" />
                <span>Start Conversation</span>
              </button>
              <button 
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white fill-current" />
            </div>
            <h1 className="text-4xl font-bold gradient-text">Your Matches</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with {user?.role === 'developer' ? 'companies' : 'developers'} who are interested in working with you
          </p>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-600">Loading your matches...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Matches Grid */}
            {matches.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {matches.map((match, index) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <MatchCard match={match} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              /* Empty State */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <div className="w-32 h-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No matches yet</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                  Keep swiping to find {user?.role === 'developer' ? 'companies' : 'developers'} who are interested in connecting with you.
                </p>
                <button 
                  onClick={() => window.location.href = '/dashboard'}
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                >
                  Start Swiping
                </button>
              </motion.div>
            )}
          </>
        )}

        {/* Match Detail Modal */}
        <AnimatePresence>
          {selectedMatch && (
            <MatchDetailModal 
              match={selectedMatch} 
              onClose={() => setSelectedMatch(null)} 
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Matches 