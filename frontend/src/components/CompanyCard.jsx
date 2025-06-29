import React from 'react'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Building, 
  Globe, 
  Users,
  ExternalLink,
  Star
} from 'lucide-react'

const CompanyCard = ({ company }) => {
  const {
    id,
    name,
    about,
    location,
    website,
    linkedin_url,
    logo_url,
    total_users,
    created_at
  } = company

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

  const companyLinks = [
    { icon: Globe, url: website, label: 'Website' },
    { icon: ExternalLink, url: linkedin_url, label: 'LinkedIn' }
  ].filter(link => link.url)

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
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                {logo_url ? (
                  <img src={logo_url} alt={name} className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <Building className="w-8 h-8 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{name}</h1>
                <div className="flex items-center text-white/80 text-sm mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  {location}
                </div>
              </div>
            </div>
            
            {total_users && (
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mb-1">
                  <span className="text-sm font-bold">{total_users}</span>
                </div>
                <span className="text-xs text-white/80">HR{total_users !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4" />
              <span>{timeAgo(created_at)}</span>
            </div>
            {total_users > 1 && (
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Team hiring</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-5 h-full overflow-y-auto">
        {/* About */}
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center">
            <Building className="w-4 h-4 mr-2" />
            About Company
          </h3>
          <p className="text-gray-800 text-sm leading-relaxed">
            {about}
          </p>
        </div>

        {/* Company Links */}
        {companyLinks.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
              <ExternalLink className="w-4 h-4 mr-2" />
              Company Links
            </h3>
            <div className="space-y-2">
              {companyLinks.map((link, index) => {
                const Icon = link.icon
                return (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <Icon className="w-4 h-4 text-gray-600 mr-3" />
                    <span className="text-sm font-medium text-gray-700">{link.label}</span>
                    <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
                  </a>
                )
              })}
            </div>
          </div>
        )}

        {/* Company Stats */}
        <div className="bg-gradient-to-r from-gray-50 to-primary-50 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">Company Info</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Team Size</span>
              <div className="font-semibold text-gray-900">
                {total_users} HR member{total_users !== 1 ? 's' : ''}
              </div>
            </div>
            <div>
              <span className="text-gray-500">On Platform</span>
              <div className="font-semibold text-gray-900">
                {timeAgo(created_at)}
              </div>
            </div>
          </div>
        </div>

        {/* Interest Indicator */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Star className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-green-800">
            This company showed interest in you!
          </p>
          <p className="text-xs text-green-600 mt-1">
            They may have open positions that match your profile
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default CompanyCard 