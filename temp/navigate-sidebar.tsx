import { colors } from "@/lib/colors"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
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
              style={{ backgroundColor: colors.light.brand.primary }}
            >
              1
            </div>
            <span className="font-medium" style={{ color: colors.light.brand.primary }}>
              Fill in Company Details
            </span>
          </div>

          <div className="ml-9 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.light.brand.primary }}></div>
              <span className="text-sm" style={{ color: colors.light.brand.primary }}>
                Company Overview
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.light.state.inactive }}></div>
              <span className="text-sm" style={{ color: colors.light.text.secondary }}>
                Contact Details
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.light.state.inactive }}></div>
              <span className="text-sm" style={{ color: colors.light.text.secondary }}>
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
              style={{ backgroundColor: colors.light.state.inactive }}
            >
              2
            </div>
            <span className="font-medium" style={{ color: colors.light.text.secondary }}>
              Fill in Complex Details
            </span>
          </div>

          <div className="ml-9 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.light.state.inactive }}></div>
              <span className="text-sm" style={{ color: colors.light.text.secondary }}>
                Complex Overview
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.light.state.inactive }}></div>
              <span className="text-sm" style={{ color: colors.light.text.secondary }}>
                Contact Details
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.light.state.inactive }}></div>
              <span className="text-sm" style={{ color: colors.light.text.secondary }}>
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
              style={{ backgroundColor: colors.light.state.inactive }}
            >
              3
            </div>
            <span className="font-medium" style={{ color: colors.light.text.secondary }}>
              Fill in Clinic Details
            </span>
          </div>

          <div className="ml-9 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.light.state.inactive }}></div>
              <span className="text-sm" style={{ color: colors.light.text.secondary }}>
                Clinic Overview
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.light.state.inactive }}></div>
              <span className="text-sm" style={{ color: colors.light.text.secondary }}>
                Working Schedule
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
