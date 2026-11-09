import type { ReactNode } from 'react';

interface LabeledSwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  icon?: ReactNode;
  compact?: boolean;
  className?: string;
}

export function LabeledSwitch({
  checked,
  onChange,
  label,
  icon,
  compact = false,
  className = '',
}: LabeledSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`labeled-switch${compact ? ' labeled-switch--compact' : ''} ${className}`.trim()}
      onClick={() => onChange(!checked)}
    >
      {icon ? <span className="labeled-switch__icon">{icon}</span> : null}
      <span className="labeled-switch__label">{label}</span>
      <span className="switch-track" aria-hidden="true">
        <span className="switch-thumb" />
      </span>
    </button>
  );
}
