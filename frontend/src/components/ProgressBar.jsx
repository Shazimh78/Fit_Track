export default function ProgressBar({ percent, label }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div>
      {label && (
        <div className="flex justify-between text-xs text-mute mb-1.5">
          <span>{label}</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div className="h-2 bg-panel2 rounded-full overflow-hidden">
        <div
          className="h-full bg-volt rounded-full transition-all duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
