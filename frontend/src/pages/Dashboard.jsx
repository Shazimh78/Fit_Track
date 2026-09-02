import { useEffect, useState } from "react";
import { dashboardApi } from "../api/endpoints";
import StatPlate from "../components/StatPlate";
import ProgressBar from "../components/ProgressBar";

const ACTIVITY_LEVELS = ["sedentary", "light", "moderate", "active"];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState("");

  useEffect(() => {
    loadSummary();
  }, []);

  function loadSummary() {
    setLoading(true);
    dashboardApi
      .summary()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.detail ?? "Couldn't load your dashboard."))
      .finally(() => setLoading(false));
  }

  function openEdit() {
    setForm({
      age: data.age,
      height_cm: data.height_cm,
      weight_kg: data.current_weight_kg,
      target_weight_kg: data.target_weight_kg,
      activity_level: "moderate",
    });
    setSaveError("");
    setEditing(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaveError("");
    setSaving(true);
    try {
      const { data: updated } = await dashboardApi.updateProfile({
        age: Number(form.age),
        height_cm: Number(form.height_cm),
        weight_kg: Number(form.weight_kg),
        target_weight_kg: Number(form.target_weight_kg),
        activity_level: form.activity_level,
      });
      setData(updated);
      setEditing(false);
      setSavedNotice("Profile updated.");
      setTimeout(() => setSavedNotice(""), 3000);
    } catch (err) {
      setSaveError(err.response?.data?.detail ?? "Couldn't save your changes.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-mute">Loading dashboard...</p>;

  if (error) {
    return (
      <div className="bg-ember/10 border border-ember/30 text-ember text-sm rounded-md px-4 py-3">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-1">
        <h1 className="font-display text-3xl sm:text-4xl tracking-wide">
          Welcome back, <span className="text-volt">{data.name.split(" ")[0]}</span>
        </h1>
        {!editing && (
          <button onClick={openEdit} className="btn-secondary text-xs py-1.5 px-3 shrink-0 self-start">
            Update weight / details
          </button>
        )}
      </div>
      <p className="text-mute text-sm mb-8 capitalize">
        {data.gender} &middot; {data.age} years &middot; {data.height_cm}cm
      </p>

      {savedNotice && (
        <div className="bg-volt/10 border border-volt/30 text-volt text-sm rounded-md px-4 py-2 mb-6">
          {savedNotice}
        </div>
      )}

      {editing && (
        <form onSubmit={handleSave} className="bg-panel border border-line rounded-lg p-5 mb-8">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-mute mb-4">
            Update your details
          </h2>

          {saveError && (
            <div className="bg-ember/10 border border-ember/30 text-ember text-sm rounded-md px-3 py-2 mb-4">
              {saveError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <label className="block">
              <span className="block text-xs uppercase tracking-wide text-mute mb-1.5">Age</span>
              <input
                type="number"
                min={1}
                max={119}
                value={form.age}
                onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                className="input"
              />
            </label>
            <label className="block">
              <span className="block text-xs uppercase tracking-wide text-mute mb-1.5">Height (cm)</span>
              <input
                type="number"
                step="0.1"
                value={form.height_cm}
                onChange={(e) => setForm((f) => ({ ...f, height_cm: e.target.value }))}
                className="input"
              />
            </label>
            <label className="block">
              <span className="block text-xs uppercase tracking-wide text-mute mb-1.5">Weight (kg)</span>
              <input
                type="number"
                step="0.1"
                value={form.weight_kg}
                onChange={(e) => setForm((f) => ({ ...f, weight_kg: e.target.value }))}
                className="input"
              />
            </label>
            <label className="block">
              <span className="block text-xs uppercase tracking-wide text-mute mb-1.5">Target weight (kg)</span>
              <input
                type="number"
                step="0.1"
                value={form.target_weight_kg}
                onChange={(e) => setForm((f) => ({ ...f, target_weight_kg: e.target.value }))}
                className="input"
              />
            </label>
          </div>

          <label className="block max-w-xs mb-4">
            <span className="block text-xs uppercase tracking-wide text-mute mb-1.5">Activity level</span>
            <select
              value={form.activity_level}
              onChange={(e) => setForm((f) => ({ ...f, activity_level: e.target.value }))}
              className="input"
            >
              {ACTIVITY_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </label>

          {form.target_weight_kg != data.target_weight_kg && (
            <p className="text-xs text-mute mb-4">
              You're changing your target weight — your progress bar will restart from your
              current weight toward this new goal.
            </p>
          )}

          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving..." : "Save changes"}
            </button>
            <button type="button" onClick={() => setEditing(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatPlate value={data.bmi} label={`BMI · ${data.bmi_category}`} accent="volt" />
        <StatPlate value={data.current_weight_kg} unit="kg" label="Current weight" accent="cobalt" />
        <StatPlate value={data.bmr_calories} label="BMR (kcal)" accent="ember" />
        <StatPlate value={data.estimated_daily_calories} label="Est. daily needs" accent="ember" />
      </div>

      <div className="bg-panel border border-line rounded-lg p-6">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display text-2xl tracking-wide">Weight goal</h2>
          <span className="text-sm text-mute">
            {data.current_weight_kg}kg &rarr; {data.target_weight_kg}kg
          </span>
        </div>
        <ProgressBar percent={data.progress_percent} label={`${data.weight_to_go_kg}kg to go`} />
      </div>

      {data.calorie_plan?.length > 0 && (
        <div className="bg-panel border border-line rounded-lg p-6 mt-6">
          <h2 className="font-display text-2xl tracking-wide mb-1">Calorie plan</h2>
          <p className="text-mute text-sm mb-5">
            Pick a pace to reach {data.target_weight_kg}kg. These are estimates to start from and
            adjust based on your actual results, not a guarantee.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {data.calorie_plan.map((option) => (
              <div key={option.label} className="bg-panel2 border border-line rounded-lg p-4">
                <p className="text-xs uppercase tracking-widest text-mute mb-2 capitalize">
                  {option.label} &middot; {option.pace_kg_per_week}kg/week
                </p>
                <p className="font-display text-3xl text-volt leading-none mb-1">
                  {option.daily_calories}
                  <span className="text-sm text-mute font-body ml-1">kcal/day</span>
                </p>
                <p className="text-xs text-mute mt-2">~{option.estimated_weeks} weeks to goal</p>
                {option.floor_applied && (
                  <p className="text-xs text-ember mt-2">
                    Capped at a safe minimum — this pace isn't achievable safely at your current
                    maintenance calories.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-mute mt-6">
        Estimated daily needs are calculated from your BMR and activity level — not a measured
        burn from a tracked workout. Update your weight periodically for the most accurate picture.
      </p>
    </div>
  );
}
