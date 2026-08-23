import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  required?: boolean;
}

export const ModalLabel: React.FC<LabelProps> = ({ children, required, ...props }) => (
  <label 
    className="block text-md font-medium text-gray-700 mb-2" 
    {...props}
  >
    {children} {required && <span className="text-red-600">*</span>}
  </label>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const ModalInput: React.FC<InputProps> = (props) => (
  <input
    {...props}
    className={`w-full border border-gray-300 rounded-lg px-3 py-2 ${props.className || ''}`}
  />
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const ModalSelect: React.FC<SelectProps> = (props) => (
  <select
    {...props}
    className={`w-full border border-gray-300 rounded-lg px-3 py-2 ${props.className || ''}`}
  >
    {props.children}
  </select>
);

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const ModalCheckbox: React.FC<CheckboxProps> = (props) => (
  <input
    type="checkbox"
    {...props}
    className={`h-4 w-4 border-gray-300 rounded ${props.className || ''}`}
  />
);

interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const ModalRadio: React.FC<RadioProps> = ({ label, id, className, ...props }) => (
  <div className="flex items-center">
    <input
      type="radio"
      id={id}
      {...props}
      className={`h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 ${className || ''}`}
    />
    <label htmlFor={id} className="ml-2 text-md font-medium text-gray-700 cursor-pointer">
      {label}
    </label>
  </div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export const ModalButton: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'secondary', 
  ...props 
}) => {
  const baseStyle = "px-4 py-2 rounded-lg transition-colors duration-150";
  const primaryStyle = "bg-blue-600 hover:bg-blue-700 text-white";
  const secondaryStyle = "border hover:bg-gray-50 text-gray-800";

  return (
    <button
      {...props}
      className={`${baseStyle} ${variant === 'primary' ? primaryStyle : secondaryStyle} ${props.className || ''}`}
    >
      {children}
    </button>
  );
};