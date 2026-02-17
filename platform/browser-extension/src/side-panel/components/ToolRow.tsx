import { ToggleSwitch } from './ToggleSwitch.js';

const ToolRow = ({
  name,
  description,
  enabled,
  active,
  onToggle,
}: {
  name: string;
  description: string;
  enabled: boolean;
  active: boolean;
  onToggle: () => void;
}) => (
  <div
    className={`flex items-center justify-between px-3 py-2 pl-10 transition-colors hover:bg-gray-800/20 ${active ? 'animate-tool-pulse bg-amber-500/5' : ''}`}>
    <div className="flex min-w-0 items-center gap-2 pr-3">
      {active && (
        <div className="h-3 w-3 shrink-0">
          <div className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-gray-600 border-t-amber-400" />
        </div>
      )}
      <div className="min-w-0">
        <div className="truncate text-xs font-medium text-gray-300">{name}</div>
        <div className="truncate text-[11px] text-gray-500">{description}</div>
      </div>
    </div>
    <ToggleSwitch
      enabled={enabled}
      ariaLabel={`Toggle ${name} tool`}
      onClick={e => {
        e.stopPropagation();
        onToggle();
      }}
    />
  </div>
);

export { ToolRow };
