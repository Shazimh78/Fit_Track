import { Link } from "react-router-dom";

const DIFFICULTY_COLOR = {
  beginner: "text-volt",
  intermediate: "text-cobalt",
  advanced: "text-ember",
};

export default function ExerciseCard({ exercise }) {
  return (
    <Link
      to={`/exercises/${exercise.id}`}
      className="block bg-panel border border-line rounded-lg p-5 hover:border-volt transition-colors group"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-bone group-hover:text-volt transition-colors">
          {exercise.name}
        </h3>
        <span className={`text-xs uppercase tracking-wide font-semibold shrink-0 ${DIFFICULTY_COLOR[exercise.difficulty] ?? "text-mute"}`}>
          {exercise.difficulty}
        </span>
      </div>
      <p className="text-sm text-mute mt-2 capitalize">
        {exercise.muscle_group} &middot; {exercise.equipment}
      </p>
      <p className="text-sm text-mute mt-1">{exercise.default_sets_reps}</p>
    </Link>
  );
}
