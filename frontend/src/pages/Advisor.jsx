import { useState } from "react";
import { recommendApi } from "../api/endpoints";
import ExerciseCard from "../components/ExerciseCard";

const MUSCLES = ["chest", "back", "legs", "shoulders", "biceps", "triceps", "core", "full_body"];
const MAX_MUSCLES = 4;
const EXPERIENCE_LEVELS = [
  { value: "", label: "Auto (based on BMI)" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export default function Advisor() {
  const [selected, setSelected] = useState([]);
  const [experienceLevel, setExperienceLevel] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function toggle(muscle) {
    setSelected((prev) => {
      if (prev.includes(muscle)) return prev.filter((m) => m !== muscle);
      if (prev.length >= MAX_MUSCLES) return prev;
      return [...prev, muscle];
    });
  }

  async function handleSubmit() {
    if (selected.length === 0) return;
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const payload = { muscles: selected };
      if (experienceLevel) payload.experience_level = experienceLevel;
      const { data } = await recommendApi.recommend(payload);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail ?? "Couldn't generate a recommendation.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-4xl tracking-wide mb-1">Workout advisor</h1>
      <p className="text-mute text-sm mb-6">
        Pick up to {MAX_MUSCLES} muscles you're training today — we'll rank exercises to match
        your profile.
      </p>

      <div className="flex flex-wrap gap-2 mb-5">
        {MUSCLES.map((m) => {
          const isSelected = selected.includes(m);
          return (
            <button
              key={m}
              onClick={() => toggle(m)}
              disabled={!isSelected && selected.length >= MAX_MUSCLES}
              className={[
                "px-4 py-2 rounded-full text-sm font-semibold capitalize transition-colors disabled:opacity-40",
                isSelected ? "bg-volt text-ink" : "bg-panel border border-line text-mute hover:text-bone",
              ].join(" ")}
            >
              {m.replace("_", " ")}
            </button>
          );
        })}
      </div>

      <label className="block max-w-xs mb-2">
        <span className="block text-xs uppercase tracking-wide text-mute mb-1.5">Training experience</span>
        <select
          value={experienceLevel}
          onChange={(e) => setExperienceLevel(e.target.value)}
          className="input"
        >
          {EXPERIENCE_LEVELS.map((lvl) => (
            <option key={lvl.value} value={lvl.value}>
              {lvl.label}
            </option>
          ))}
        </select>
      </label>
      <p className="text-xs text-mute mb-5 max-w-md">
        Set this yourself for the most accurate result — it matters more than gender or BMI
        alone. Leave it on Auto and we'll estimate a starting point from your BMI.
      </p>

      <button onClick={handleSubmit} disabled={selected.length === 0 || loading} className="btn-primary mb-8">
        {loading ? "Building your workout..." : "Get exercises"}
      </button>

      {error && (
        <div className="bg-ember/10 border border-ember/30 text-ember text-sm rounded-md px-4 py-3 mb-6">
          {error}
        </div>
      )}

      {result && (
        <div>
          <div className="flex gap-6 mb-6 text-sm text-mute">
            <span>
              BMI <span className="text-bone font-semibold">{result.bmi}</span> ({result.bmi_category})
            </span>
            <span>
              Intensity <span className="text-bone font-semibold capitalize">{result.intensity_tier}</span>
            </span>
          </div>

          {result.recommendations.map((group) => (
            <div key={group.muscle} className="mb-8">
              <h2 className="font-display text-2xl tracking-wide capitalize mb-3">
                {group.muscle.replace("_", " ")}
              </h2>
              {group.exercises.length === 0 ? (
                <p className="text-mute text-sm">No exercises found for this muscle group yet.</p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.exercises.map((ex) => (
                    <ExerciseCard key={ex.id} exercise={ex} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
