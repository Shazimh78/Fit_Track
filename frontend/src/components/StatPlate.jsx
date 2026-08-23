export default function StatPlate({ value, unit, label, accent = "volt" }) {
  const accentClass = accent === "ember" ? "text-ember" : accent === "cobalt" ? "text-cobalt" : "text-volt";

  return (
    <div className="bg-panel border border-line rounded-lg px-6 py-5 flex flex-col gap-1">
      <div className="flex items-baseline gap-1.5">
        <span className={`font-display text-5xl leading-none ${accentClass}`}>{value}</span>
        {unit && <span className="text-mute text-sm font-medium">{unit}</span>}
      </div>
      <span className="text-xs uppercase tracking-widest text-mute mt-1">{label}</span>
    </div>
  );
}
