import { AnimatePresence, motion } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import RightPanel from "./RightPanel";
import Navbar from "./Navbar";

const MainLayout = () => {
  const location = useLocation();

  return (
    <div className="relative min-h-screen overflow-hidden bg-surface-950 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="mesh-orb -left-24 top-0 h-72 w-72 bg-brand-500/25" />
        <div className="mesh-orb right-0 top-24 h-80 w-80 bg-sky-400/20" style={{ animationDelay: "-4s" }} />
        <div className="mesh-orb bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 bg-blue-500/10" style={{ animationDelay: "-8s" }} />
      </div>

      <div className="relative z-10">
        <Navbar />
        <div className="mx-auto flex max-w-[1440px]">
          <div className="hidden lg:block w-[260px] xl:w-[280px] shrink-0" aria-hidden="true" />
          <Sidebar />
          <main className="min-h-screen min-w-0 flex-1 border-x border-white/5 bg-surface-950/50 pb-20 backdrop-blur-xl lg:pb-0">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="min-h-screen"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
          <RightPanel />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
