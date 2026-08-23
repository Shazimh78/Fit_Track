import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authApi } from "../api/endpoints";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(location.state?.email ?? "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.resetPassword({ email, otp, new_password: newPassword });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.detail ?? "Couldn't reset your password. Check the code and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <span className="font-display text-4xl tracking-wide text-volt">
            FIT<span className="text-bone">TRACK</span>
          </span>
          <div className="bg-volt/10 border border-volt/30 text-volt text-sm rounded-md px-4 py-3 mt-8">
            Password reset. Taking you to login...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-display text-4xl tracking-wide text-volt">
            FIT<span className="text-bone">TRACK</span>
          </span>
          <p className="text-mute text-sm mt-2">Enter the code and a new password</p>
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
            <span className="block text-xs uppercase tracking-wide text-mute mb-1.5">6-digit code</span>
            <input
              required
              maxLength={6}
              pattern="[0-9]{6}"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="input text-center text-2xl tracking-[0.5em] font-display"
              placeholder="000000"
            />
          </label>

          <label className="block">
            <span className="block text-xs uppercase tracking-wide text-mute mb-1.5">New password</span>
            <input
              required
              minLength={8}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input"
            />
          </label>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </form>

        <p className="text-center text-sm text-mute mt-5">
          <Link to="/forgot-password" className="text-volt hover:underline">
            Didn't get a code? Try again
          </Link>
        </p>
      </div>
    </div>
  );
}
