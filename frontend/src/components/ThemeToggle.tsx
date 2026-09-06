import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme, Theme } from '../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
    {
      value: 'light',
      label: 'Warm Paper (Light)',
      icon: <Sun className="w-4 h-4" />,
    },
    {
      value: 'system',
      label: 'System Theme',
      icon: <Laptop className="w-4 h-4" />,
    },
    {
      value: 'dark',
      label: 'Chalkboard (Dark)',
      icon: <Moon className="w-4 h-4" />,
    },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Theme preference selector"
      className="inline-flex items-center p-1 rounded-wobbly bg-studio-surface border-2 border-studio-border shadow-sketch-xs transition-colors"
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
            className={`relative min-w-[44px] min-h-[44px] p-2 rounded-wobbly transition-all duration-150 flex items-center justify-center cursor-pointer ${
              isSelected
                ? 'bg-studio-red text-white shadow-sketch-xs scale-105 border-2 border-studio-border'
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
