import React, { useState, useMemo, useRef } from 'react'
import TinderCard from 'react-tinder-card'
import { motion } from 'framer-motion'
import JobCard from './JobCard'
import DeveloperCard from './DeveloperCard'
import CompanyCard from './CompanyCard'
import { Heart, X, Bookmark } from 'lucide-react'
import { wishlistAPI } from '../utils/api'

const SwipeableCards = ({ cards, userRole, onSwipe, cardType }) => {
  const [currentIndex, setCurrentIndex] = useState(cards.length - 1)
  const [lastDirection, setLastDirection] = useState()
  const [wishlistedJobs, setWishlistedJobs] = useState(new Set())
  const [bookmarkedDevelopers, setBookmarkedDevelopers] = useState(new Set())
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [lastWishlistAction, setLastWishlistAction] = useState(null)
  const currentIndexRef = useRef(currentIndex)

  const childRefs = useMemo(
    () => Array(cards.length).fill(0).map((i) => React.createRef()),
    [cards.length]
  )

  const updateCurrentIndex = (val) => {
    setCurrentIndex(val)
    currentIndexRef.current = val
  }

  const canSwipe = currentIndex >= 0

  const swiped = (direction, cardData, index) => {
    setLastDirection(direction)
    setLastWishlistAction(null) // Clear any existing wishlist feedback
    updateCurrentIndex(index - 1)
    onSwipe(direction, cardData)
  }

  const outOfFrame = (cardData, index) => {
    console.log(`${cardData.title || cardData.name} (${index}) left the screen!`)
    if (currentIndexRef.current >= index) {
      // Remove the card from view
    }
  }

  const swipeCard = (direction) => {
    if (canSwipe && currentIndex < cards.length) {
      const cardRef = childRefs[currentIndex]
      if (cardRef.current) {
        cardRef.current.swipe(direction)
      }
    }
  }

  const handleAddToBookmark = async () => {
    if (!canSwipe || currentIndex >= cards.length) return
    
    const currentCard = cards[currentIndex]
    if (!currentCard) return


    setWishlistLoading(true)
    setLastDirection(null) // Clear any existing swipe feedback
    
    try {
      let alreadyBookmarked = false
      let bookmarkSuccess = false

      if (cardType === 'jobs' && userRole === 'developer') {
        // Developer bookmarking jobs
        console.log('💼 Developer bookmarking job:', currentCard.id)
        if (wishlistedJobs.has(currentCard.id)) {
          alreadyBookmarked = true
        } else {
          await wishlistAPI.addToWishlist(currentCard.id)
          setWishlistedJobs(prev => new Set(prev).add(currentCard.id))
          bookmarkSuccess = true
        }
      } else if (cardType === 'developers' && userRole === 'company') {
        // Company bookmarking developers
        const userId = currentCard.user_id || currentCard.id  // Prioritize user_id
        console.log('👥 Using user_id:', currentCard.user_id, 'fallback id:', currentCard.id)
        if (bookmarkedDevelopers.has(userId)) {
          alreadyBookmarked = true
        } else {
          await wishlistAPI.addToWishlist(null, userId)
          setBookmarkedDevelopers(prev => new Set(prev).add(userId))
          bookmarkSuccess = true
        }
      } else {
        console.error('❌ Invalid bookmark combination:', { cardType, userRole })
        throw new Error('Invalid bookmark combination')
      }

      if (alreadyBookmarked) {
        setLastWishlistAction('already_saved')
        setTimeout(() => setLastWishlistAction(null), 2000)
      } else if (bookmarkSuccess) {
        setLastWishlistAction('saved')
        
        // Remove card from feed after successful bookmark
        setTimeout(() => {
          setLastWishlistAction(null)
          // Move to next card (simulating removal from feed)
          if (onSwipe) {
            onSwipe('bookmark', currentCard)
          }
        }, 1000) // Show feedback for 1 second, then remove
      }
      
    } catch (error) {
      console.error('Failed to add to bookmarks:', error)
      console.error('Error details:', error.validationErrors || error.message)
      setLastWishlistAction('error')
      setTimeout(() => setLastWishlistAction(null), 2000)
    } finally {
      setWishlistLoading(false)
    }
  }



  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Card Stack */}
      <div className="relative h-[600px] flex justify-center items-center">
        {cards.map((card, index) => (
          <TinderCard
            ref={childRefs[index]}
            className="absolute w-full"
            key={card.id}
            onSwipe={(dir) => swiped(dir, card, index)}
            onCardLeftScreen={() => outOfFrame(card, index)}
            preventSwipe={['up', 'down']}
            swipeRequirementType="position"
            swipeThreshold={100}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0.7 }}
              animate={{ 
                scale: index === currentIndex ? 1 : 0.95,
                opacity: index === currentIndex ? 1 : 0.7,
                zIndex: cards.length - index
              }}
              className="w-full h-full cursor-grab active:cursor-grabbing"
            >
              {cardType === 'jobs' ? (
                <JobCard job={card} />
              ) : cardType === 'developers' ? (
                <DeveloperCard developer={card} />
              ) : cardType === 'companies' ? (
                <CompanyCard company={card} />
              ) : (
                // Fallback to role-based logic for backwards compatibility
                userRole === 'developer' ? (
                  <JobCard job={card} />
                ) : (
                  <DeveloperCard developer={card} />
                )
              )}
            </motion.div>
          </TinderCard>
        ))}
        
        {/* Empty State */}
        {cards.length === 0 && (
          <div className="w-full h-full bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No more cards</h3>
              <p className="text-gray-500">Check back later for new matches!</p>
            </div>
          </div>
        )}
      </div>

      {/* Swipe Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center items-center space-x-6 mt-8"
      >
        {/* Pass Button */}
        <button
          onClick={() => swipeCard('left')}
          disabled={!canSwipe}
          className={`w-16 h-16 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
            canSwipe
              ? 'bg-red-500 hover:bg-red-600 text-white hover:scale-110 active:scale-95'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Bookmark Button - Role-specific: Developers save jobs, Companies save developers */}
        {((cardType === 'jobs' && userRole === 'developer') || 
          (cardType === 'developers' && userRole === 'company')) && (
          <button
            onClick={handleAddToBookmark}
            disabled={!canSwipe || wishlistLoading}
            className={`w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
              canSwipe && !wishlistLoading
                ? (cardType === 'jobs' ? wishlistedJobs.has(cards[currentIndex]?.id) : 
                   bookmarkedDevelopers.has(cards[currentIndex]?.user_id || cards[currentIndex]?.id))
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white hover:scale-110 active:scale-95'
                  : 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-110 active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {wishlistLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>
        )}

        {/* Like Button */}
        <button
          onClick={() => swipeCard('right')}
          disabled={!canSwipe}
          className={`w-16 h-16 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
            canSwipe
              ? 'bg-green-500 hover:bg-green-600 text-white hover:scale-110 active:scale-95'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Heart className="w-6 h-6" />
        </button>
      </motion.div>

      {/* Swipe Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center mt-6"
      >
        <p className="text-sm text-gray-500">
          {((cardType === 'jobs' && userRole === 'developer') || 
            (cardType === 'developers' && userRole === 'company'))
            ? 'Swipe left to pass • Bookmark to save • Swipe right to like'
            : 'Swipe left to pass • Swipe right to like'
          }
        </p>
        {(lastDirection || lastWishlistAction) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${
              lastDirection === 'right'
                ? 'bg-green-100 text-green-800'
                : lastDirection === 'left'
                ? 'bg-red-100 text-red-800'
                : lastWishlistAction === 'saved'
                ? 'bg-blue-100 text-blue-800'
                : lastWishlistAction === 'already_saved'
                ? 'bg-yellow-100 text-yellow-800'
                : lastWishlistAction === 'error'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {lastDirection === 'right' ? (
              <>
                <Heart className="w-4 h-4 mr-1" />
                Liked!
              </>
            ) : lastDirection === 'left' ? (
              <>
                <X className="w-4 h-4 mr-1" />
                Passed
              </>
            ) : lastWishlistAction === 'saved' ? (
              <>
                <Bookmark className="w-4 h-4 mr-1" />
                {cardType === 'jobs' ? 'Saved to Wishlist!' : 'Bookmarked!'}
              </>
            ) : lastWishlistAction === 'already_saved' ? (
              <>
                <Bookmark className="w-4 h-4 mr-1" />
                Already Saved
              </>
            ) : lastWishlistAction === 'error' ? (
              <>
                <X className="w-4 h-4 mr-1" />
                Failed to Save
              </>
            ) : null}
          </motion.div>
        )}
      </motion.div>

      {/* Cards Remaining Counter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center mt-4"
      >
        <span className="text-xs text-gray-400">
          {currentIndex + 1} of {cards.length} cards remaining
        </span>
      </motion.div>
    </div>
  )
}

export default SwipeableCards 