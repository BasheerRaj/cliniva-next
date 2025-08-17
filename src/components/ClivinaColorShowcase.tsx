/**
 * Cliniva Color Showcase Component
 * Demonstrates the complete color system and ready for shadcn/ui integration
 */

import { clinivaColors, clinivaClasses } from '@/lib/colors';

export default function ClivinaColorShowcase() {
  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-blue-50 via-white to-blue-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-cliniva-primary mb-2">
            Cliniva Design System
          </h1>
          <p className="text-muted-foreground">
            Complete color palette and component examples
          </p>
        </div>

        {/* Primary Colors */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-cliniva-primary">Primary Colors</h3>
            <p className="text-muted-foreground mt-1">
              Main Cliniva brand colors for primary actions and brand elements
            </p>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="w-full h-16 bg-cliniva-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold">Primary</span>
                </div>
                <p className="text-sm text-muted-foreground">{clinivaColors.primary.DEFAULT}</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-16 bg-cliniva-primary-light rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold">Primary Light</span>
                </div>
                <p className="text-sm text-muted-foreground">{clinivaColors.primary.light}</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-16 bg-cliniva-primary-dark rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold">Primary Dark</span>
                </div>
                <p className="text-sm text-muted-foreground">{clinivaColors.primary.dark}</p>
              </div>
            </div>

            {/* Button Examples */}
            <div className="space-y-2">
              <h4 className="font-medium">Button Examples:</h4>
              <div className="flex flex-wrap gap-2">
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-cliniva-primary-dark transition-colors">
                  Primary Button
                </button>
                <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md font-medium hover:bg-cliniva-secondary-dark transition-colors">
                  Secondary Button
                </button>
                <button className="border border-primary text-primary px-4 py-2 rounded-md font-medium hover:bg-primary hover:text-white transition-colors">
                  Outline Button
                </button>
                <button className="text-primary px-4 py-2 rounded-md font-medium hover:bg-primary/10 transition-colors">
                  Ghost Button
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Semantic Colors */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-cliniva-primary">Semantic Colors</h3>
            <p className="text-muted-foreground mt-1">
              Colors for different states and message types
            </p>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="w-full h-16 bg-cliniva-success rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold">Success</span>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cliniva-success text-white">
                  Success Badge
                </span>
                <p className="text-sm text-muted-foreground">{clinivaColors.success.DEFAULT}</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-16 bg-destructive rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold">Error</span>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive text-white">
                  Error Badge
                </span>
                <p className="text-sm text-muted-foreground">{clinivaColors.error.DEFAULT}</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-16 bg-cliniva-warning rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold">Warning</span>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cliniva-warning text-white">
                  Warning Badge
                </span>
                <p className="text-sm text-muted-foreground">{clinivaColors.warning.DEFAULT}</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-16 bg-cliniva-info rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold">Info</span>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cliniva-info text-white">
                  Info Badge
                </span>
                <p className="text-sm text-muted-foreground">{clinivaColors.info.DEFAULT}</p>
              </div>
            </div>

            {/* Alert Examples */}
            <div className="space-y-3">
              <h4 className="font-medium">Alert Examples:</h4>
              <div className="border-l-4 border-cliniva-success bg-cliniva-success/10 p-4 rounded">
                <p className="text-cliniva-success font-medium">
                  ✅ Patient registration completed successfully!
                </p>
              </div>
              <div className="border-l-4 border-destructive bg-red-50 p-4 rounded">
                <p className="text-destructive font-medium">
                  ❌ Error: Unable to save patient information. Please try again.
                </p>
              </div>
              <div className="border-l-4 border-cliniva-warning bg-yellow-50 p-4 rounded">
                <p className="text-cliniva-warning font-medium">
                  ⚠️ Warning: Appointment time conflicts with existing booking.
                </p>
              </div>
              <div className="border-l-4 border-cliniva-info bg-blue-50 p-4 rounded">
                <p className="text-cliniva-info font-medium">
                  ℹ️ Info: New features are available in the latest update.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Components */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-cliniva-primary">Form Components</h3>
            <p className="text-muted-foreground mt-1">
              Input fields and form elements with different states
            </p>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Default Input</label>
                <input 
                  type="text"
                  placeholder="Enter patient name..."
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Primary Focus Input</label>
                <input 
                  type="text"
                  placeholder="Cliniva branded focus..." 
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-cliniva-primary focus:border-cliniva-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-cliniva-success">Success Input</label>
                <input 
                  type="text"
                  placeholder="Valid input..." 
                  className="w-full px-3 py-2 border border-cliniva-success rounded-md focus:outline-none focus:ring-2 focus:ring-cliniva-success"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-destructive">Error Input</label>
                <input 
                  type="text"
                  placeholder="Invalid input..." 
                  className="w-full px-3 py-2 border border-destructive rounded-md focus:outline-none focus:ring-2 focus:ring-destructive"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Gray Scale */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-cliniva-primary">Gray Scale</h3>
            <p className="text-muted-foreground mt-1">
              Complete neutral color palette for backgrounds and text
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {Object.entries(clinivaColors.neutral)
                .filter(([key]) => !isNaN(Number(key)))
                .map(([shade, color]) => (
                <div key={shade} className="space-y-1">
                  <div 
                    className="w-full h-12 rounded flex items-center justify-center text-xs font-medium"
                    style={{ 
                      backgroundColor: color,
                      color: Number(shade) >= 500 ? '#ffffff' : '#000000'
                    }}
                  >
                    {shade}
                  </div>
                  <p className="text-xs text-center text-muted-foreground">{color}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Real-world Examples */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-cliniva-primary">Real-world Examples</h3>
            <p className="text-muted-foreground mt-1">
              How these colors look in actual healthcare UI components
            </p>
          </div>
          <div className="p-6 space-y-6">
            
            {/* Patient Card Example */}
            <div className="space-y-2">
              <h4 className="font-medium">Patient Information Card:</h4>
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold">John Doe</h4>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cliniva-success text-white">
                    Active
                  </span>
                </div>
                <p className="text-muted-foreground text-sm mb-4">Patient ID: #12345</p>
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-muted-foreground">Age:</span>
                    <span className="ml-2 font-medium">32</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Visit:</span>
                    <span className="ml-2 font-medium">Dec 15, 2024</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-cliniva-primary-dark transition-colors">
                    View Details
                  </button>
                  <button className="border border-primary text-primary px-4 py-2 rounded-md text-sm font-medium hover:bg-primary hover:text-white transition-colors">
                    Schedule
                  </button>
                </div>
              </div>
            </div>

            {/* Dashboard Stats Example */}
            <div className="space-y-2">
              <h4 className="font-medium">Dashboard Statistics:</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                  <div className="text-2xl font-bold text-cliniva-primary">248</div>
                  <p className="text-sm text-muted-foreground">Total Patients</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                  <div className="text-2xl font-bold text-cliniva-success">15</div>
                  <p className="text-sm text-muted-foreground">Today's Appointments</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                  <div className="text-2xl font-bold text-cliniva-warning">3</div>
                  <p className="text-sm text-muted-foreground">Pending Reviews</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                  <div className="text-2xl font-bold text-muted-foreground">92%</div>
                  <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Guide */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-cliniva-primary">How to Use These Colors</h3>
            <p className="text-muted-foreground mt-1">
              Copy these patterns for consistent styling
            </p>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium mb-2">Tailwind CSS Classes:</h5>
              <div className="text-sm text-gray-700 space-y-1">
                <div><code className="bg-gray-200 px-2 py-1 rounded">bg-primary</code> - Main Cliniva blue background</div>
                <div><code className="bg-gray-200 px-2 py-1 rounded">text-cliniva-primary</code> - Cliniva blue text</div>
                <div><code className="bg-gray-200 px-2 py-1 rounded">border-primary</code> - Primary blue border</div>
                <div><code className="bg-gray-200 px-2 py-1 rounded">ring-ring</code> - Focus ring color</div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium mb-2">CSS Variables:</h5>
              <div className="text-sm text-gray-700 space-y-1">
                <div><code className="bg-gray-200 px-2 py-1 rounded">var(--primary)</code> - Primary color</div>
                <div><code className="bg-gray-200 px-2 py-1 rounded">var(--cliniva-primary)</code> - Direct Cliniva blue</div>
                <div><code className="bg-gray-200 px-2 py-1 rounded">var(--destructive)</code> - Error/danger color</div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium mb-2">TypeScript Import:</h5>
              <pre className="text-sm text-gray-700 overflow-x-auto">
{`import { clinivaColors } from '@/lib/colors';

// Use in your components
const primaryColor = clinivaColors.primary.DEFAULT; // #69a3e9`}
              </pre>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Type-safe color usage examples
export const colorExamples = {
  // Using imported colors
  primaryBg: clinivaColors.primary.DEFAULT,
  successText: clinivaColors.success.DEFAULT,
  
  // Using predefined classes
  buttonPrimary: clinivaClasses.button.primary,
  textBrand: clinivaClasses.text.brand,
} as const;