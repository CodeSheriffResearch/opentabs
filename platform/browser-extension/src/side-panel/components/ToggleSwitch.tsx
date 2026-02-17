const ToggleSwitch = ({
  enabled,
  indeterminate,
  onClick,
  ariaLabel,
}: {
  enabled: boolean;
  indeterminate?: boolean;
  onClick: (e: React.MouseEvent) => void;
  ariaLabel: string;
}) => (
  <button
    role="switch"
    aria-checked={indeterminate ? 'mixed' : enabled}
    aria-label={ariaLabel}
    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
      enabled ? 'bg-amber-500' : indeterminate ? 'bg-amber-500/40' : 'bg-gray-700'
    }`}
    onClick={onClick}>
    <span
      className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
        enabled ? 'translate-x-[18px]' : indeterminate ? 'translate-x-[10px]' : 'translate-x-[3px]'
      }`}
    />
  </button>
);

export { ToggleSwitch };
