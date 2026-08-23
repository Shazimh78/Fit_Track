import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../api/endpoints";

const initialForm = {
  name: "",
  email: "",
  password: "",
  gender: "male",
  age: "",
  height_cm: "",
  weight_kg: "",
  target_weight_kg: "",
  activity_level: "moderate",
};

export default function Signup() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.signup({
        ...form,
        age: Number(form.age),
        height_cm: Number(form.height_cm),
        weight_kg: Number(form.weight_kg),
        target_weight_kg: Number(form.target_weight_kg),
      });
      navigate("/verify-otp", { state: { email: form.email } });
    } catch (err) {
      setError(err.response?.data?.detail ?? "Signup failed. Check your details and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="font-display text-4xl tracking-wide text-volt">
            FIT<span className="text-bone">TRACK</span>
          </span>
          <p className="text-mute text-sm mt-2">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-panel border border-line rounded-lg p-6 space-y-4">
          {error && (
            <div className="bg-ember/10 border border-ember/30 text-ember text-sm rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <Field label="Name">
            <input
              required
              minLength={2}
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Email">
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Password">
            <input
              required
              minLength={8}
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              className="input"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Gender">
              <select value={form.gender} onChange={(e) => update("gender", e.target.value)} className="input">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Age">
              <input
                required
                type="number"
                min={1}
                max={119}
                value={form.age}
                onChange={(e) => update("age", e.target.value)}
                className="input"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Height (cm)">
              <input
                required
                type="number"
                step="0.1"
                value={form.height_cm}
                onChange={(e) => update("height_cm", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Weight (kg)">
              <input
                required
                type="number"
                step="0.1"
                value={form.weight_kg}
                onChange={(e) => update("weight_kg", e.target.value)}
                className="input"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Target weight (kg)">
              <input
                required
                type="number"
                step="0.1"
                value={form.target_weight_kg}
                onChange={(e) => update("target_weight_kg", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Activity level">
              <select
                value={form.activity_level}
                onChange={(e) => update("activity_level", e.target.value)}
                className="input"
              >
                <option value="sedentary">Sedentary</option>
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="active">Active</option>
              </select>
            </Field>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-mute mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-volt hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wide text-mute mb-1.5">{label}</span>
      {children}
    </label>
  );
}
