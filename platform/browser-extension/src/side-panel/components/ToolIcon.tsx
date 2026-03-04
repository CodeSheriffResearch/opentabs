import { Wrench } from 'lucide-react';
import type { IconName } from 'lucide-react/dynamic';
import { DynamicIcon } from 'lucide-react/dynamic';
import { Suspense, useEffect, useRef, useState } from 'react';
import { cn } from '../lib/cn.js';

interface ToolIconProps {
  icon?: string;
  className?: string;
  enabled?: boolean;
  active?: boolean;
}

const FallbackIcon = ({ enabled = true }: { enabled?: boolean }) => (
  <Wrench className={cn('h-3 w-3 transition-colors', enabled ? 'text-primary-foreground' : 'text-muted-foreground')} />
);

const ToolIcon = ({ icon, className = '', enabled = true, active = false }: ToolIconProps) => {
  const [fadingOut, setFadingOut] = useState(false);
  const prevActiveRef = useRef(false);

  useEffect(() => {
    if (prevActiveRef.current && !active) {
      setTimeout(() => setFadingOut(true), 0);
      const timer = setTimeout(() => setFadingOut(false), 500);
      prevActiveRef.current = active;
      return () => clearTimeout(timer);
    }
    prevActiveRef.current = active;
    return;
  }, [active]);

  return (
    <div
      className={cn(
        'flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 transition-colors',
        enabled
          ? [
              'bg-primary',
              active && 'animate-activity-border-flash',
              fadingOut && !active && 'animate-activity-border-fade-out',
              !active && !fadingOut && 'border-border',
            ]
          : 'border-border/40 bg-muted/40',
        className,
      )}>
      {icon ? (
        <Suspense fallback={<FallbackIcon enabled={enabled} />}>
          <DynamicIcon
            name={icon as IconName}
            className={cn('h-3 w-3 transition-colors', enabled ? 'text-primary-foreground' : 'text-muted-foreground')}
            fallback={() => <FallbackIcon enabled={enabled} />}
          />
        </Suspense>
      ) : (
        <FallbackIcon enabled={enabled} />
      )}
    </div>
  );
};

export { ToolIcon };
