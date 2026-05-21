import { useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import NotificationItem from "../components/notification/NotificationItem";
import useNotifStore from "../store/notifStore";
import useTranslation from "../hooks/useTranslation";

const NotificationsPage = () => {
  const { notifications, hasMore, fetchNotifications, markAllRead, unreadCount } = useNotifStore();
  const { t } = useTranslation();

  useEffect(() => {
    fetchNotifications(true);
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <header className="sticky top-0 z-30 glass border-b border-white/5 px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">{t("sidebar.notifications")}</h1>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-sm text-brand-400 hover:underline">
            {t("common.markAllRead")}
          </button>
        )}
      </header>
      <InfiniteScroll
        dataLength={notifications.length}
        next={() => fetchNotifications()}
        hasMore={hasMore}
        loader={<p className="text-center text-white/40 py-4">{t("common.loading")}</p>}
      >
        {notifications.length === 0 ? (
          <p className="text-white/40 text-center py-12">{t("common.noNotifications")}</p>
        ) : (
          notifications.map((n) => <NotificationItem key={n.id} notification={n} />)
        )}
      </InfiniteScroll>
    </div>
  );
};

export default NotificationsPage;
