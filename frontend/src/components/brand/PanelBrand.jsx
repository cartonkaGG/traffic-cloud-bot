import TrafficCloudMark from './TrafficCloudMark';

export default function PanelBrand({ compact = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <TrafficCloudMark size={compact ? 22 : 28} variant="logo" />
      <div className="min-w-0">
        <div
          className={
            compact
              ? 'text-[10px] font-extrabold tracking-[0.2em] text-white'
              : 'text-[11px] font-extrabold tracking-[0.22em] text-white sm:text-xs'
          }
        >
          TRAFFIC CLOUD
        </div>
        {!compact && <div className="text-[10px] font-medium text-zinc-500 mt-0.5">traffic hub</div>}
      </div>
    </div>
  );
}
