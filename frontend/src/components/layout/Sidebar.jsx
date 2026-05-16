import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useAuthStore from "../../store/authStore";
import useNotifStore from "../../store/notifStore";
import Avatar from "../common/Avatar";
import {
  IconHome, IconSearch, IconBell, IconChat, IconUser, IconLogout,
} from "../common/Icons";

const navItems = [
  { to: "/", icon: IconHome, label: "Home" },
  { to: "/explore", icon: IconSearch, label: "Explore" },
  { to: "/notifications", icon: IconBell, label: "Notifications", badge: true },
  { to: "/chat", icon: IconChat, label: "Messages" },
];

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotifStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  return (
    <aside className="hidden lg:flex flex-col w-[260px] xl:w-[280px] h-screen sticky top-0 px-4 py-6 border-r border-white/5">
      <NavLink to="/" className="flex items-center gap-2 px-3 mb-8">
        <motion.div
          className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center text-white font-bold text-lg"
          whileHover={{ scale: 1.05 }}
        >
          M
        </motion.div>
        <span className="text-xl font-bold brand-gradient-text">MediaGram</span>
      </NavLink>

      <nav className="flex-1 space-y-1">
        {navItems.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all ${
                isActive
                  ? "bg-brand-500/15 text-brand-400"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`
            }
          >
            <span className="relative">
              <Icon />
              {badge && unreadCount > 0 && (
                <span className="notif-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
              )}
            </span>
            <span>{label}</span>
          </NavLink>
        ))}
        <NavLink
          to={`/profile/${user?.username}`}
          className={({ isActive }) =>
            `flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all ${
              isActive ? "bg-brand-500/15 text-brand-400" : "text-white/60 hover:text-white hover:bg-white/5"
            }`
          }
        >
          <IconUser />
          <span>Profile</span>
        </NavLink>
      </nav>

      <div className="mt-auto pt-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors">
          <Avatar src={user?.avatar} alt={user?.username} size="md" />
          <motion.div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{user?.displayName}</p>
            <p className="text-white/40 text-xs truncate">@{user?.username}</p>
          </motion.div>
          <button onClick={handleLogout} className="p-2 text-white/40 hover:text-red-400 transition-colors" title="Logout">
            <IconLogout />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
