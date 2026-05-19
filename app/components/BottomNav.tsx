import { NavLink } from "react-router";

const navItems = [
  {
    to: "/",
    label: "Home",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <path
          d="M3 9.5L11 3l8 6.5V19a1 1 0 0 1-1 1H14v-5H8v5H4a1 1 0 0 1-1-1V9.5z"
          stroke="currentColor"
          strokeWidth="1.33"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    to: "/plants",
    label: "Plants",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <path
          d="M11 19V11"
          stroke="currentColor"
          strokeWidth="1.33"
          strokeLinecap="round"
        />
        <path
          d="M11 11C11 11 6 8.5 6 4.5C6 4.5 8.5 6.5 11 6.5C13.5 6.5 16 4.5 16 4.5C16 8.5 11 11 11 11Z"
          stroke="currentColor"
          strokeWidth="1.33"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    to: "/alerts",
    label: "Alerts",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <path
          d="M11 3a6 6 0 0 1 6 6v3l1.5 2.5h-15L5 12V9a6 6 0 0 1 6-6z"
          stroke="currentColor"
          strokeWidth="1.33"
          strokeLinejoin="round"
        />
        <path
          d="M9 16.5a2 2 0 0 0 4 0"
          stroke="currentColor"
          strokeWidth="1.33"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    to: "/account",
    label: "Account",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <circle cx="11" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.33" />
        <path
          d="M4 19c0-3.866 3.134-7 7-7h0c3.866 0 7 3.134 7 7"
          stroke="currentColor"
          strokeWidth="1.33"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export default function BottomNav() {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 border-t border-mf-line"
      style={{ background: "color-mix(in srgb, var(--color-mf-bg) 86%, transparent)", backdropFilter: "blur(10px)" }}
    >
      <nav className="flex justify-around items-start pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 w-[90px] pb-1 text-[11px] font-medium transition-colors ${
                isActive ? "text-mf-forest" : "text-mf-ink-3"
              }`
            }
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
