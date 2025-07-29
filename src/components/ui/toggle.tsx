import * as React from "react";

interface ToggleProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Toggle: React.FC<ToggleProps> = ({ label, checked, onChange, ...props }) => (
  <label className="flex items-center cursor-pointer gap-2 select-none">
    <span className="font-medium text-sm text-gray-700 dark:text-gray-300">{label}</span>
    <span className="relative inline-block w-10 h-6">
      <input
        type="checkbox"
        className="opacity-0 w-0 h-0 peer"
        checked={checked}
        onChange={onChange}
        {...props}
      />
      <span className="absolute left-0 top-0 w-10 h-6 rounded-full bg-gray-300 peer-checked:bg-primary transition-colors" />
      <span className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow peer-checked:translate-x-4 transition-transform" />
    </span>
  </label>
);
