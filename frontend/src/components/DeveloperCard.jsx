import React from 'react'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Code, 
  Star, 
  Calendar,
  Database,
  Monitor,
  Cloud,
  Award,
  Github,
  ExternalLink,
  User,
  Briefcase,
  DollarSign,
  Heart
} from 'lucide-react'

const DeveloperCard = ({ developer }) => {
  const {
    name,
    username,
    bio,
    current_location,
    experience_years,
    top_languages = [],
    tools = [],
    databases = [],
    domains = [],
    clouds = [],
    certifications,
    github,
    leetcode,
    github_for_geeks,
    hackerrank,
    salary_expectation_min,
    salary_expectation_max,
    willing_to_relocate,
    top_two_cities = [],
    profile_completion,
    created_at
  } = developer

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Salary negotiable'
    if (min && max) return `₹${(min/100000).toFixed(1)}L - ₹${(max/100000).toFixed(1)}L`
    if (min) return `₹${(min/100000).toFixed(1)}L+`
    return `Up to ₹${(max/100000).toFixed(1)}L`
  }

  const formatExperience = (years) => {
    if (years === 0) return 'Fresher'
    if (years === 1) return '1 year'
    if (years <= 2) return 'Entry Level'
    if (years <= 5) return 'Mid Level'
    if (years <= 10) return 'Senior Level'
    return 'Lead/Principal'
  }

  const timeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
    
    if (diffInDays < 1) return 'Joined today'
    if (diffInDays < 30) return `Joined ${diffInDays}d ago`
    const diffInMonths = Math.floor(diffInDays / 30)
    if (diffInMonths < 12) return `Joined ${diffInMonths}mo ago`
    return `Joined ${Math.floor(diffInMonths / 12)}y ago`
  }

  const profileLinks = [
    { icon: Github, url: github, label: 'GitHub' },
    { icon: Code, url: leetcode, label: 'LeetCode' },
    { icon: Monitor, url: github_for_geeks, label: 'GeeksforGeeks' },
    { icon: Star, url: hackerrank, label: 'HackerRank' }
  ].filter(link => link.url)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl shadow-xl border border-gray-100 h-[600px] overflow-hidden relative"
    >
      {/* Header with Developer Info */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{name}</h1>
                <p className="text-white/80">@{username}</p>
                <div className="flex items-center text-white/80 text-sm mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  {current_location}
                </div>
              </div>
            </div>
            
            {profile_completion && (
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mb-1">
                  <span className="text-sm font-bold">{profile_completion}%</span>
                </div>
                <span className="text-xs text-white/80">Complete</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <Briefcase className="w-4 h-4" />
              <span>{formatExperience(experience_years)}</span>
            </div>
            {willing_to_relocate && (
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4" />
                <span>Open to relocate</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-5 h-full overflow-y-auto">
        {/* Bio */}
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center">
            <User className="w-4 h-4 mr-2" />
            About
          </h3>
          <p className="text-gray-800 text-sm leading-relaxed line-clamp-3">
            {bio}
          </p>
        </div>

        {/* Salary Expectations */}
        {(salary_expectation_min || salary_expectation_max) && (
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="flex items-center text-gray-600 mb-2">
              <DollarSign className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Salary Expectation</span>
            </div>
            <div className="font-bold text-gray-900">
              {formatSalary(salary_expectation_min, salary_expectation_max)}
            </div>
          </div>
        )}

        {/* Programming Languages */}
        {top_languages && top_languages.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
              <Code className="w-4 h-4 mr-2" />
              Top Languages
            </h3>
            <div className="flex flex-wrap gap-2">
              {top_languages.map((lang, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tools & Frameworks */}
        {tools && tools.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
              <Monitor className="w-4 h-4 mr-2" />
              Tools & Frameworks
            </h3>
            <div className="flex flex-wrap gap-2">
              {tools.map((tool, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Domain Expertise */}
        {domains && domains.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
              <Briefcase className="w-4 h-4 mr-2" />
              Domain Expertise
            </h3>
            <div className="flex flex-wrap gap-2">
              {domains.map((domain, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                >
                  {domain}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Technical Skills Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Databases */}
          {databases && databases.length > 0 && (
            <div className="bg-gray-50 p-3 rounded-xl">
              <div className="flex items-center text-gray-600 mb-2">
                <Database className="w-4 h-4 mr-1" />
                <span className="text-xs font-medium">Databases</span>
              </div>
              <div className="space-y-1">
                {databases.slice(0, 2).map((db, index) => (
                  <div key={index} className="text-xs text-gray-800 font-medium">
                    {db}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cloud Platforms */}
          {clouds && clouds.length > 0 && (
            <div className="bg-gray-50 p-3 rounded-xl">
              <div className="flex items-center text-gray-600 mb-2">
                <Cloud className="w-4 h-4 mr-1" />
                <span className="text-xs font-medium">Cloud</span>
              </div>
              <div className="space-y-1">
                {clouds.slice(0, 2).map((cloud, index) => (
                  <div key={index} className="text-xs text-gray-800 font-medium">
                    {cloud}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Certifications */}
        {certifications && (
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center">
              <Award className="w-4 h-4 mr-2" />
              Certifications
            </h3>
            <p className="text-gray-700 text-sm line-clamp-2">{certifications}</p>
          </div>
        )}

        {/* Profile Links */}
        {profileLinks.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-3">Profile Links</h3>
            <div className="grid grid-cols-2 gap-2">
              {profileLinks.slice(0, 4).map((link, index) => {
                const Icon = link.icon
                return (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-700"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="truncate">{link.label}</span>
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </a>
                )
              })}
            </div>
          </div>
        )}

        {/* Relocation Preferences */}
        {willing_to_relocate && top_two_cities && top_two_cities.length > 0 && (
          <div className="bg-green-50 p-4 rounded-xl">
            <h3 className="text-sm font-semibold text-green-800 mb-2">
              Preferred Cities for Relocation
            </h3>
            <div className="flex space-x-2">
              {top_two_cities.map((city, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                >
                  {city}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Member Since */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {timeAgo(created_at)}
          </div>
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

export default DeveloperCard 