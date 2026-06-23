import { CLOUD_SHAPE_PATH, CLOUD_VIEWBOX, cloudMarkAspect } from './cloudMarkPaths';

export default function TrafficCloudMark({ className = '', size = 32, variant = 'logo' }) {
  const height = Math.round(size * cloudMarkAspect);
  const glowColor = 'var(--color-neon-cloud, hsl(195, 100%, 55%))';
  const isAuth = variant === 'auth';

  return (
    <div className={`relative inline-block neon-cloud-icon ${className}`.trim()}>
      <svg
        viewBox={`${CLOUD_VIEWBOX.x} ${CLOUD_VIEWBOX.y} ${CLOUD_VIEWBOX.w} ${CLOUD_VIEWBOX.h}`}
        width={size}
        height={height}
        className="block overflow-visible"
        aria-hidden
      >
        {!isAuth && (
          <path
            d={CLOUD_SHAPE_PATH}
            fill="none"
            stroke={glowColor}
            strokeWidth={8}
            opacity={0.5}
            style={{ filter: 'blur(4px)' }}
          />
        )}
        <path
          d={CLOUD_SHAPE_PATH}
          fill="none"
          stroke={glowColor}
          strokeWidth={isAuth ? 3 : 12}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.95}
        />
        <path
          d={CLOUD_SHAPE_PATH}
          fill="none"
          stroke="hsl(195, 100%, 96%)"
          strokeWidth={isAuth ? 1.5 : 5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
