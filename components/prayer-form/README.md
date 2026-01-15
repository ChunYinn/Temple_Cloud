# Prayer Form Component Structure
台灣寺廟線上祈福申請表 - 元件架構

## Component File Structure

```
components/prayer-form/
├── PrayerForm.tsx                 # Main form container with stepper
├── steps/
│   ├── Step1ServiceSelection.tsx  # Service selection (multi-select)
│   ├── Step2ApplicantInfo.tsx    # Applicant information
│   ├── Step3ShippingInfo.tsx     # Shipping information
│   ├── Step4BlessingEntries.tsx  # Blessing entries per service
│   └── Step5Review.tsx           # Review and confirm
├── components/
│   ├── ServiceCard.tsx           # Individual service display card
│   ├── BlessingEntryForm.tsx     # Single blessing entry form
│   ├── AddressForm.tsx           # Reusable address form component
│   ├── BirthDateInput.tsx        # Birth date with calendar type selector
│   ├── DonationSection.tsx       # Optional donation component
│   └── PaymentSection.tsx        # Disabled payment methods display
├── ui/
│   ├── Stepper.tsx               # Step indicator component
│   ├── FormField.tsx             # Reusable form field wrapper
│   └── PrintButton.tsx           # Print-friendly review button
└── hooks/
    ├── usePrayerForm.tsx         # Form state management hook
    └── useFormValidation.tsx     # Validation logic hook

```

## Main Components Implementation Outline

### 1. PrayerForm.tsx (Main Container)
```tsx
// Main stepper form container
// Manages overall form state and step navigation
// Mobile-optimized layout

import { useState } from 'react';
import { PrayerFormState } from '@/lib/prayer-form/types';
import { createInitialFormState } from '@/lib/prayer-form/helpers';

export function PrayerForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formState, setFormState] = useState<PrayerFormState>(createInitialFormState());

  // Step validation before proceeding
  // Step navigation handlers
  // Render current step component
  // Show stepper indicator
}
```

### 2. Step1ServiceSelection.tsx
```tsx
// Multi-select service cards
// Display service info with icon, price, description
// Update selectedServices in state

export function Step1ServiceSelection({
  selectedServices,
  onServicesChange
}: Step1Props) {
  // Render service cards from PRAYER_SERVICES
  // Handle multi-selection
  // Show selected state visually
}
```

### 3. Step2ApplicantInfo.tsx
```tsx
// Applicant form fields
// Name, mobile (Taiwan format), email (optional)
// Validation on blur and submit

export function Step2ApplicantInfo({
  applicant,
  onApplicantChange
}: Step2Props) {
  // Input fields with validation
  // Mobile format helper text
  // Email optional indicator
}
```

### 4. Step3ShippingInfo.tsx
```tsx
// Shipping option selection
// Same as applicant toggle
// Conditional address fields

export function Step3ShippingInfo({
  shipping,
  applicant,
  onShippingChange
}: Step3Props) {
  // Radio buttons for shipping options
  // Toggle for same as applicant
  // Conditional rendering of address forms
  // Domestic vs overseas address switch
}
```

### 5. Step4BlessingEntries.tsx
```tsx
// Dynamic blessing entries per service
// Add/remove entry buttons
// Special handling for 月老 notes

export function Step4BlessingEntries({
  serviceSelections,
  onSelectionsChange
}: Step4Props) {
  // Render sections per selected service
  // Each section has 1+ blessing entries
  // Add entry button per service
  // Remove entry button (min 1)
  // BirthDateInput component usage
  // Address selection per entry
}
```

### 6. Step5Review.tsx
```tsx
// Print-friendly review layout
// Show all entries formatted
// Display totals
// Disabled payment section

export function Step5Review({
  formState,
  onConfirm
}: Step5Props) {
  // Format all data for review
  // Print-friendly CSS classes
  // Totals calculation display
  // Payment methods (disabled state)
  // Confirm button
}
```

## Key Features Implementation

### Mobile-First Design
- Full width forms on mobile
- Touch-friendly input sizes
- Appropriate keyboard types for inputs
- Smooth step transitions

### Validation Strategy
- Step-by-step validation
- Real-time field validation
- Clear error messages in Chinese
- Prevent navigation with errors

### State Management
- Single source of truth in PrayerForm
- Props drilling for simplicity
- Optional: useContext for deep nesting

### Print Layout (Step 5)
```css
@media print {
  /* Hide navigation elements */
  /* Format for A4 paper */
  /* Black and white friendly */
  /* Page break control */
}
```

## Usage Example

```tsx
// In your page component
import { PrayerForm } from '@/components/prayer-form/PrayerForm';

export default function PrayerPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-center mb-8">
          線上祈福申請
        </h1>
        <PrayerForm />
      </div>
    </div>
  );
}
```

## Styling Guidelines

- Use Tailwind CSS classes
- Temple-appropriate colors (reds, golds, stone)
- Clear visual hierarchy
- Accessible contrast ratios
- Loading states for async operations

## Testing Considerations

1. Form validation edge cases
2. Step navigation flow
3. Mobile keyboard behavior
4. Print layout rendering
5. Data persistence between steps
6. Error recovery scenarios

## Future Enhancements

1. Save draft functionality
2. Payment integration activation
3. Email confirmation
4. QR code for order tracking
5. Multi-language support
6. Accessibility improvements (ARIA)