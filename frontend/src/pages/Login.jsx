import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await authApi.login({ email, password });
      login(data.access_token, data.refresh_token);
      navigate("/dashboard");
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (err.response?.status === 403 && detail?.toLowerCase().includes("not verified")) {
        navigate("/verify-otp", { state: { email } });
        return;
      }
      setError(detail ?? "Login failed. Check your email and password.");
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
          <p className="text-mute text-sm mt-2">Welcome back</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-panel border border-line rounded-lg p-6 space-y-4">
          {error && (
            <div className="bg-ember/10 border border-ember/30 text-ember text-sm rounded-md px-3 py-2">
              {error}
            </div>
          )}

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

          <label className="block">
            <span className="block text-xs uppercase tracking-wide text-mute mb-1.5">Password</span>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
          </label>

          <div className="text-right">
            <Link to="/forgot-password" className="text-xs text-mute hover:text-volt transition">
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="text-center text-sm text-mute mt-5">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-volt hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
