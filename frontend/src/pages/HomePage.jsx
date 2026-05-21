import { useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { motion } from "framer-motion";
import CreatePost from "../components/post/CreatePost";
import PostCard from "../components/post/PostCard";
import { PostSkeleton } from "../components/common/LoadingSpinner";
import usePostStore from "../store/postStore";
import useAuthStore from "../store/authStore";
import useTranslation from "../hooks/useTranslation";

const HomePage = () => {
  const { feedPosts, feedHasMore, feedLoading, fetchFeed } = usePostStore();
  const { user } = useAuthStore();
  const { t } = useTranslation();

  useEffect(() => {
    fetchFeed(true);
  }, []);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-4 lg:py-6">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="home-feed-hero relative w-full overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-brand-500/20 via-surface-900 to-surface-950 p-6 shadow-2xl shadow-brand-500/10"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_30%)]" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="section-kicker">{t("home.feedKicker")}</span>
            <h1 className="font-display mt-4 text-3xl font-bold text-white sm:text-4xl">
              {t("home.heroTitle")}{user?.displayName ? `, ${user.displayName}` : ""}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/60">
              {t("home.heroText")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center text-xs sm:text-sm">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 backdrop-blur-md">
              <p className="text-white/40 leading-none">{t("common.posts")}</p>
              <p className="mt-2.5 font-display text-lg font-semibold leading-none text-white">{feedPosts.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 backdrop-blur-md">
              <p className="text-white/40 whitespace-nowrap leading-none">{t("common.feed")}</p>
              <p className="mt-1 font-display text-[15px] font-semibold leading-none text-white sm:text-lg">{feedHasMore ? t("common.live") : t("common.done")}</p>
            </div>
          </div>
        </div>
      </motion.section>

      <header className="home-feed-header sticky top-4 z-30 hidden w-full rounded-2xl border border-white/10 bg-surface-950/70 px-4 py-3 backdrop-blur-xl lg:block">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-white">{t("home.homeCardTitle")}</h2>
            <p className="text-xs text-white/45">{t("home.homeCardText")}</p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60">
            {feedHasMore ? "More to load" : "All caught up"}
          </span>
        </div>
      </header>
      
      <div className="w-full space-y-4">
        <CreatePost />
        <InfiniteScroll
          dataLength={feedPosts.length}
          next={() => fetchFeed()}
          hasMore={feedHasMore}
          loader={
            <div className="space-y-4 py-4">
              <PostSkeleton />
              <PostSkeleton />
            </div>
          }
          endMessage={
            feedPosts.length > 0 ? (
              <p className="text-center text-white/30 text-sm py-8">{t("home.allCaughtUp")}</p>
            ) : null
          }
        >
          {feedPosts.length === 0 && !feedLoading ? (
            <div className="card p-8 text-center text-white/50">
              <p className="mb-2">{t("home.emptyTitle")}</p>
              <p className="text-sm">{t("home.emptyText")}</p>
            </div>
          ) : (
            feedPosts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default HomePage;
