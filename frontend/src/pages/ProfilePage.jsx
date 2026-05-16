import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import ProfileHeader from "../components/profile/ProfileHeader";
import PostCard from "../components/post/PostCard";
import { PageLoader, PostSkeleton } from "../components/common/LoadingSpinner";
import { userService } from "../services/user.service";

const ProfilePage = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setPosts([]);
    setPage(1);
    setHasMore(true);
    userService
      .getProfile(username)
      .then((res) => setProfile(res.data.user))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [username]);

  const loadPosts = async (reset = false) => {
    const p = reset ? 1 : page;
    try {
      const res = await userService.getUserPosts(username, p);
      const { posts: newPosts, totalPages } = res.data;
      setPosts((prev) => (reset ? newPosts : [...prev, ...newPosts]));
      setPage(p + 1);
      setHasMore(p < totalPages);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    if (profile) loadPosts(true);
  }, [profile?.id]);

  if (loading) return <PageLoader />;
  if (!profile) {
    return (
      <div className="p-8 text-center text-white/50">
        <p>User not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <ProfileHeader profile={profile} onUpdate={setProfile} />
      <div className="px-4 pb-8">
        <h2 className="font-bold text-lg mb-4 px-1">Posts</h2>
        <InfiniteScroll
          dataLength={posts.length}
          next={() => loadPosts()}
          hasMore={hasMore}
          loader={<PostSkeleton />}
        >
          {posts.length === 0 ? (
            <p className="text-white/40 text-center py-8">No posts yet</p>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default ProfilePage;
