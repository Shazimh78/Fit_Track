import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { authApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState(location.state?.email ?? "");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleVerify(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await authApi.verifyOtp({ email, otp });
      login(data.access_token, data.refresh_token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail ?? "Verification failed. Check the code and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setInfo("");
    setResending(true);
    try {
      await authApi.resendOtp({ email });
      setInfo("A new code has been sent to your email.");
    } catch (err) {
      setError(err.response?.data?.detail ?? "Couldn't resend the code.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-display text-4xl tracking-wide text-volt">
            FIT<span className="text-bone">TRACK</span>
          </span>
          <p className="text-mute text-sm mt-2">Enter the code we emailed you</p>
        </div>

        <form onSubmit={handleVerify} className="bg-panel border border-line rounded-lg p-6 space-y-4">
          {error && (
            <div className="bg-ember/10 border border-ember/30 text-ember text-sm rounded-md px-3 py-2">
              {error}
            </div>
          )}
          {info && (
            <div className="bg-volt/10 border border-volt/30 text-volt text-sm rounded-md px-3 py-2">
              {info}
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

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Verifying..." : "Verify & continue"}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending || !email}
            className="w-full text-sm text-mute hover:text-volt transition disabled:opacity-50"
          >
            {resending ? "Sending..." : "Resend code"}
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
