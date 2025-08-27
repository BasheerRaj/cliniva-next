'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { SkipForward } from 'lucide-react'
import { toast } from 'sonner'

interface SkipButtonProps {
  variant?: 'outline' | 'ghost' | 'secondary'
  size?: 'sm' | 'default' | 'lg'
  className?: string
  onSkip?: () => void
}

export function SkipButton({
  variant = 'outline',
  size = 'sm',
  className = '',
  onSkip
}: SkipButtonProps) {
  const [isSkipping, setIsSkipping] = useState(false)
  const router = useRouter()

  const handleSkip = async () => {
    if (isSkipping) return
    
    setIsSkipping(true)
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token')
      
      if (!token) {
        // If no token, just redirect directly (user not authenticated yet)
        toast.success('Redirecting to dashboard...')
        onSkip?.()
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
        return
      }
      
      // Call the backend skip endpoint
      const response = await fetch('/api/onboarding/skip-to-dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message || 'Redirecting to dashboard...')
        
        // Call the onSkip callback if provided
        onSkip?.()
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      } else {
        throw new Error(data.message || 'Failed to skip')
      }
    } catch (error: any) {
      console.error('Skip failed:', error)
      toast.error(error.message || 'Failed to skip. Please try again.')
    } finally {
      setIsSkipping(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSkip}
      disabled={isSkipping}
      className={`gap-2 ${className}`}
    >
      <SkipForward className="h-4 w-4" />
      {isSkipping ? 'Skipping...' : 'Skip to Dashboard'}
    </Button>
  )
}

export default SkipButton 