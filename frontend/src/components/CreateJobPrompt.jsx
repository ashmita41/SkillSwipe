import React from 'react'
import { Plus, Briefcase } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from './ui/Button'

const CreateJobPrompt = () => {
  const navigate = useNavigate()

  const handleCreateJob = () => {
    navigate('/create-job')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-12">
          {/* Icon */}
          <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Briefcase className="w-10 h-10 text-white" />
          </div>
          
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Start Hiring Developers
          </h1>
          
          {/* Description */}
          <p className="text-lg text-gray-600 mb-8">
            Create your first job posting to connect with talented developers on our platform.
          </p>
          
          {/* Create Job Button */}
          <Button
            onClick={handleCreateJob}
            size="lg"
            className="px-8 py-4 text-lg font-semibold flex items-center space-x-3 mx-auto"
          >
            <Plus className="w-6 h-6" />
            <span>Create Job Now</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CreateJobPrompt 