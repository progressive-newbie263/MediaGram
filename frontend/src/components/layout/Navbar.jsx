import { NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import useNotifStore from "../../store/notifStore";
import Avatar from "../common/Avatar";
import { IconHome, IconSearch, IconBell, IconChat, IconUser } from "../common/Icons";

const mobileNav = [
  { to: "/", icon: IconHome, end: true },
  { to: "/explore", icon: IconSearch },
  { to: "/notifications", icon: IconBell, badge: true },
  { to: "/chat", icon: IconChat },
  { to: "/profile", icon: IconUser, profile: true },
];

const Navbar = () => {
  const { user } = useAuthStore();
  const { unreadCount } = useNotifStore();
  const navigate = useNavigate();

  return (
    <>
      <header className="lg:hidden sticky top-0 z-40 glass border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <NavLink to="/" className="text-lg font-bold brand-gradient-text">MediaGram</NavLink>
        <button onClick={() => navigate(`/profile/${user?.username}`)}>
          <Avatar src={user?.avatar} alt={user?.username} size="sm" />
        </button>
      </header>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/5 px-2 py-2 safe-area-pb">
        <div className="flex items-center justify-around">
          {mobileNav.map(({ to, icon: Icon, end, badge, profile }) => (
            <NavLink
              key={to}
              to={profile ? `/profile/${user?.username}` : to}
              end={end}
              className={({ isActive }) =>
                `relative p-3 rounded-xl transition-colors ${
                  isActive ? "text-brand-400" : "text-white/50"
                }`
              }
            >
              <Icon className="w-6 h-6" />
              {badge && unreadCount > 0 && (
                <span className="notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
