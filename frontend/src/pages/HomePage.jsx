import { useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import CreatePost from "../components/post/CreatePost";
import PostCard from "../components/post/PostCard";
import { PostSkeleton } from "../components/common/LoadingSpinner";
import usePostStore from "../store/postStore";

const HomePage = () => {
  const { feedPosts, feedHasMore, feedLoading, fetchFeed } = usePostStore();

  useEffect(() => {
    fetchFeed(true);
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <header className="sticky top-0 z-30 glass border-b border-white/5 px-4 py-4 hidden lg:block">
        <h1 className="text-xl font-bold">Home</h1>
      </header>
      <div className="p-4">
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
              <p className="text-center text-white/30 text-sm py-8">You&apos;re all caught up!</p>
            ) : null
          }
        >
          {feedPosts.length === 0 && !feedLoading ? (
            <div className="card p-8 text-center text-white/50">
              <p className="mb-2">Your feed is empty</p>
              <p className="text-sm">Follow people to see their posts here</p>
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
