import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Avatar from "../common/Avatar";
import Modal from "../common/Modal";
import { IconVerified } from "../common/Icons";
import { formatNumber } from "../../utils/timeFormat";
import useAuthStore from "../../store/authStore";
import { userService } from "../../services/user.service";
import { fileToBase64 } from "../../utils/timeFormat";
import toast from "react-hot-toast";

const ProfileHeader = ({ profile, onUpdate }) => {
  const { user: currentUser, updateUser } = useAuthStore();
  const [following, setFollowing] = useState(profile?.isFollowing);
  const [followLoading, setFollowLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({
    displayName: profile?.displayName || "",
    bio: profile?.bio || "",
    username: profile?.username || "",
  });
  const [saving, setSaving] = useState(false);

  const isOwn = currentUser?.id === profile?.id;

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      const res = await userService.toggleFollow(profile.id);
      setFollowing(res.data.following);
    } catch {
      toast.error("Action failed");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const image = await fileToBase64(file);
      const res = await userService.updateAvatar(image);
      updateUser({ avatar: res.data.avatar });
      onUpdate?.({ ...profile, avatar: res.data.avatar });
      toast.success("Avatar updated");
    } catch {
      toast.error("Upload failed");
    }
  };

  const handleCover = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const image = await fileToBase64(file);
      const res = await userService.updateCover(image);
      updateUser({ coverImage: res.data.coverImage });
      onUpdate?.({ ...profile, coverImage: res.data.coverImage });
      toast.success("Cover updated");
    } catch {
      toast.error("Upload failed");
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await userService.updateProfile(form);
      updateUser(res.data.user);
      onUpdate?.({ ...profile, ...res.data.user });
      setEditOpen(false);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.error || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-4">
      <div className="relative h-40 md:h-52 bg-surface-800 rounded-b-2xl overflow-hidden">
        {profile?.coverImage ? (
          <img src={profile.coverImage} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-brand-gradient opacity-40" />
        )}
        {isOwn && (
          <label className="absolute bottom-3 right-3 btn-secondary text-xs cursor-pointer">
            Change cover
            <input type="file" accept="image/*" className="hidden" onChange={handleCover} />
          </label>
        )}
      </div>

      <div className="px-4 -mt-12 relative">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="relative inline-block">
            <Avatar src={profile?.avatar} alt={profile?.username} size="2xl" className="ring-4 ring-surface-950" />
            {isOwn && (
              <label className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center cursor-pointer hover:bg-brand-600 text-white text-lg">
                +
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
              </label>
            )}
          </div>
          <div className="flex-1 flex flex-wrap items-center gap-3 pb-2">
            {isOwn ? (
              <button onClick={() => setEditOpen(true)} className="btn-secondary">
                Edit profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={following ? "btn-secondary" : "btn-primary"}
                >
                  {following ? "Following" : "Follow"}
                </button>
                <Link to={`/chat/${profile.id}`} className="btn-secondary">
                  Message
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="mt-3">
          <h1 className="text-xl font-bold flex items-center gap-1">
            {profile?.displayName || profile?.username}
            {profile?.isVerified && <IconVerified />}
          </h1>
          <p className="text-white/40">@{profile?.username}</p>
          {profile?.bio && <p className="mt-2 text-white/80 text-sm">{profile.bio}</p>}
          <div className="flex gap-4 mt-3 text-sm">
            <span>
              <strong>{formatNumber(profile?._count?.following || 0)}</strong>{" "}
              <span className="text-white/40">Following</span>
            </span>
            <span>
              <strong>{formatNumber(profile?._count?.followers || 0)}</strong>{" "}
              <span className="text-white/40">Followers</span>
            </span>
            <span>
              <strong>{formatNumber(profile?._count?.posts || 0)}</strong>{" "}
              <span className="text-white/40">Posts</span>
            </span>
          </div>
        </div>
      </div>

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit profile">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-white/60 mb-1 block">Display name</label>
            <input
              className="input-field"
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm text-white/60 mb-1 block">Username</label>
            <input
              className="input-field"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm text-white/60 mb-1 block">Bio</label>
            <textarea
              className="input-field resize-none"
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>
          <button onClick={handleSaveProfile} disabled={saving} className="btn-primary w-full">
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ProfileHeader;
