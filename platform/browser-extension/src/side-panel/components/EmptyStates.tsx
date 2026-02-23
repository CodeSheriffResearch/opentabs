import { Empty } from './retro/Empty.js';
import { Loader } from './retro/Loader.js';

const DisconnectedState = () => (
  <Empty className="border-destructive/60">
    <Empty.Content>
      <Empty.Title>Cannot Reach MCP Server</Empty.Title>
      <Empty.Separator className="bg-destructive" />
      <Empty.Description>Start the MCP server:</Empty.Description>
      <code className="border-destructive/40 bg-destructive/10 rounded border-2 px-3 py-2 font-mono text-sm">
        opentabs start
      </code>
    </Empty.Content>
  </Empty>
);

const NoPluginsState = () => (
  <Empty>
    <Empty.Content>
      <Empty.Title>No Plugins Installed</Empty.Title>
      <Empty.Separator />
      <Empty.Description>Manage plugins with:</Empty.Description>
      <code className="rounded border-2 px-3 py-2 font-mono text-sm">opentabs plugin</code>
    </Empty.Content>
  </Empty>
);

const LoadingState = () => <Loader size="md" />;

export { DisconnectedState, NoPluginsState, LoadingState };
