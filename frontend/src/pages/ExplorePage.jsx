import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import PostCard from "../components/post/PostCard";
import Avatar from "../components/common/Avatar";
import { PostSkeleton } from "../components/common/LoadingSpinner";
import usePostStore from "../store/postStore";
import { searchService } from "../services/search.service";
import useTranslation from "../hooks/useTranslation";

const ExplorePage = () => {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const { explorePosts, exploreHasMore, fetchExplore } = usePostStore();
  const [query, setQuery] = useState(q);
  const [searchResults, setSearchResults] = useState({ users: [], posts: [] });
  const [trending, setTrending] = useState([]);
  const [searching, setSearching] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    fetchExplore(true);
    searchService.getTrending().then((res) => setTrending(res.data.trending || []));
  }, []);

  useEffect(() => {
    setQuery(q);
    if (q) runSearch(q);
  }, [q]);

  const runSearch = async (term) => {
    if (!term.trim()) return;
    setSearching(true);
    try {
      const res = await searchService.search(term.trim());
      setSearchResults({ users: res.data.users || [], posts: res.data.posts || [] });
    } catch {
      setSearchResults({ users: [], posts: [] });
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    runSearch(query);
    window.history.replaceState(null, "", query ? `/explore?q=${encodeURIComponent(query)}` : "/explore");
  };

  const showSearch = query.trim().length > 0;

  return (
    <div className="max-w-2xl mx-auto">
      <header className="sticky top-0 z-30 glass border-b border-white/5 px-4 py-4">
        <h1 className="text-xl font-bold mb-3">{t("sidebar.explore")}</h1>
        <form onSubmit={handleSearch}>
          <input
            className="input-field"
            placeholder={t("explore.searchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>
      </header>

      <div className="p-4">
        {showSearch ? (
          searching ? (
            <PostSkeleton />
          ) : (
            <>
              {searchResults.users?.length > 0 && (
                <section className="mb-6">
                  <h2 className="font-semibold mb-3 text-white/70">{t("explore.people")}</h2>
                  {searchResults.users.map((u) => (
                    <Link
                      key={u.id}
                      to={`/profile/${u.username}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 mb-2"
                    >
                      <Avatar src={u.avatar} alt={u.username} size="md" />
                      <div>
                        <p className="font-semibold">{u.displayName || u.username}</p>
                        <p className="text-white/40 text-sm">@{u.username}</p>
                      </div>
                    </Link>
                  ))}
                </section>
              )}
              {searchResults.posts?.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
              {!searchResults.users?.length && !searchResults.posts?.length && (
                <p className="text-white/40 text-center py-8">{t("explore.noResults")} &quot;{query}&quot;</p>
              )}
            </>
          )
        ) : (
          <>
            {trending.length > 0 && (
              <div className="card p-4 mb-4">
                <h2 className="font-semibold mb-3">{t("explore.trendingHashtags")}</h2>
                <div className="flex flex-wrap gap-2">
                  {trending.map(({ tag, count }) => (
                    <Link
                      key={tag}
                      to={`/explore?q=${encodeURIComponent(tag)}`}
                      className="px-3 py-1.5 rounded-full bg-brand-500/20 text-brand-300 text-sm hover:bg-brand-500/30"
                    >
                      {tag} <span className="text-white/40">({count})</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <InfiniteScroll
              dataLength={explorePosts.length}
              next={() => fetchExplore()}
              hasMore={exploreHasMore}
              loader={<PostSkeleton />}
            >
              {explorePosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </InfiniteScroll>
          </>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
