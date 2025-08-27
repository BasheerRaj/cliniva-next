import { colors } from "@/lib/colors"

interface SidebarProps {
  className?: string
  currentStep?: number
  currentSubStep?: string
  planType?: 'company' | 'complex' | 'clinic'
}

export function Sidebar({ className, currentStep = 1, currentSubStep = 'overview', planType = 'company' }: SidebarProps) {
  const getStepStatus = (step: number) => {
    if (step < currentStep) return 'completed'
    if (step === currentStep) return 'active'
    return 'inactive'
  }

  const getSubStepStatus = (step: number, subStep: string) => {
    if (step < currentStep) return 'completed'
    if (step === currentStep) {
      if (subStep === currentSubStep) return 'active'
      // For completed substeps in current step, we'd need more logic here
      return 'inactive'
    }
    return 'inactive'
  }

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed': return colors.light.state.success
      case 'active': return colors.light.brand.primary
      default: return colors.light.state.inactive
    }
  }

  const getTextColor = (status: string) => {
    switch (status) {
      case 'completed': return colors.light.state.success
      case 'active': return colors.light.brand.primary
      default: return colors.light.text.secondary
    }
  }

  return (
    <div
      className={`w-80 bg-white border-r p-6 ${className || ""}`}
      style={{ borderColor: colors.light.border.primary }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: colors.light.brand.secondary }}
        >
          <div className="w-4 h-4 bg-white rounded-sm"></div>
        </div>
        <span className="font-semibold text-lg" style={{ color: colors.light.text.primary }}>
          Cliniva SYS
        </span>
      </div>

      {/* Navigation */}
      <div className="space-y-6">
        {/* Fill in Company Details */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: getStepColor(getStepStatus(1)) }}
            >
              {getStepStatus(1) === 'completed' ? '✓' : '1'}
            </div>
            <span className="font-medium" style={{ color: getTextColor(getStepStatus(1)) }}>
              Fill in Company Details
            </span>
          </div>

          <div className="ml-9 space-y-2">
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: getStepColor(getSubStepStatus(1, 'overview')) }}
              ></div>
              <span 
                className="text-sm" 
                style={{ color: getTextColor(getSubStepStatus(1, 'overview')) }}
              >
                Company Overview
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: getStepColor(getSubStepStatus(1, 'contact')) }}
              ></div>
              <span 
                className="text-sm" 
                style={{ color: getTextColor(getSubStepStatus(1, 'contact')) }}
              >
                Contact Details
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: getStepColor(getSubStepStatus(1, 'legal')) }}
              ></div>
              <span 
                className="text-sm" 
                style={{ color: getTextColor(getSubStepStatus(1, 'legal')) }}
              >
                Legal Details
              </span>
            </div>
          </div>
        </div>

        {/* Fill in Complex Details */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: getStepColor(getStepStatus(2)) }}
            >
              {getStepStatus(2) === 'completed' ? '✓' : '2'}
            </div>
            <span className="font-medium" style={{ color: getTextColor(getStepStatus(2)) }}>
              Fill in Complex Details
            </span>
          </div>

          <div className="ml-9 space-y-2">
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: getStepColor(getSubStepStatus(2, 'overview')) }}
              ></div>
              <span 
                className="text-sm" 
                style={{ color: getTextColor(getSubStepStatus(2, 'overview')) }}
              >
                Complex Overview
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: getStepColor(getSubStepStatus(2, 'contact')) }}
              ></div>
              <span 
                className="text-sm" 
                style={{ color: getTextColor(getSubStepStatus(2, 'contact')) }}
              >
                Contact Details
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: getStepColor(getSubStepStatus(2, 'schedule')) }}
              ></div>
              <span 
                className="text-sm" 
                style={{ color: getTextColor(getSubStepStatus(2, 'schedule')) }}
              >
                Working Schedule
              </span>
            </div>
          </div>
        </div>

        {/* Fill in Clinic Details */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: getStepColor(getStepStatus(3)) }}
            >
              {getStepStatus(3) === 'completed' ? '✓' : '3'}
            </div>
            <span className="font-medium" style={{ color: getTextColor(getStepStatus(3)) }}>
              Fill in Clinic Details
            </span>
          </div>

          <div className="ml-9 space-y-2">
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: getStepColor(getSubStepStatus(3, 'overview')) }}
              ></div>
              <span 
                className="text-sm" 
                style={{ color: getTextColor(getSubStepStatus(3, 'overview')) }}
              >
                Clinic Overview
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: getStepColor(getSubStepStatus(3, 'schedule')) }}
              ></div>
              <span 
                className="text-sm" 
                style={{ color: getTextColor(getSubStepStatus(3, 'schedule')) }}
              >
                Working Schedule
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 