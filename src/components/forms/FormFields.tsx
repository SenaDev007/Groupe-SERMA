"use client";

import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";
import { AlertCircle, Check } from "lucide-react";

interface LabelProps {
  htmlFor?: string;
  children: React.ReactNode;
  required?: boolean;
}

export function Label({ htmlFor, children, required }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-[10px] sm:text-[11px] uppercase tracking-[0.08em] font-semibold text-slate-400 mb-2"
    >
      {children}
      {required && <span className="text-orange ml-1" aria-hidden="true">*</span>}
    </label>
  );
}

interface FieldWrapperProps {
  error?: string;
  children: React.ReactNode;
}

export function FieldWrapper({ error, children }: FieldWrapperProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {children}
      {error && (
        <p role="alert" className="text-red-400 text-[11px] flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        {...props}
        className={`
          w-full px-4 py-3.5 rounded-xl
          bg-navy-dark text-white
          text-base sm:text-sm
          placeholder:text-slate-600
          border transition-all duration-200
          focus:outline-none
          ${
            error
              ? "border-red-500/50 focus:border-red-400 focus:ring-1 focus:ring-red-400/20"
              : "border-white/[0.07] focus:border-orange/50 focus:ring-1 focus:ring-orange/15"
          }
          ${className}
        `}
      />
    );
  }
);
Input.displayName = "Input";

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ error, className = "", ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        {...props}
        className={`
          w-full px-4 py-3.5 rounded-xl
          bg-navy-dark text-white
          text-base sm:text-sm
          placeholder:text-slate-600
          border transition-all duration-200
          min-h-[120px] sm:min-h-[130px]
          focus:outline-none
          ${
            error
              ? "border-red-500/50 focus:border-red-400 focus:ring-1 focus:ring-red-400/20"
              : "border-white/[0.07] focus:border-orange/50 focus:ring-1 focus:ring-orange/15"
          }
          ${className}
        `}
      />
    );
  }
);
Textarea.displayName = "Textarea";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, options, placeholder, className = "", ...props }, ref) => {
    return (
      <select
        ref={ref}
        {...props}
        className={`
          w-full px-4 py-3.5 rounded-xl
          bg-navy-dark border text-white
          text-base sm:text-sm
          transition-all duration-200
          focus:outline-none
          ${
            error
              ? "border-red-500/50 focus:border-red-400 focus:ring-1 focus:ring-red-400/20"
              : "border-white/[0.07] focus:border-orange/50 focus:ring-1 focus:ring-orange/15"
          }
          ${className}
        `}
      >
        {placeholder && (
          <option value="" className="bg-navy-light text-slate-400">
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            className="bg-navy-light text-white"
          >
            {opt.label}
          </option>
        ))}
      </select>
    );
  }
);
Select.displayName = "Select";

interface RadioGroupProps {
  name: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  error?: string;
}

export function RadioGroup({ name, options, value, onChange, error }: RadioGroupProps) {
  return (
    <FieldWrapper error={error}>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <label
            key={opt}
            className={`
              inline-flex items-center gap-2 px-3.5 py-2.5
              rounded-xl border cursor-pointer
              text-xs sm:text-sm font-medium
              transition-all duration-200 select-none
              min-h-[44px]
              ${
                value === opt
                  ? "border-orange/60 bg-orange/[0.08] text-orange"
                  : "border-white/[0.07] text-slate-400 hover:border-white/20 hover:text-slate-200 bg-navy-dark"
              }
            `}
          >
            <input
              type="radio"
              name={name}
              value={opt}
              checked={value === opt}
              onChange={() => onChange(opt)}
              className="sr-only"
              aria-label={opt}
            />
            <span
              className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                ${value === opt ? "border-orange" : "border-slate-600"}`}
              aria-hidden="true"
            >
              {value === opt && <span className="w-1.5 h-1.5 rounded-full bg-orange block" />}
            </span>
            <span className="leading-snug">{opt}</span>
          </label>
        ))}
      </div>
    </FieldWrapper>
  );
}

interface CheckboxProps {
  id: string;
  label: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
}

export function Checkbox({ id, label, checked, onChange, error }: CheckboxProps) {
  return (
    <FieldWrapper error={error}>
      <label htmlFor={id} className="flex items-start gap-3 cursor-pointer group min-h-[44px] py-1">
        <div
          className={`
            mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0
            transition-all duration-200
            ${checked ? "bg-orange border-orange" : "border-white/20 group-hover:border-orange/50"}
          `}
          aria-hidden="true"
        >
          {checked && <Check className="w-3 h-3 text-navy-dark" strokeWidth={3} />}
        </div>
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <span className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-0.5">
          {label}
        </span>
      </label>
    </FieldWrapper>
  );
}
