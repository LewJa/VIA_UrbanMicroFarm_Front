import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { userService } from "~/services/userService";
import { useAuth } from "~/context/AuthContext";

function validate(email: string, password: string) {
  const errors: { email?: string; password?: string } = {};
  if (!email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address";
  }
  if (!password) {
    errors.password = "Password is required";
  }
  return errors;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fieldErrors = validate(email, password);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setServerError("");
    setLoading(true);
    try {
      const resp = await userService.login({ email, password });
      login(resp.token, resp.user);
      navigate("/", { replace: true });
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      setServerError(
        status === 401 ? "Incorrect email or password." : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mf-bg flex flex-col items-center justify-center p-5">
      <div className="w-full max-w-[400px]">

        {/* Branding */}
        <div className="flex flex-col items-center mb-10">
          <div
            className="w-[60px] h-[60px] rounded-full flex items-center justify-center mb-3 shadow-mf-2"
            style={{ background: "linear-gradient(135deg, #3F6638 0%, #6B8A4D 100%)" }}
          >
            <svg width="28" height="28" viewBox="0 0 18 18" fill="none">
              <path d="M9 15V9" stroke="#F4EEDB" strokeWidth="1.4" strokeLinecap="round" />
              <path
                d="M9 9C9 9 5 7 5 3.5C5 3.5 7 5 9 5C11 5 13 3.5 13 3.5C13 7 9 9 9 9Z"
                stroke="#F4EEDB"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="font-serif font-semibold text-[22px] tracking-[-0.3px] text-mf-ink">
            microfarm
          </span>
        </div>

        {/* Heading */}
        <div className="mb-7">
          <h1 className="font-serif font-normal text-[38px] leading-[1.05] tracking-[-0.76px] text-mf-ink">
            Welcome <em>back</em>
          </h1>
          <p className="mt-2 text-[14px] text-mf-ink-3 leading-snug">
            Sign in to tend your plants.
          </p>
        </div>

        {/* Form */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          {serverError && (
            <div
              role="alert"
              className="px-3 py-2.5 rounded-mf-md bg-mf-err/10 text-mf-err text-sm leading-snug"
            >
              {serverError}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="mf-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={`mf-input${errors.email ? " border-mf-err" : ""}`}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <span role="alert" className="text-xs text-mf-err">
                {errors.email}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="mf-label mb-0">
                Password
              </label>
              <button
                type="button"
                className="text-[12px] text-mf-ink-3 hover:text-mf-ink transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className={`mf-input${errors.password ? " border-mf-err" : ""}`}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && (
              <span role="alert" className="text-xs text-mf-err">
                {errors.password}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mf-btn mf-btn-primary w-full mt-2 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in →"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-mf-line text-center text-[13px] text-mf-ink-3">
          New to MicroFarm?{" "}
          <Link
            to="/register"
            className="font-medium text-mf-ink underline underline-offset-2 hover:text-mf-forest transition-colors"
          >
            Create an account
          </Link>
        </div>

      </div>
    </div>
  );
}
