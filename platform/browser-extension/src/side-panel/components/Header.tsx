import { Zap } from 'lucide-react';

const Header = ({ connected }: { connected: boolean }) => (
  <header className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
    <div className="flex items-center gap-2">
      <Zap className="h-5 w-5 text-amber-400" />
      <h1 className="text-base font-semibold tracking-tight text-white">OpenTabs</h1>
    </div>
    <div className="flex items-center gap-2">
      <div
        className={`h-2.5 w-2.5 rounded-full ${
          connected
            ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]'
            : 'bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.5)]'
        } animate-pulse-dot`}
      />
      <span className="text-xs text-gray-400">{connected ? 'Connected' : 'Disconnected'}</span>
    </div>
  </header>
);

export { Header };
