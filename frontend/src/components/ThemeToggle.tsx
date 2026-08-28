import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme, Theme } from '../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
    {
      value: 'light',
      label: 'Light Mode',
      icon: <Sun className="w-3.5 h-3.5" />,
    },
    {
      value: 'system',
      label: 'System Theme',
      icon: <Laptop className="w-3.5 h-3.5" />,
    },
    {
      value: 'dark',
      label: 'Dark Mode',
      icon: <Moon className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Theme preference selector"
      className="inline-flex items-center p-1 rounded-full bg-studio-surface border-2 border-studio-border shadow-pop-xs transition-colors"
    >
      {options.map((opt) => {
        const isSelected = theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={opt.label}
            title={opt.label}
            onClick={() => setTheme(opt.value)}
            className={`relative p-1.5 rounded-full transition-all duration-200 flex items-center justify-center ${
              isSelected
                ? 'bg-[#8B5CF6] text-white shadow-pop-xs scale-105'
                : 'text-studio-muted hover:text-studio-text hover:bg-studio-hover'
            }`}
          >
            {opt.icon}
          </button>
        );
      })}
    </div>
  );
};
