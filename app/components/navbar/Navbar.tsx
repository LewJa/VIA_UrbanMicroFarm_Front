import { NavLink } from "react-router";

const SproutIcon = () => (
  <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="23" height="23" rx="11.5" fill="url(#paint0_linear_65_392)"/>
    <path d="M11.5 16.5V12.125" stroke="#F4EEDB" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11.5 12.125C9.625 12.125 7.75 10.875 7.75 8.375C10.25 8.375 11.5 9.625 11.5 12.125Z" stroke="#F4EEDB" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11.5 12.125C13.375 12.125 15.25 10.875 15.25 8.375C12.75 8.375 11.5 9.625 11.5 12.125Z" stroke="#F4EEDB" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7.125 16.5H15.875" stroke="#F4EEDB" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
      <defs>
        <linearGradient id="paint0_linear_65_392" x1="0" y1="0" x2="23" y2="23" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3F6638"/>
          <stop offset="1" stopColor="#6B8A4D"/>
        </linearGradient>
      </defs>
  </svg>
);

const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.75 10.0846L11 3.66797L19.25 10.0846V18.3346C19.25 18.5778 19.1534 18.8109 18.9815 18.9828C18.8096 19.1547 18.5764 19.2513 18.3333 19.2513H13.75V13.7513H8.25V19.2513H3.66667C3.42355 19.2513 3.19039 19.1547 3.01849 18.9828C2.84658 18.8109 2.75 18.5778 2.75 18.3346V10.0846Z" stroke="currentcolor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BellIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.49935 7.33203C5.49935 5.87334 6.07881 4.47439 7.11026 3.44294C8.14171 2.41149 9.54066 1.83203 10.9993 1.83203C12.458 1.83203 13.857 2.41149 14.8884 3.44294C15.9199 4.47439 16.4993 5.87334 16.4993 7.33203C16.4993 12.832 18.3327 13.7487 18.3327 13.7487H3.66602C3.66602 13.7487 5.49935 12.832 5.49935 7.33203Z" stroke="currentcolor" strokeWidth="1.46667" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.16602 17.418C9.16602 17.9042 9.35917 18.3705 9.70299 18.7143C10.0468 19.0581 10.5131 19.2513 10.9993 19.2513C11.4856 19.2513 11.9519 19.0581 12.2957 18.7143C12.6395 18.3705 12.8327 17.9042 12.8327 17.418" stroke="currentcolor" strokeWidth="1.46667" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UserIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.0007 11.0013C13.0257 11.0013 14.6673 9.35968 14.6673 7.33464C14.6673 5.30959 13.0257 3.66797 11.0007 3.66797C8.97561 3.66797 7.33398 5.30959 7.33398 7.33464C7.33398 9.35968 8.97561 11.0013 11.0007 11.0013Z" stroke="currentcolor" strokeWidth="1.46667" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3.66602 19.25C5.04102 15.5833 8.24935 13.75 10.9993 13.75C13.7493 13.75 16.9577 15.5833 18.3327 19.25" stroke="currentcolor" strokeWidth="1.46667" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export function Navbar() {
  return (
    <>
      <header className="flex justify-between items-center px-4 py-4 md:px-8 md:py-6 relative z-10">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center">
              <SproutIcon />
            </div>
            <span className="font-serif font-bold text-xl text-mf-ink mt-0.5 tracking-tight">microfarm</span>
          </div>

          <nav className="hidden md:flex items-center gap-2">
            <NavLink
              to="/"
              className={({ isActive }) => `px-4 py-2 rounded-full text-[15px] transition-colors ${isActive ? "bg-mf-cream text-mf-forest font-bold" : "text-mf-ink-3 hover:text-mf-forest font-medium"}`}
            >
              Home
            </NavLink>
            <NavLink
              to="/alerts"
              className={({ isActive }) => `px-4 py-2 rounded-full text-[15px] transition-colors ${isActive ? "bg-mf-cream text-mf-forest font-bold" : "text-mf-ink-3 hover:text-mf-forest font-medium"}`}
            >
              Alerts
            </NavLink>
            <NavLink
              to="/account"
              className={({ isActive }) => `px-4 py-2 rounded-full text-[15px] transition-colors ${isActive ? "bg-mf-cream text-mf-forest font-bold" : "text-mf-ink-3 hover:text-mf-forest font-medium"}`}
            >
              Account
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <NavLink
            to="/alerts" 
            className="w-10 h-10 rounded-full bg-mf-card border border-mf-line flex items-center justify-center text-mf-ink-2 hover:text-mf-ink transition-colors shadow-sm"
          >
            <BellIcon className="scale-90" />
          </NavLink>
          <NavLink 
            to="/account"
            className="hidden md:flex w-9 h-9 rounded-full bg-mf-clay text-mf-cream items-center justify-center text-sm font-medium shadow-sm hover:opacity-90 transition-opacity"
          >
            A
          </NavLink>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-mf-bg border-t border-mf-line flex justify-around items-center pt-3 pb-7">
        <NavLink
          to="/"
          className={({ isActive }) => `flex flex-col items-center gap-1.5 transition-colors ${isActive ? "text-mf-forest font-bold" : "text-mf-ink-3 font-medium"}`}
        >
          <HomeIcon />
          <span className="text-[11px] tracking-wide">Home</span>
        </NavLink>
        <NavLink
          to="/alerts"
          className={({ isActive }) => `flex flex-col items-center gap-1.5 transition-colors ${isActive ? "text-mf-forest font-bold" : "text-mf-ink-3 font-medium"}`}
        >
          <div className="relative">
            <BellIcon />
          </div>
          <span className="text-[11px] tracking-wide">Alerts</span>
        </NavLink>
        <NavLink
          to="/account"
          className={({ isActive }) => `flex flex-col items-center gap-1.5 transition-colors ${isActive ? "text-mf-forest font-bold" : "text-mf-ink-3 font-medium"}`}
        >
          <UserIcon />
          <span className="text-[11px] tracking-wide">Account</span>
        </NavLink>
      </nav>
    </>
  );
}