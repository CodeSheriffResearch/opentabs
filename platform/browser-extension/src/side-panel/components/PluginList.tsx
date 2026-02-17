import { PluginCard } from './PluginCard.js';
import type { PluginState } from '../bridge.js';

const PluginList = ({
  plugins,
  activeTools,
  onRefresh,
}: {
  plugins: PluginState[];
  activeTools: Set<string>;
  onRefresh: () => void;
}) => (
  <div className="space-y-2">
    {plugins.map(plugin => (
      <PluginCard key={plugin.name} plugin={plugin} activeTools={activeTools} onRefresh={onRefresh} />
    ))}
  </div>
);

export { PluginList };
