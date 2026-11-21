import { Link, useLocation } from "react-router-dom";
import classNames from "classnames";
import { motion } from "motion/react";
import PatternWaves from "./PatternWaves";

interface AuthShellProps {
  activeTab: "login" | "register";
  children: React.ReactNode;
}

const tabBaseClasses = "relative z-10 py-2 rounded-lg text-center transition-colors duration-300";

const socialButtonClasses =
  "w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-[#191c21] hover:bg-[#22262d] border border-white/10 text-neutral-200 text-sm font-medium transition duration-150";

const BrainwaveLogo = () => (
  <svg className="w-8 h-8 text-[#0075FF]" fill="currentColor" viewBox="0 0 32 32">
    <path d="M12.5 5.5C10.5 5.5 8.8 6.8 8.2 8.6C6.4 9.1 5 10.7 5 12.7C5 13.5 5.3 14.3 5.7 15C5.3 15.7 5 16.5 5 17.3C5 19.3 6.4 20.9 8.2 21.4C8.8 23.2 10.5 24.5 12.5 24.5C13.5 24.5 14.4 24.1 15.1 23.5C15.4 23.2 15.7 23 16 23C16.3 23 16.6 23.2 16.9 23.5C17.6 24.1 18.5 24.5 19.5 24.5C21.5 24.5 23.2 23.2 23.8 21.4C25.6 20.9 27 19.3 27 17.3C27 16.5 26.7 15.7 26.3 15C26.7 14.3 27 13.5 27 12.7C27 10.7 25.6 9.1 23.8 8.6C23.2 6.8 21.5 5.5 19.5 5.5C18.4 5.5 17.4 6 16.7 6.8C16.3 7.2 15.7 7.2 15.3 6.8C14.6 6 13.6 5.5 12.5 5.5ZM12.5 7.5C13.2 7.5 13.9 7.8 14.4 8.4C15.3 9.4 16.7 9.4 17.6 8.4C18.1 7.8 18.8 7.5 19.5 7.5C20.6 7.5 21.5 8.4 21.5 9.5C21.5 10 21.9 10.5 22.5 10.5C23.6 10.5 24.5 11.4 24.5 12.5C24.5 13 24.9 13.5 25.5 13.5C25.8 13.5 26 13.7 26 14C26 14.3 25.8 14.5 25.5 14.5C24.9 14.5 24.5 15 24.5 15.5C24.5 16.6 23.6 17.5 22.5 17.5C21.9 17.5 21.5 18 21.5 18.5C21.5 19.6 20.6 20.5 19.5 20.5C18.8 20.5 18.1 20.2 17.6 19.6C16.7 18.6 15.3 18.6 14.4 19.6C13.9 20.2 13.2 20.5 12.5 20.5C11.4 20.5 10.5 19.6 10.5 18.5C10.5 18 10.1 17.5 9.5 17.5C8.4 17.5 7.5 16.6 7.5 15.5C7.5 15 7.1 14.5 6.5 14.5C6.2 14.5 6 14.3 6 14C6 13.7 6.2 13.5 6.5 13.5C7.1 13.5 7.5 13 7.5 12.5C7.5 11.4 8.4 10.5 9.5 10.5C10.1 10.5 10.5 10 10.5 9.5C10.5 8.4 11.4 7.5 12.5 7.5Z" />
  </svg>
);

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.67v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.16z"
      fill="#4285F4"
    />
    <path
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
      fill="#34A853"
    />
    <path
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
      fill="#FBBC05"
    />
    <path
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      fill="#EA4335"
    />
  </svg>
);

const AppleIcon = () => (
  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8.93-2.85-.9.04-1.98.6-2.62 1.35-.57.65-1.06 1.7-.93 2.72 1 .08 2-.47 2.62-1.22z" />
  </svg>
);

const AuthShell = ({ activeTab, children }: AuthShellProps) => {
  const location = useLocation();
  const fromTab = (location.state as { fromTab?: "login" | "register" } | null)?.fromTab;
  const pillFromX = fromTab === "register" ? "100%" : "0%";
  const pillToX = activeTab === "register" ? "100%" : "0%";

  return (
    <div className="relative min-h-screen w-full bg-[#0e0f12] flex items-center justify-center p-4 sm:p-6 md:p-8 text-white antialiased">
      <div className="relative w-full max-w-5xl flex flex-col md:flex-row gap-4 sm:gap-6 md:h-[calc(100vh-4rem)]">
        <aside
          className="hidden md:flex md:w-1/2 flex-col relative overflow-hidden rounded-3xl ring-1 ring-white/10 shadow-2xl shadow-black/60 select-none bg-[#0e0f12]"
          data-purpose="hero-panel"
        >
          <PatternWaves
            preset="silk"
            color="#0075FF"
            backgroundColor="#0e0f12"
            fade="edges"
            interactive
            cursorSize={50}
            cursorStrength={0.6}
            className="absolute inset-0"
          />

          <div className="relative z-10 flex flex-1 flex-col justify-between p-8 sm:p-12 lg:p-16">
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                Unlock the power
                <br />
                of AI
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-neutral-400 font-normal leading-relaxed max-w-lg">
                Chat with the smartest AI - Experience the power of AI with us
              </p>
            </div>
          </div>
        </aside>

        <div
          className="w-full md:w-1/2 flex flex-col rounded-3xl bg-[#14161a] ring-1 ring-white/10 shadow-2xl shadow-black/60 md:overflow-y-auto"
          data-purpose="auth-card-panel"
        >
          <div className="w-full min-h-full flex flex-col justify-center items-center relative p-6 sm:p-8 lg:p-10">
            <div className="w-full max-w-[340px] mx-auto">
              <div className="flex items-center justify-center gap-2.5 mt-2 mb-6">
                <div className="flex-shrink-0">
                  <BrainwaveLogo />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">Brainwave</span>
              </div>

              <div
                className="relative w-full mx-auto bg-[#14161a] p-1 rounded-xl grid grid-cols-2 border border-white/5 mb-6 text-xs sm:text-sm font-medium"
                data-purpose="auth-tabs"
              >
                <motion.span
                  aria-hidden="true"
                  initial={fromTab ? { x: pillFromX } : false}
                  animate={{ x: pillToX }}
                  transition={{ type: "spring", stiffness: 420, damping: 32, mass: 0.8 }}
                  className="absolute left-1 top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-[#272b32] shadow"
                />
                <Link
                  to="/login"
                  state={{ fromTab: activeTab }}
                  className={classNames(
                    tabBaseClasses,
                    activeTab === "login" ? "text-white font-semibold" : "text-neutral-400 hover:text-neutral-200"
                  )}
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  state={{ fromTab: activeTab }}
                  className={classNames(
                    tabBaseClasses,
                    activeTab === "register" ? "text-white font-semibold" : "text-neutral-400 hover:text-neutral-200"
                  )}
                >
                  Create account
                </Link>
              </div>

              <div className="w-full max-w-[340px] mx-auto space-y-4">
                <div className="space-y-2.5" data-purpose="social-buttons">
                  <button type="button" className={socialButtonClasses}>
                    <GoogleIcon />
                    <span>Continue with Google</span>
                  </button>
                  <button type="button" className={socialButtonClasses}>
                    <AppleIcon />
                    <span>Continue with Apple</span>
                  </button>
                </div>

                <div className="relative py-2 flex items-center justify-center">
                  <div className="w-full border-t border-white/10" />
                  <span className="absolute bg-[#1c2024] px-2 text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                    OR
                  </span>
                </div>

                <motion.div
                  key={activeTab}
                  initial={fromTab ? { opacity: 0, x: fromTab === "register" ? -16 : 16 } : false}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                >
                  {children}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthShell;
