import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useAuthStore from "../../store/authStore";
import useNotifStore from "../../store/notifStore";
import useTranslation from "../../hooks/useTranslation";
import Avatar from "../common/Avatar";
import {
  IconHome, IconSearch, IconBell, IconChat, IconUser, IconLogout, IconSettings,
} from "../common/Icons";

const navItems = [
  { to: "/", icon: IconHome, key: "sidebar.home" },
  { to: "/explore", icon: IconSearch, key: "sidebar.explore" },
  { to: "/notifications", icon: IconBell, key: "sidebar.notifications", badge: true, notif: true },
  { to: "/chat", icon: IconChat, key: "sidebar.messages" },
  { to: "/settings", icon: IconSettings, key: "sidebar.settings" },
];

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotifStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  return (
    <aside className="sidebar-shell hidden lg:flex lg:fixed lg:left-0 lg:top-0 lg:z-30 lg:h-screen lg:overflow-y-auto flex-col w-[260px] xl:w-[280px] px-4 py-6 border-r border-white/5 bg-surface-950/35 backdrop-blur-sm">
      <NavLink to="/" className="flex items-center gap-2 px-3 mb-8">
        <motion.div
          className="sidebar-brand-mark w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center text-white font-bold text-lg"
          whileHover={{ scale: 1.05 }}
        >
          M
        </motion.div>
        <span className="font-display text-xl font-bold brand-gradient-text">MediaGram</span>
      </NavLink>

      <nav className="flex-1 space-y-1">
        {navItems.map(({ to, icon: Icon, key, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
                `sidebar-link flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all ${
                isActive
                    ? "sidebar-link-active bg-brand-500/15 text-brand-400"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`
            }
          >
            <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
              <Icon className="sidebar-icon h-5 w-5 shrink-0" />
              {badge && unreadCount > 0 && (
                <span className="notif-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
              )}
            </span>
            <span>{t(key)}</span>
          </NavLink>
        ))}
        <NavLink
          to={`/profile/${user?.username}`}
          className={({ isActive }) =>
            `sidebar-link flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all ${
              isActive ? "sidebar-link-active bg-brand-500/15 text-brand-400" : "text-white/60 hover:text-white hover:bg-white/5"
            }`
          }
        >
          <IconUser className="sidebar-icon h-5 w-5 shrink-0" />
          <span>{t("sidebar.profile")}</span>
        </NavLink>
      </nav>

      <div className="mt-auto pt-4 border-t border-white/5">
        <div className="sidebar-user-card flex items-center gap-3 px-3 py-3 rounded-2xl glass-strong hover:border-white/10 transition-colors">
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
