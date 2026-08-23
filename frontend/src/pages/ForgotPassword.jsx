import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/endpoints";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      // Always proceed to the reset screen regardless of whether the
      // account exists — matches the backend's non-revealing response.
      navigate("/reset-password", { state: { email } });
    } catch (err) {
      setError(err.response?.data?.detail ?? "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-display text-4xl tracking-wide text-volt">
            FIT<span className="text-bone">TRACK</span>
          </span>
          <p className="text-mute text-sm mt-2">Reset your password</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-panel border border-line rounded-lg p-6 space-y-4">
          {error && (
            <div className="bg-ember/10 border border-ember/30 text-ember text-sm rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <p className="text-sm text-mute">
            Enter your account email and we'll send a code to reset your password, if an
            account exists for it.
          </p>

          <label className="block">
            <span className="block text-xs uppercase tracking-wide text-mute mb-1.5">Email</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </label>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Sending..." : "Send reset code"}
          </button>
        </form>

        <p className="text-center text-sm text-mute mt-5">
          <Link to="/login" className="text-volt hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
