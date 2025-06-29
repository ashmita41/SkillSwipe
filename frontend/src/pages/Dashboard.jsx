import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Eye, Search, Filter, Briefcase, ThumbsUp } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { swipeAPI, jobAPI } from '../utils/api'
import { useNavigate } from 'react-router-dom'
import SwipeableCards from '../components/SwipeableCards'
import FilterPanel from '../components/FilterPanel'
import CreateJobPrompt from '../components/CreateJobPrompt'
import Header from '../components/Header'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('for_me')
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({})
  const [hasJobs, setHasJobs] = useState(true)
  const [stats, setStats] = useState({})
  const [jobStats, setJobStats] = useState({})

  const tabs = [
    { 
      id: 'for_me', 
      label: 'For Me', 
      icon: Heart, 
      description: user?.role === 'developer' ? 'Discover new job opportunities' : 'Discover new developer talent'
    },
    { 
      id: 'showed_interest', 
      label: 'Showed Interest', 
      icon: Eye, 
      description: user?.role === 'developer' ? 'Companies who liked you' : 'Developers who liked your jobs'
    },
    { 
      id: 'my_swipes', 
      label: 'My Swipes', 
      icon: ThumbsUp, 
      description: user?.role === 'developer' ? 'Jobs you liked' : 'Developers you liked'
    }
  ]

  useEffect(() => {
    loadDashboardData()
    if (user?.role === 'company') {
      checkJobStatus()
      loadJobStatistics()
    }
  }, [activeTab, filters])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load dashboard data for specific tab (for_me now includes discover functionality)
      const response = await swipeAPI.getDashboard(activeTab)
      
      // Handle different response structures
      if (response.results) {
        setCards(response.results)
      } else if (Array.isArray(response)) {
        setCards(response)
      } else {
        setCards([])
      }
      
      // Set stats if available
      if (response.stats) {
        setStats(response.stats)
      }
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      setCards([])
    } finally {
      setLoading(false)
    }
  }

  const checkJobStatus = async () => {
    try {
      const response = await jobAPI.getJobStatistics()
      setHasJobs(response.total_jobs > 0)
    } catch (error) {
      console.error('Failed to check job status:', error)
      setHasJobs(false)
    }
  }

  const loadJobStatistics = async () => {
    try {
      const response = await jobAPI.getJobStatistics()
      setJobStats(response)
    } catch (error) {
      console.error('Failed to load job statistics:', error)
      setJobStats({})
    }
  }

  const handleSwipe = async (direction, cardData) => {
    // Handle bookmark action - card already removed from view in SwipeableCards
    if (direction === 'bookmark') {
      console.log('Item bookmarked:', cardData)
      // Remove the bookmarked card from current view
      setCards(prev => prev.filter(card => card.id !== cardData.id))
      return
    }
    
    // Remove swiped card from current view immediately for better UX
    setCards(prev => prev.filter(card => card.id !== cardData.id))
    
    // Record the swipe action (only for right swipes)
    if (direction === 'right') {
      try {
        let swipeData
        
        // Determine swipe type based on tab context and user role
        if (activeTab === 'my_swipes') {
          // In 'my_swipes' tab, don't record swipes (these are already swiped items)
          console.log('No swipe recording needed for my_swipes tab')
          return
        } else if (activeTab === 'showed_interest') {
          // In 'showed_interest' tab: Developer swipes on companies, Company swipes on developers
          if (user?.role === 'developer') {
            // Developer swiping on company profiles
            swipeData = { 
              swipe_type: 'profile', 
              target_user_id: cardData.user_id || cardData.id
            }
          } else {
            // Company swiping on developer profiles  
            swipeData = { 
              swipe_type: 'profile', 
              target_user_id: cardData.user_id || cardData.id
            }
          }
        } else {
          // In 'for_me' tab: Developer swipes on jobs, Company swipes on developers
          if (user?.role === 'developer') {
            // Developer swiping on jobs
            swipeData = { 
              swipe_type: 'job', 
              job_id: cardData.id
            }
          } else {
            // Company swiping on developers
            swipeData = { 
              swipe_type: 'profile', 
              target_user_id: cardData.user_id || cardData.id
            }
          }
        }
        
        
        const response = await swipeAPI.swipe(swipeData)
        
        if (response.match_created) {
          // Show match notification
          console.log('🎉 It\'s a match!', response.match)
          // TODO: Show match modal or notification
        }
      } catch (error) {
        console.error('Failed to record swipe:', error)
        // Optionally show error message to user
      }
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    setShowFilters(false)
  }

  // Show create job prompt for companies without jobs
  if (user?.role === 'company' && !hasJobs) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <Header />
        <CreateJobPrompt />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


        {/* Company Job Statistics */}
        {user?.role === 'company' && hasJobs && Object.keys(jobStats).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20 max-w-4xl mx-auto">
                            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Your Job Statistics</h2>
                <div className="flex space-x-3">
                  <button
                    onClick={() => navigate('/my-jobs')}
                    className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold hover:scale-105"
                  >
                    Manage Jobs
                  </button>
                  <button
                    onClick={() => navigate('/create-job')}
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold hover:scale-105"
                  >
                    + Create New Job
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-blue-600">{jobStats.total_jobs || 0}</div>
                  <div className="text-sm text-blue-800">Total Jobs</div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-green-600">{jobStats.active_jobs || 0}</div>
                  <div className="text-sm text-green-800">Active Jobs</div>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-orange-600">{jobStats.total_applications || 0}</div>
                  <div className="text-sm text-orange-800">Total Swipes</div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-purple-600">{jobStats.avg_match_score ? `${jobStats.avg_match_score}%` : '0%'}</div>
                  <div className="text-sm text-purple-800">Avg Match Score</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Enhanced Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-12"
        >
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-3 shadow-2xl border border-white/20">
            <div className="flex space-x-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex flex-col items-center space-y-1 min-w-[120px] ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-primary-500 via-purple-500 to-secondary-500 text-white shadow-2xl scale-105'
                        : 'text-gray-600 hover:bg-white/70 hover:text-primary-600 hover:scale-102'
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${activeTab === tab.id ? 'drop-shadow-sm' : ''}`} />
                    <span className="text-sm font-medium">{tab.label}</span>
                    <span className={`text-xs opacity-75 ${activeTab === tab.id ? 'text-white/80' : 'text-gray-500'}`}>
                      {tab.description.split(' ').slice(0, 2).join(' ')}
                    </span>
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-primary-500 via-purple-500 to-secondary-500 rounded-2xl -z-10"
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Enhanced Filter Button for 'For Me' tab */}
        {activeTab === 'for_me' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center mb-8"
          >
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gradient-to-r from-white to-purple-50 px-8 py-4 rounded-2xl shadow-xl border border-purple-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center space-x-3 text-gray-700 hover:text-primary-600 backdrop-blur-sm"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Customize Filters</div>
                <div className="text-sm text-gray-500">Personalize your experience</div>
              </div>
            </button>
          </motion.div>
        )}

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && activeTab === 'for_me' && (
            <FilterPanel
              userRole={user?.role}
              onFilterChange={handleFilterChange}
              onClose={() => setShowFilters(false)}
            />
          )}
        </AnimatePresence>

        {/* Tab Description */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-8"
        >
          <p className="text-gray-500">
            {tabs.find(tab => tab.id === activeTab)?.description}
          </p>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-600">Loading amazing {user?.role === 'developer' ? 'jobs' : 'developers'}...</p>
            </div>
          </div>
        ) : (
          /* Cards Section */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            {cards.length > 0 ? (
              <SwipeableCards
                cards={cards}
                userRole={user?.role}
                onSwipe={handleSwipe}
                cardType={loading ? null : (
                  // FOR ME: Developer sees jobs, Company sees developers
                  activeTab === 'for_me' ? (user?.role === 'developer' ? 'jobs' : 'developers') :
                  // SHOWED INTEREST: Developer sees companies, Company sees developers  
                  activeTab === 'showed_interest' ? (user?.role === 'developer' ? 'companies' : 'developers') :
                  // MY SWIPES: Developer sees jobs, Company sees developers
                  activeTab === 'my_swipes' ? (user?.role === 'developer' ? 'jobs' : 'developers') :
                  'unknown'
                )}
              />
            ) : (
              <div className="text-center py-20">
                <div className="w-32 h-32 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  {user?.role === 'developer' ? (
                    <Briefcase className="w-16 h-16 text-primary-500" />
                  ) : (
                    <Heart className="w-16 h-16 text-primary-500" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {activeTab === 'showed_interest'
                    ? 'No interests shown yet'
                    : 'No recommendations available'
                  }
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {activeTab === 'showed_interest'
                    ? user?.role === 'developer' 
                      ? 'No companies have shown interest in your profile yet. Keep updating your profile and applying to jobs!'
                      : 'No developers have shown interest in your jobs yet. Consider posting more attractive job listings!'
                    : activeTab === 'my_swipes'
                    ? user?.role === 'developer'
                      ? 'You haven\'t liked any jobs yet. Go to "For Me" to start discovering opportunities!'
                      : 'You haven\'t liked any developers yet. Go to "For Me" to start discovering talent!'
                    : `You've seen all available ${user?.role === 'developer' ? 'jobs' : 'developers'}. Check back later for new additions!`
                  }
                </p>
              </div>
            )}
          </motion.div>
        )}

                {/* Statistics for certain tabs */}
        {(activeTab === 'showed_interest' || activeTab === 'for_me') && stats && Object.keys(stats).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto"
          >
            {stats.total_swipes_made && (
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 text-center">
                <div className="text-3xl font-bold gradient-text mb-2">{stats.total_swipes_made}</div>
                <div className="text-gray-600">Total Swipes</div>
              </div>
            )}
            {stats.total_matches && (
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 text-center">
                <div className="text-3xl font-bold gradient-text mb-2">{stats.total_matches}</div>
                <div className="text-gray-600">Matches</div>
              </div>
            )}
            {stats.profile_completion && (
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 text-center">
                <div className="text-3xl font-bold gradient-text mb-2">{stats.profile_completion}%</div>
                <div className="text-gray-600">Profile Complete</div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Dashboard 