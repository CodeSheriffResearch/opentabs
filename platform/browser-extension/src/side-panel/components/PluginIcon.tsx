interface PluginIconProps {
  pluginName: string;
  ready: boolean;
  size?: number;
  className?: string;
}

const PluginIcon = ({ ready, size = 32, className = '' }: PluginIconProps) => (
  <div
    className={`border-border bg-muted flex shrink-0 items-center justify-center rounded border-2 ${ready ? 'text-foreground' : 'text-muted-foreground'} ${className}`}
    style={{ width: size, height: size }}>
    <svg
      width={size * 0.5}
      height={size * 0.5}
      viewBox="0 0 24 24"
      fill={ready ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M20 12h-2a2 2 0 0 1 0-4h2V4h-4a2 2 0 0 1-4 0H4v4h2a2 2 0 0 1 0 4H4v8h8v-2a2 2 0 0 1 4 0v2h4z" />
    </svg>
  </div>
);

export { PluginIcon };
