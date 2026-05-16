import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import RightPanel from "./RightPanel";
import Navbar from "./Navbar";

const MainLayout = () => (
  <div className="min-h-screen bg-surface-950">
    <Navbar />
    <div className="flex max-w-[1400px] mx-auto">
      <Sidebar />
      <main className="flex-1 min-w-0 border-x border-white/5 min-h-screen pb-20 lg:pb-0">
        <Outlet />
      </main>
      <RightPanel />
    </div>
  </div>
);

export default MainLayout;
