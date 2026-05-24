import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { userService } from "~/services/userService";
import { useAuth } from "~/context/AuthContext";

function validate(name: string, email: string, password: string) {
  const errors: { name?: string; email?: string; password?: string } = {};
  if (!name.trim()) {
    errors.name = "Name is required";
  }
  if (!email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address";
  }
  if (!password) {
    errors.password = "Password is required";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  } else if (!/[A-Z]/.test(password)) {
    errors.password = "Password must contain at least one uppercase letter";
  } else if (!/[0-9]/.test(password)) {
    errors.password = "Password must contain at least one number";
  } else if (!/[^A-Za-z0-9]/.test(password)) {
    errors.password = "Password must contain at least one special character";
  }
  return errors;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fieldErrors = validate(name, email, password);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setServerError("");
    setLoading(true);
    try {
      await userService.register({ name, email, password });
      const resp = await userService.login({ email, password });
      login(resp.token, resp.user);
      navigate("/", { replace: true, viewTransition: true });
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      setServerError(
        status === 409
          ? "An account with this email already exists."
          : "Something went wrong. Please try again.",
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
          <h1 className="font-serif font-normal text-[28px] sm:text-[38px] leading-[1.05] tracking-[-0.76px] text-mf-ink">
            Join <em>microfarm</em>
          </h1>
          <p className="mt-2 text-[14px] text-mf-ink-3 leading-snug">
            Start tending your plants.
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
            <label htmlFor="name" className="mf-label">
              Name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              className={`mf-input${errors.name ? " border-mf-err" : ""}`}
              placeholder="Anya Petrov"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && (
              <span role="alert" className="text-xs text-mf-err">
                {errors.name}
              </span>
            )}
          </div>

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
            <label htmlFor="password" className="mf-label">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                className={`mf-input w-full pr-10${errors.password ? " border-mf-err" : ""}`}
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-mf-ink-3 hover:text-mf-ink transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
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
            {loading ? "Creating account…" : "Sign up →"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-mf-line text-center text-[13px] text-mf-ink-3">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-mf-ink underline underline-offset-2 hover:text-mf-forest transition-colors"
          >
            Sign in
          </Link>
        </div>

      </div>
    </div>
  );
}
