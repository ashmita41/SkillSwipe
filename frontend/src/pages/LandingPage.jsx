import { motion } from 'framer-motion'
import { ArrowRight, Zap, Users, Target, Code, Building, Mail, Phone, MapPin, UserCheck, Briefcase, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'

const LandingPage = () => {
  console.log('LandingPage component rendered')

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="container mx-auto px-6 py-6 sticky top-0 backdrop-blur-glass z-50 rounded-b-lg shadow-sm">
        <nav className="flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center shadow-lg">
              <Code className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">SkillSwipe</h1>
          </motion.div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6">
        <section className="py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight text-shadow"
            >
              Connect Talent with
              <span className="gradient-text block mt-2 animate-bounce-gentle">Real Opportunity</span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              SkillSwipe revolutionizes tech recruitment by connecting skilled developers with companies through smart swiping, verified profiles, and mutual interest. 
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              <Link to="/register">
                <Button size="lg" className="group shadow-lg hover:shadow-xl transition-all duration-300">
                  Start Your Journey
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="border-2 hover:bg-primary-50">
                Watch Demo
              </Button>
            </motion.div>

            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            >
              {[
                { 
                  icon: UserCheck, 
                  title: "Skill-First Matching", 
                  description: "Developer onboarding focused on technical expertise and verified skills",
                  gradient: "from-blue-500 to-purple-600"
                },
                { 
                  icon: Briefcase, 
                  title: "Early Partners Welcome", 
                  description: "Accepting forward-thinking companies seeking top talent",
                  gradient: "from-green-500 to-teal-600"
                },
                { 
                  icon: Heart, 
                  title: "Mutual Connections", 
                  description: "Only meaningful matches, eliminating recruitment noise",
                  gradient: "from-pink-500 to-red-600"
                }
              ].map((stat, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.1, duration: 0.6 }}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 group"
                >
                  <div className={`w-14 h-14 bg-gradient-to-r ${stat.gradient} rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2 text-center">
                    {stat.title}
                  </h4>
                  <p className="text-gray-600 text-center text-sm leading-relaxed">
                    {stat.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="text-center mb-16"
          >
            <h3 className="text-4xl font-bold text-gray-900 mb-4 text-shadow">
              Why Choose SkillSwipe?
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of tech recruitment with our innovative platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Target,
                title: "Precision Matching",
                description: "Advanced algorithms analyze skills, experience, and cultural fit to ensure perfect matches between talent and opportunities."
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Skip lengthy application processes. Connect instantly with relevant opportunities through our streamlined matching system."
              },
              {
                icon: Users,
                title: "Direct Connections",
                description: "Eliminate intermediaries and connect directly with decision-makers, fostering authentic professional relationships."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + index * 0.2, duration: 0.8 }}
                className="card text-center group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.8 }}
            className="text-center mb-16"
          >
            <h3 className="text-4xl font-bold text-gray-900 mb-4 text-shadow">
              How It Works
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* For Developers */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 2, duration: 0.8 }}
              className="card hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mr-4 shadow-lg">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900">For Developers</h4>
              </div>
              <div className="space-y-4">
                {[
                  "Create your profile with skills and experience",
                  "Browse and swipe on exciting job opportunities", 
                  "Connect directly with hiring managers"
                ].map((step, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                      <span className="text-sm font-bold text-primary-600">{index + 1}</span>
                    </div>
                    <p className="text-gray-700">{step}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* For Companies */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 2.2, duration: 0.8 }}
              className="card hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-lg flex items-center justify-center mr-4 shadow-lg">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900">For Companies</h4>
              </div>
              <div className="space-y-4">
                {[
                  "Post your job requirements and company culture",
                  "Review matched developer profiles",
                  "Connect with top talent instantly"
                ].map((step, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-6 h-6 bg-secondary-100 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                      <span className="text-sm font-bold text-secondary-600">{index + 1}</span>
                    </div>
                    <p className="text-gray-700">{step}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.4, duration: 0.8 }}
            className="text-center bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-12 text-white shadow-2xl"
          >
            <h3 className="text-4xl font-bold mb-4">
              Ready to Join the Skill-First Hiring Movement?
            </h3>
            <p className="text-xl mb-8 opacity-90">
              We're now onboarding developers and companies for early access. Be part of the first wave of skill-first hiring.
            </p>
            <Link to="/register">
              <Button 
                size="lg" 
                className="bg-white text-primary-600 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Get Started Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center shadow-lg">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <h5 className="text-2xl font-bold">SkillSwipe</h5>
              </div>
              <p className="text-gray-400 mb-4">
                Revolutionizing tech recruitment through intelligent matching.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors hover:scale-110 transform duration-200">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors hover:scale-110 transform duration-200">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h6 className="text-lg font-semibold mb-4">Quick Links</h6>
              <ul className="space-y-2">
                <li><Link to="/register" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block">Get Started</Link></li>
                <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block">Sign In</Link></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block">How It Works</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block">FAQ</a></li>
              </ul>
            </div>

            {/* For Developers */}
            <div>
              <h6 className="text-lg font-semibold mb-4">For Developers</h6>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block">Create Profile</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block">Discover Jobs</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block">Learn More</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h6 className="text-lg font-semibold mb-4">Contact</h6>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-400 hover:text-white transition-colors">
                  <Mail className="w-4 h-4 mr-2" />
                  support@skillswipe.com
                </li>
                <li className="flex items-center text-gray-400 hover:text-white transition-colors">
                  <Phone className="w-4 h-4 mr-2" />
                  +91-XXXXXXXXXX
                </li>
                <li className="flex items-center text-gray-400 hover:text-white transition-colors">
                  <MapPin className="w-4 h-4 mr-2" />
                  Rajasthan, IN
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 SkillSwipe. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage 