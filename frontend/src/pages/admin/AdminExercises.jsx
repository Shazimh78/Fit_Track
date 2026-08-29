import { useEffect, useState } from "react";
import { adminApi, exerciseApi } from "../../api/endpoints";

const MUSCLES = ["chest", "back", "legs", "shoulders", "arms", "core", "full_body"];
const EQUIPMENT = ["bodyweight", "dumbbell", "barbell", "machine", "band"];
const DIFFICULTY = ["beginner", "intermediate", "advanced"];

const emptyForm = {
  name: "",
  muscle_group: "chest",
  equipment: "bodyweight",
  difficulty: "beginner",
  default_sets_reps: "3x12",
};

export default function AdminExercises() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState(null);

  function load() {
    setLoading(true);
    exerciseApi
      .list()
      .then((res) => setExercises(res.data))
      .catch((err) => setError(err.response?.data?.detail ?? "Couldn't load exercises."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      const { data } = await adminApi.createExercise(form);
      setExercises((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setForm(emptyForm);
      setInfo(`Added "${data.name}".`);
    } catch (err) {
      setError(err.response?.data?.detail ?? "Couldn't create exercise.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete "${name}"? This can't be undone.`)) return;
    setBusyId(id);
    try {
      await adminApi.deleteExercise(id);
      setExercises((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setError(err.response?.data?.detail ?? "Couldn't delete exercise.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleRegenerate(id) {
    setBusyId(id);
    setError("");
    try {
      const { data } = await adminApi.regenerateExercise(id);
      setExercises((prev) => prev.map((e) => (e.id === id ? data : e)));
      setInfo(`Regenerated content for "${data.name}".`);
    } catch (err) {
      setError(err.response?.data?.detail ?? "Couldn't regenerate content.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <h1 className="font-display text-4xl tracking-wide mb-6">Manage exercises</h1>

      {error && (
        <div className="bg-ember/10 border border-ember/30 text-ember text-sm rounded-md px-4 py-3 mb-4">
          {error}
        </div>
      )}
      {info && (
        <div className="bg-volt/10 border border-volt/30 text-volt text-sm rounded-md px-4 py-3 mb-4">
          {info}
        </div>
      )}

      <form onSubmit={handleCreate} className="bg-panel border border-line rounded-lg p-5 mb-8">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-mute mb-4">Add exercise</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <input
            required
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="input lg:col-span-2"
          />
          <select
            value={form.muscle_group}
            onChange={(e) => setForm((f) => ({ ...f, muscle_group: e.target.value }))}
            className="input"
          >
            {MUSCLES.map((m) => (
              <option key={m} value={m}>
                {m.replace("_", " ")}
              </option>
            ))}
          </select>
          <select
            value={form.equipment}
            onChange={(e) => setForm((f) => ({ ...f, equipment: e.target.value }))}
            className="input"
          >
            {EQUIPMENT.map((eq) => (
              <option key={eq} value={eq}>
                {eq}
              </option>
            ))}
          </select>
          <select
            value={form.difficulty}
            onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}
            className="input"
          >
            {DIFFICULTY.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 mt-3">
          <input
            required
            placeholder="Sets x reps, e.g. 3x12"
            value={form.default_sets_reps}
            onChange={(e) => setForm((f) => ({ ...f, default_sets_reps: e.target.value }))}
            className="input max-w-[200px]"
          />
          <button type="submit" disabled={creating} className="btn-primary">
            {creating ? "Adding..." : "Add exercise"}
          </button>
        </div>
      </form>

      {loading ? (
        <p className="text-mute">Loading exercises...</p>
      ) : (
        <div className="bg-panel border border-line rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-panel2 text-mute text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Muscle</th>
                <th className="text-left px-4 py-3">Views</th>
                <th className="text-left px-4 py-3">AI content</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {exercises.map((ex) => (
                <tr key={ex.id}>
                  <td className="px-4 py-3 text-bone">{ex.name}</td>
                  <td className="px-4 py-3 text-mute capitalize">{ex.muscle_group.replace("_", " ")}</td>
                  <td className="px-4 py-3 text-mute">{ex.view_count}</td>
                  <td className="px-4 py-3">
                    <span className={ex.ai_description ? "text-cobalt" : "text-mute"}>
                      {ex.ai_description ? "Generated" : "Not yet"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => handleRegenerate(ex.id)}
                      disabled={busyId === ex.id}
                      className="btn-secondary py-1 px-2.5 text-xs"
                    >
                      Regenerate
                    </button>
                    <button
                      onClick={() => handleDelete(ex.id, ex.name)}
                      disabled={busyId === ex.id}
                      className="btn-danger py-1 px-2.5 text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
