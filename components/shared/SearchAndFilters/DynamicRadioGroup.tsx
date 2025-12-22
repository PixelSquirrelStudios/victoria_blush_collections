// src/components/shared/Forms/DynamicRadioGroup.tsx
'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

/**
 * Defines the shape for a single radio button option.
 */
export interface RadioOption {
  value: string;
  id: string; // Should be unique, often the same as value
  label: string;
}

/**
 * Props for the DynamicRadioGroup component.
 */
interface DynamicRadioGroupProps {
  title: string;
  options: RadioOption[];
  defaultValue?: string;
  value?: string; // The currently selected value (for controlled components)
  onValueChange: (value: string) => void; // Callback when the value changes
  orientation?: 'horizontal' | 'vertical'; // Optional layout orientation
}

/**
 * A reusable and dynamic radio group component that accepts a title and an array of options.
 */
const DynamicRadioGroup = ({
  title,
  options,
  defaultValue,
  value,
  onValueChange,
  orientation = 'horizontal',
}: DynamicRadioGroupProps) => {
  const layoutClasses =
    orientation === 'horizontal'
      ? 'flex-col md:flex-row' // Stacks on small screens, row on medium+
      : 'flex-col'; // Always stacks vertically

  return (
    <div className="my-2 flex flex-col items-start gap-4 text-text-primary xl:flex-row xl:items-center">
      <div className="font-semibold">{title}</div>
      <RadioGroup
        defaultValue={defaultValue}
        value={value}
        onValueChange={onValueChange}
        className="flex"
      >
        <div className={`flex flex-row flex-wrap gap-x-4 gap-y-2 ${layoutClasses}`}>
          {/* Map over the dynamic options array to render each radio item */}
          {options.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={option.id} />
              <Label htmlFor={option.id} className="cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
};

export default DynamicRadioGroup;