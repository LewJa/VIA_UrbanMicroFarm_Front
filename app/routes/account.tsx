import { useState } from "react";
import { useNavigate } from "react-router";
import { userService } from "~/services/userService";
import { useAuth, type AuthUser } from "~/context/AuthContext";

type ActiveSection = "name" | "email" | "password" | "theme" | "delete" | null;

const THEME_OPTIONS: Array<{ value: AuthUser["theme"]; label: string; desc: string }> = [
  { value: "light", label: "Light", desc: "Always light" },
  { value: "dark", label: "Dark", desc: "Always dark" },
  { value: "system", label: "Auto", desc: "Follows device" },
];

function themeLabel(t: AuthUser["theme"]) {
  return THEME_OPTIONS.find((o) => o.value === t)?.label ?? t;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="text-mf-ink-4"
      style={{ transition: "transform 200ms ease", transform: open ? "rotate(90deg)" : "none" }}
    >
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.07"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-[1.32px] text-mf-ink-3 mb-2 pl-1">
      {children}
    </p>
  );
}

function ExpandPanel({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: open ? "1fr" : "0fr",
        transition: "grid-template-rows 260ms ease",
      }}
    >
      <div className="overflow-hidden" aria-hidden={!open}>
        <div className="px-4 pt-4 pb-5 border-t border-mf-line bg-mf-cream/50 flex flex-col gap-3">
          {children}
        </div>
      </div>
    </div>
  );
}

function FieldGroup({
  id,
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  error,
  placeholder,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  error?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="mf-label">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={`mf-input${error ? " border-mf-err" : ""}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && (
        <span role="alert" className="text-xs text-mf-err">
          {error}
        </span>
      )}
    </div>
  );
}

function RowButton({
  onClick,
  icon,
  label,
  value,
  isOpen,
  destructive = false,
  hasDivider = true,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  value?: string;
  isOpen: boolean;
  destructive?: boolean;
  hasDivider?: boolean;
}) {
  return (
    <button
      className={`w-full flex items-center gap-3 px-4 h-[50px] transition-colors text-left ${
        hasDivider ? "border-b border-mf-line" : ""
      } ${
        destructive
          ? "hover:bg-mf-err/10"
          : "hover:bg-mf-cream/60"
      }`}
      onClick={onClick}
    >
      <span className="flex-shrink-0 w-[30px] flex items-center justify-center">{icon}</span>
      <span
        className={`flex-1 text-[14px] font-medium ${destructive ? "text-mf-err" : "text-mf-ink"}`}
      >
        {label}
      </span>
      {value && (
        <span className="text-[13px] text-mf-ink-3 truncate max-w-[110px] mr-1">{value}</span>
      )}
      <ChevronIcon open={isOpen} />
    </button>
  );
}

export default function AccountPage() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();

  const [active, setActive] = useState<ActiveSection>(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [apiError, setApiError] = useState("");

  const [nameVal, setNameVal] = useState(user?.name ?? "");
  const [nameError, setNameError] = useState("");

  const [newEmail, setNewEmail] = useState("");
  const [emailPwd, setEmailPwd] = useState("");
  const [emailError, setEmailError] = useState("");

  const [curPwd, setCurPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdErrors, setPwdErrors] = useState<{ cur?: string; new?: string; confirm?: string }>({});

  const [deleteConfirm, setDeleteConfirm] = useState(false);

  if (!user) return null;

  const avatarInitial = (user.name || user.email).charAt(0).toUpperCase();

  const toggle = (section: ActiveSection) => {
    setActive((prev) => (prev === section ? null : section));
    setApiError("");
    setSuccessMsg("");
    setNameError("");
    setEmailError("");
    setPwdErrors({});
    setDeleteConfirm(false);
  };

  const flash = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleSaveName = async () => {
    if (!nameVal.trim()) { setNameError("Name is required"); return; }
    setNameError("");
    setSaving(true);
    setApiError("");
    try {
      const resp = await userService.updateName(user.id, nameVal.trim());
      updateUser({ name: resp.user.name });
      flash("Name updated");
      setActive(null);
    } catch {
      setApiError("Could not update name. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEmail = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setEmailError("Enter a valid email address");
      return;
    }
    if (!emailPwd) { setEmailError("Current password is required"); return; }
    setEmailError("");
    setSaving(true);
    setApiError("");
    try {
      const resp = await userService.changeEmail(user.id, { currentPassword: emailPwd, newEmail });
      updateUser({ email: resp.user.email });
      flash("Email updated");
      setNewEmail(""); setEmailPwd("");
      setActive(null);
    } catch (err: unknown) {
      const s = (err as { response?: { status?: number } })?.response?.status;
      setApiError(s === 401 ? "Current password is incorrect." : s === 409 ? "That email is already in use." : "Could not update email. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async () => {
    const errs: typeof pwdErrors = {};
    if (!curPwd) errs.cur = "Current password is required";
    if (!newPwd) errs.new = "New password is required";
    else if (newPwd.length < 8) errs.new = "At least 8 characters";
    if (!confirmPwd) errs.confirm = "Please confirm";
    else if (newPwd !== confirmPwd) errs.confirm = "Passwords do not match";
    if (Object.keys(errs).length) { setPwdErrors(errs); return; }
    setPwdErrors({});
    setSaving(true);
    setApiError("");
    try {
      await userService.changePassword(user.id, { currentPassword: curPwd, newPassword: newPwd });
      flash("Password updated");
      setCurPwd(""); setNewPwd(""); setConfirmPwd("");
      setActive(null);
    } catch (err: unknown) {
      const s = (err as { response?: { status?: number } })?.response?.status;
      setApiError(s === 401 ? "Current password is incorrect." : "Could not update password. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSetTheme = async (theme: AuthUser["theme"]) => {
    setSaving(true);
    setApiError("");
    try {
      const resp = await userService.setTheme(user.id, { theme });
      updateUser({ theme: resp.user.theme });
      flash("Theme updated");
      setActive(null);
    } catch {
      setApiError("Could not update theme. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setSaving(true);
    setApiError("");
    try {
      await userService.deleteAccount(user.id);
      logout();
      navigate("/login", { replace: true, viewTransition: true });
    } catch {
      setApiError("Could not delete account. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-mf-bg">

      {/* Profile hero */}
      <div
        className="relative pb-8 pt-3 flex flex-col items-center"
        style={{ background: "linear-gradient(to bottom, var(--color-mf-bg-2) 0%, var(--color-mf-bg) 100%)" }}
      >
        {/* Header row */}
        <div className="w-full flex items-center justify-between px-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/6 transition-colors"
            aria-label="Go back"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M12.5 4.17L7.5 10l5 5.83" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="font-serif font-semibold text-[17px] tracking-[-0.17px] text-mf-ink">
            Account
          </h1>
          <div className="w-9" />
        </div>

        {/* Avatar */}
        <div
          className="w-[80px] h-[80px] rounded-full flex items-center justify-center border-[3px] border-white shadow-mf-2"
          style={{ background: "linear-gradient(135deg, #3F6638 0%, #B89968 100%)" }}
        >
          <span className="font-serif font-semibold text-[30px] tracking-[-0.08px] text-[#F4EEDB] select-none">
            {avatarInitial}
          </span>
        </div>

        <p className="mt-3 font-serif font-normal text-[22px] tracking-[-0.3px] text-mf-ink leading-tight">
          {user.name || "—"}
        </p>
        <p className="mt-0.5 text-[13px] text-mf-ink-3 tracking-[-0.08px]">{user.email}</p>

        {/* Success toast */}
        {successMsg && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-2 rounded-full bg-mf-forest text-[#F4EEDB] text-[13px] font-medium shadow-mf-2">
            {successMsg}
          </div>
        )}
      </div>

      {/* Error banner */}
      {apiError && (
        <div role="alert" className="mx-5 mt-4 px-4 py-3 rounded-mf-md bg-mf-err/10 text-mf-err text-[13px] leading-snug">
          {apiError}
        </div>
      )}

      {/* Settings list */}
      <div className="px-5 mt-6 pb-6 flex flex-col gap-5 max-w-lg mx-auto">

        {/* PREFERENCES */}
        <section>
          <SectionLabel>Preferences</SectionLabel>
          <div className="mf-card overflow-hidden">

            <RowButton
              onClick={() => toggle("name")}
              isOpen={active === "name"}
              label="Name"
              value={user.name || "Not set"}
              icon={
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" className="text-mf-ink-3">
                  <circle cx="9" cy="6.5" r="2.75" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M3 15.5c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              }
            />
            <ExpandPanel open={active === "name"}>
              <FieldGroup id="name-input" label="Display name" value={nameVal} onChange={setNameVal} autoComplete="name" error={nameError} placeholder="Your name" />
              <div className="flex gap-2">
                <button className="mf-btn mf-btn-primary mf-btn-sm flex-1 disabled:opacity-60" onClick={handleSaveName} disabled={saving}>Save</button>
                <button className="mf-btn mf-btn-secondary mf-btn-sm" onClick={() => toggle("name")}>Cancel</button>
              </div>
            </ExpandPanel>

            <RowButton
              onClick={() => toggle("email")}
              isOpen={active === "email"}
              label="Email"
              value={user.email.length > 16 ? user.email.slice(0, 14) + "…" : user.email}
              icon={
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" className="text-mf-ink-3">
                  <rect x="2" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M2 7l7 4.5L16 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              }
            />
            <ExpandPanel open={active === "email"}>
              <FieldGroup id="new-email" label="New email" type="email" value={newEmail} onChange={setNewEmail} autoComplete="email" error={emailError} placeholder="new@example.com" />
              <FieldGroup id="email-password" label="Verify with password" type="password" value={emailPwd} onChange={setEmailPwd} autoComplete="current-password" placeholder="••••••••" />
              <div className="flex gap-2">
                <button className="mf-btn mf-btn-primary mf-btn-sm flex-1 disabled:opacity-60" onClick={handleSaveEmail} disabled={saving}>Save</button>
                <button className="mf-btn mf-btn-secondary mf-btn-sm" onClick={() => toggle("email")}>Cancel</button>
              </div>
            </ExpandPanel>

            <RowButton
              onClick={() => toggle("theme")}
              isOpen={active === "theme"}
              label="Theme"
              value={themeLabel(user.theme)}
              hasDivider={false}
              icon={
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" className="text-mf-ink-3">
                  <path d="M15 10.5A6 6 0 0 1 7.5 3a6 6 0 1 0 7.5 7.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                </svg>
              }
            />
            <ExpandPanel open={active === "theme"}>
              <div className="flex flex-col gap-1">
                {THEME_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={`flex items-center gap-3 px-3 h-11 rounded-mf-md text-left transition-colors ${
                      user.theme === opt.value
                        ? "bg-mf-forest/10"
                        : "hover:bg-mf-cream"
                    }`}
                    onClick={() => handleSetTheme(opt.value)}
                    disabled={saving}
                  >
                    <span className={`flex-1 text-[14px] font-medium ${user.theme === opt.value ? "text-mf-forest" : "text-mf-ink"}`}>
                      {opt.label}
                    </span>
                    <span className="text-[12px] text-mf-ink-3">{opt.desc}</span>
                    {user.theme === opt.value && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-mf-forest">
                        <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </ExpandPanel>

          </div>
        </section>

        {/* SECURITY */}
        <section>
          <SectionLabel>Security</SectionLabel>
          <div className="mf-card overflow-hidden">
            <RowButton
              onClick={() => toggle("password")}
              isOpen={active === "password"}
              label="Change password"
              hasDivider={false}
              icon={
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" className="text-mf-ink-3">
                  <rect x="3" y="8" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M6 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              }
            />
            <ExpandPanel open={active === "password"}>
              <FieldGroup id="cur-pwd" label="Current password" type="password" value={curPwd} onChange={setCurPwd} autoComplete="current-password" error={pwdErrors.cur} placeholder="••••••••" />
              <FieldGroup id="new-pwd" label="New password" type="password" value={newPwd} onChange={setNewPwd} autoComplete="new-password" error={pwdErrors.new} placeholder="Min. 8 characters" />
              <FieldGroup id="confirm-pwd" label="Confirm new password" type="password" value={confirmPwd} onChange={setConfirmPwd} autoComplete="new-password" error={pwdErrors.confirm} placeholder="••••••••" />
              <div className="flex gap-2">
                <button className="mf-btn mf-btn-primary mf-btn-sm flex-1 disabled:opacity-60" onClick={handleSavePassword} disabled={saving}>Save</button>
                <button className="mf-btn mf-btn-secondary mf-btn-sm" onClick={() => toggle("password")}>Cancel</button>
              </div>
            </ExpandPanel>
          </div>
        </section>

        {/* ACCOUNT */}
        <section>
          <SectionLabel>Account</SectionLabel>
          <div className="mf-card overflow-hidden">

            <RowButton
              onClick={() => toggle("delete")}
              isOpen={active === "delete"}
              label="Delete account"
              destructive
              icon={
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" className="text-mf-err">
                  <path d="M3 5h12M7 5V3h4v2M5 5l1 10h6l1-10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            />
            <ExpandPanel open={active === "delete"}>
              {!deleteConfirm ? (
                <>
                  <p className="text-[13px] text-mf-ink-2 leading-relaxed">
                    This will permanently delete your account and all your data. This cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <button className="mf-btn mf-btn-sm flex-1 bg-mf-err text-[#F4EEDB] hover:brightness-[0.85] transition-colors" onClick={() => setDeleteConfirm(true)}>
                      Yes, delete my account
                    </button>
                    <button className="mf-btn mf-btn-secondary mf-btn-sm" onClick={() => toggle("delete")}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-[13px] font-medium text-mf-err">
                    This action is permanent and cannot be undone. Are you sure?
                  </p>
                  <div className="flex gap-2">
                    <button className="mf-btn mf-btn-sm flex-1 bg-mf-err text-[#F4EEDB] hover:brightness-[0.85] disabled:opacity-60 transition-colors" onClick={handleDeleteAccount} disabled={saving}>
                      {saving ? "Deleting…" : "Delete forever"}
                    </button>
                    <button className="mf-btn mf-btn-secondary mf-btn-sm" onClick={() => toggle("delete")}>Cancel</button>
                  </div>
                </>
              )}
            </ExpandPanel>

            <RowButton
              onClick={() => { logout(); navigate("/login", { replace: true, viewTransition: true }); }}
              isOpen={false}
              label="Log out"
              hasDivider={false}
              destructive
              icon={
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" className="text-mf-err">
                  <path d="M11 12.5l3.5-3.5L11 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M14.5 9H7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  <path d="M7 3.5H4A1.5 1.5 0 0 0 2.5 5v8A1.5 1.5 0 0 0 4 14.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              }
            />
          </div>
        </section>

      </div>
    </div>
  );
}
