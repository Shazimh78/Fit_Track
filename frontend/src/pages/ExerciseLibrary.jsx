import { useEffect, useState } from "react";
import { exerciseApi } from "../api/endpoints";
import ExerciseCard from "../components/ExerciseCard";

const MUSCLES = ["all", "chest", "back", "legs", "shoulders", "biceps", "triceps", "core", "full_body"];

export default function ExerciseLibrary() {
  const [muscle, setMuscle] = useState("all");
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    exerciseApi
      .list(muscle === "all" ? undefined : muscle)
      .then((res) => setExercises(res.data))
      .catch((err) => setError(err.response?.data?.detail ?? "Couldn't load exercises."))
      .finally(() => setLoading(false));
  }, [muscle]);

  return (
    <div>
      <h1 className="font-display text-4xl tracking-wide mb-1">Exercise library</h1>
      <p className="text-mute text-sm mb-6">Tap any exercise for form cues and a video tutorial.</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {MUSCLES.map((m) => (
          <button
            key={m}
            onClick={() => setMuscle(m)}
            className={[
              "px-3 py-1.5 rounded-full text-xs uppercase tracking-wide font-semibold transition-colors",
              muscle === m ? "bg-volt text-ink" : "bg-panel border border-line text-mute hover:text-bone",
            ].join(" ")}
          >
            {m.replace("_", " ")}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-ember/10 border border-ember/30 text-ember text-sm rounded-md px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-mute">Loading exercises...</p>
      ) : exercises.length === 0 ? (
        <p className="text-mute">No exercises found for this muscle group yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {exercises.map((ex) => (
            <ExerciseCard key={ex.id} exercise={ex} />
          ))}
        </div>
      )}
    </div>
  );
}
