import React from 'react';
import { Glass } from 'glisse';

export interface FilterBarItem {
  value: string;
  label: string;
}

export interface FilterBarProps {
  items: FilterBarItem[];
  value: string;
  onValueChange: (value: string) => void;
  'aria-label': string;
  className?: string;
}

export function FilterBar({
  items,
  value,
  onValueChange,
  'aria-label': ariaLabel,
  className,
}: FilterBarProps) {
  const selectedIndex = items.findIndex((item) => item.value === value);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (items.length === 0) return;
    const buttons = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]')
    );
    const currentIndex = buttons.findIndex(
      (btn) => btn === document.activeElement
    );
    if (currentIndex === -1) return;

    let nextIndex: number | null = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % items.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + items.length) % items.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = items.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      const targetItem = items[nextIndex];
      if (targetItem) {
        onValueChange(targetItem.value);
      }
      buttons[nextIndex]?.focus();
    }
  };

  return (
    <Glass
      role="radiogroup"
      aria-label={ariaLabel}
      className={`lg-segmented filter-bar${className ? ` ${className}` : ''}`}
      style={{ borderRadius: 'var(--radius-lg)' }}
      onKeyDown={handleKeyDown}
    >
      {items.map((item, index) => {
        const isSelected = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            data-selected={isSelected ? '' : undefined}
            tabIndex={
              isSelected || (selectedIndex < 0 && index === 0) ? 0 : -1
            }
            className={`filter-pill${isSelected ? ' is-selected' : ''}`}
            onClick={() => onValueChange(item.value)}
          >
            {item.label}
          </button>
        );
      })}
    </Glass>
  );
}
