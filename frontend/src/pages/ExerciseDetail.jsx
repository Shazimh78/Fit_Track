import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { exerciseApi } from "../api/endpoints";

export default function ExerciseDetail() {
  const { id } = useParams();
  const [exercise, setExercise] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setExercise(null);
    exerciseApi
      .get(id)
      .then((res) => setExercise(res.data))
      .catch((err) => setError(err.response?.data?.detail ?? "Couldn't load this exercise."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div>
        <p className="text-mute mb-2">Loading exercise...</p>
        <p className="text-xs text-mute">
          First view generates an AI description and finds a tutorial video — this can take a
          few seconds. It's instant after that.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-ember/10 border border-ember/30 text-ember text-sm rounded-md px-4 py-3">
        {error}
      </div>
    );
  }

  return (
    <div>
      <Link to="/exercises" className="text-sm text-mute hover:text-volt transition">
        &larr; Back to library
      </Link>

      <div className="mt-4 mb-6">
        <h1 className="font-display text-4xl tracking-wide">{exercise.name}</h1>
        <p className="text-mute text-sm mt-1 capitalize">
          {exercise.muscle_group} &middot; {exercise.equipment} &middot; {exercise.difficulty} &middot;{" "}
          {exercise.default_sets_reps}
        </p>
      </div>

      {exercise.youtube_video_id && (
        <div className="aspect-video bg-panel border border-line rounded-lg overflow-hidden mb-6">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${exercise.youtube_video_id}`}
            title={`${exercise.name} tutorial`}
            allowFullScreen
          />
        </div>
      )}

      {exercise.ai_description && (
        <div className="bg-panel border border-line rounded-lg p-6 mb-6">
          <p className="text-bone leading-relaxed">{exercise.ai_description.description}</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {exercise.posture_tips?.length > 0 && (
          <TipList title="Posture tips" tips={exercise.posture_tips} accent="volt" />
        )}
        {exercise.ai_description?.posture_cues?.length > 0 && (
          <TipList title="Form cues" tips={exercise.ai_description.posture_cues} accent="cobalt" />
        )}
        {exercise.ai_description?.common_mistakes?.length > 0 && (
          <TipList title="Common mistakes" tips={exercise.ai_description.common_mistakes} accent="ember" />
        )}
      </div>
    </div>
  );
}

function TipList({ title, tips, accent }) {
  const dotClass = accent === "ember" ? "bg-ember" : accent === "cobalt" ? "bg-cobalt" : "bg-volt";
  return (
    <div className="bg-panel border border-line rounded-lg p-5">
      <h3 className="font-semibold text-sm uppercase tracking-wide text-mute mb-3">{title}</h3>
      <ul className="space-y-2">
        {tips.map((tip, i) => (
          <li key={i} className="flex gap-2.5 text-sm text-bone">
            <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${dotClass}`} />
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}
