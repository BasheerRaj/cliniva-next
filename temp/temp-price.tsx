import { Check, ArrowRight } from "lucide-react"

export default function OperationalStructure() {
  const plans = [
    {
      title: "Company Plan",
      description: "Manage a network of multiple medical complexes, each with its own departments and clinics",
      features: ["Centralized admin and reporting", "Multi-location support", "Role hierarchy across all levels"],
    },
    {
      title: "Complex Plan",
      description: "Manage a single complex that contains various departments and clinics under one roof",
      features: ["Localized administration", "Department-based control", "Full visibility over all clinics"],
    },
    {
      title: "Single Clinic Plan",
      description: "A simplified setup for managing one independent clinic with no additional branches or departments",
      features: ["Minimal setup", "Quick onboarding", "Direct management by the clinic owner or manager"],
    },
  ]

  return (
    <div className="min-h-screen bg-[#fafaf8] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-48 h-48 opacity-30">
        <div className="w-full h-full bg-[#e2f6ec] rounded-br-full transform -translate-x-12 -translate-y-12"></div>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 opacity-30">
        <div className="w-full h-full bg-[#e1edfb] rounded-bl-full transform translate-x-8 -translate-y-8"></div>
      </div>

      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[#69a3e9] mb-6">Choose Your Operational Structure</h1>
          <p className="text-[#717680] text-lg max-w-2xl mx-auto">
            This structure will help us customize your system. You can't change it later
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div key={index} className="bg-[#ffffff] rounded-2xl border-2 border-[#00b48d] p-8 flex flex-col h-full">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-[#414651] mb-4">{plan.title}</h2>
                <p className="text-[#717680] mb-8 leading-relaxed">{plan.description}</p>

                <div className="border-t border-[#e2f6ec] pt-6 mb-8">
                  <ul className="space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 bg-[#00b48d] rounded-full flex items-center justify-center mt-0.5">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-[#5a5a5a] leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button className="w-full bg-[#00b48d] hover:bg-[#00a080] text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2">
                Choose this plan
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
