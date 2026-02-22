import { sanitizeSvg } from '../../sanitize-svg.js';

const AVATAR_PALETTE_SIZE = 10;

/** djb2 string hash to unsigned 32-bit integer. */
const hashString = (str: string): number => {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
};

/** Returns a CSS variable reference for the deterministic avatar color. */
const getAvatarVar = (pluginName: string): string =>
  `var(--avatar-${String(hashString(pluginName) % AVATAR_PALETTE_SIZE)})`;

/** Extracts the display letter from the plugin's displayName, falling back to name. */
const getAvatarLetter = (displayName: string, pluginName: string): string =>
  (displayName[0] ?? pluginName[0] ?? '?').toUpperCase();

interface PluginIconProps {
  pluginName: string;
  displayName: string;
  ready: boolean;
  size?: number;
  className?: string;
  iconSvg?: string;
  iconInactiveSvg?: string;
}

const PluginIcon = ({
  pluginName,
  displayName,
  ready,
  size = 32,
  className = '',
  iconSvg,
  iconInactiveSvg,
}: PluginIconProps) => {
  const hasSvg = !!iconSvg;
  const rawSvg = ready ? iconSvg : iconInactiveSvg;
  const svgToRender = rawSvg ? sanitizeSvg(rawSvg) : undefined;
  const innerSize = Math.round(size * 0.6);

  if (hasSvg && svgToRender) {
    return (
      <div
        className={`border-border flex shrink-0 items-center justify-center rounded border-2 ${ready ? '' : 'opacity-50'} ${className}`}
        style={{ width: size, height: size }}>
        <div
          className="overflow-hidden"
          style={{ width: innerSize, height: innerSize }}
          dangerouslySetInnerHTML={{ __html: svgToRender }}
        />
      </div>
    );
  }

  const letter = getAvatarLetter(displayName, pluginName);
  const fontSize = Math.round(size * 0.55);

  return (
    <div
      className={`border-border flex shrink-0 items-center justify-center rounded border-2 ${ready ? '' : 'opacity-50'} ${className}`}
      style={{ width: size, height: size, backgroundColor: getAvatarVar(pluginName) }}>
      <span className="font-head leading-none text-white select-none" style={{ fontSize, letterSpacing: '-0.02em' }}>
        {letter}
      </span>
    </div>
  );
};

export { AVATAR_PALETTE_SIZE, getAvatarLetter, getAvatarVar, hashString, PluginIcon };
