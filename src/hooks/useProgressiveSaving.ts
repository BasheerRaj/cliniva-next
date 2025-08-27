// ========================================
// PROGRESSIVE SAVING HOOK
// ========================================
// Auto-saves form data with debouncing and progress tracking

import { useCallback, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { debounce } from 'lodash'

interface ProgressiveSavingOptions {
  stepKey: string
  saveFunction: (data: any) => Promise<any>
  delay?: number // Debounce delay in milliseconds
  onSaveSuccess?: (result: any) => void
  onSaveError?: (error: any) => void
}

export const useProgressiveSaving = ({
  stepKey,
  saveFunction,
  delay = 2000,
  onSaveSuccess,
  onSaveError
}: ProgressiveSavingOptions) => {
  const { update: updateSession } = useSession()
  const saveInProgress = useRef(false)
  const lastSavedData = useRef<string>('')

  // Create debounced save function
  const debouncedSave = useCallback(
    debounce(async (data: any) => {
      // Avoid saving if already in progress or data hasn't changed
      if (saveInProgress.current) {
        console.log('🔄 Save already in progress, skipping...')
        return
      }

      const dataString = JSON.stringify(data)
      if (dataString === lastSavedData.current) {
        console.log('📊 No changes detected, skipping save...')
        return
      }

      try {
        saveInProgress.current = true
        console.log(`💾 Auto-saving ${stepKey}:`, data)

        const result = await saveFunction(data)
        
        // Update last saved data
        lastSavedData.current = dataString
        
        // Update session progress
        await updateSession({
          onboardingProgress: [stepKey + '-autosaved']
        })

        console.log(`✅ Auto-saved ${stepKey} successfully`)
        onSaveSuccess?.(result)

      } catch (error) {
        console.error(`❌ Failed to auto-save ${stepKey}:`, error)
        onSaveError?.(error)
      } finally {
        saveInProgress.current = false
      }
    }, delay),
    [stepKey, saveFunction, delay, onSaveSuccess, onSaveError, updateSession]
  )

  // Auto-save function to be called when form data changes
  const autoSave = useCallback((data: any) => {
    // Skip if data is empty or invalid
    if (!data || Object.keys(data).length === 0) {
      return
    }

    // Skip if required fields are missing
    if (stepKey.includes('overview') && !data.name) {
      console.log('📋 Skipping auto-save: required fields missing')
      return
    }

    debouncedSave(data)
  }, [debouncedSave, stepKey])

  // Manual save function (immediate, no debouncing)
  const saveNow = useCallback(async (data: any) => {
    try {
      saveInProgress.current = true
      console.log(`💾 Manual save ${stepKey}:`, data)

      const result = await saveFunction(data)
      
      // Update last saved data
      lastSavedData.current = JSON.stringify(data)
      
      // Update session progress
      await updateSession({
        onboardingProgress: [stepKey + '-saved']
      })

      console.log(`✅ Manual save ${stepKey} successful`)
      onSaveSuccess?.(result)
      
      return result
    } catch (error) {
      console.error(`❌ Failed to manual save ${stepKey}:`, error)
      onSaveError?.(error)
      throw error
    } finally {
      saveInProgress.current = false
    }
  }, [stepKey, saveFunction, onSaveSuccess, onSaveError, updateSession])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel()
    }
  }, [debouncedSave])

  return {
    autoSave,
    saveNow,
    isSaving: saveInProgress.current
  }
}

// ========================================
// SPECIALIZED HOOKS FOR EACH STEP
// ========================================

import { 
  saveOrganizationOverview,
  saveOrganizationContact,
  saveOrganizationLegal
} from '@/api/onboardingApiClient'

export const useOrganizationOverviewSaving = () => {
  return useProgressiveSaving({
    stepKey: 'organization-overview',
    saveFunction: saveOrganizationOverview,
    onSaveSuccess: (result) => {
      console.log('🏢 Organization overview auto-saved')
    },
    onSaveError: (error) => {
      console.error('❌ Organization overview auto-save failed')
    }
  })
}

export const useOrganizationContactSaving = () => {
  return useProgressiveSaving({
    stepKey: 'organization-contact',
    saveFunction: saveOrganizationContact,
    onSaveSuccess: (result) => {
      console.log('📞 Organization contact auto-saved')
    },
    onSaveError: (error) => {
      console.error('❌ Organization contact auto-save failed')
    }
  })
}

export const useOrganizationLegalSaving = () => {
  return useProgressiveSaving({
    stepKey: 'organization-legal',
    saveFunction: saveOrganizationLegal,
    onSaveSuccess: (result) => {
      console.log('⚖️ Organization legal auto-saved')
    },
    onSaveError: (error) => {
      console.error('❌ Organization legal auto-save failed')
    }
  })
} 