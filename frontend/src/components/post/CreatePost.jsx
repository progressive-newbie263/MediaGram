import { useState, useRef } from "react";
import { motion } from "framer-motion";
import Avatar from "../common/Avatar";
import { IconImage } from "../common/Icons";
import useAuthStore from "../../store/authStore";
import usePostStore from "../../store/postStore";
import { fileToBase64 } from "../../utils/timeFormat";
import { MAX_POST_IMAGES, MAX_IMAGE_SIZE_MB } from "../../utils/constants";
import toast from "react-hot-toast";

const CreatePost = () => {
  const { user } = useAuthStore();
  const { createPost } = usePostStore();
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > MAX_POST_IMAGES) {
      toast.error(`Maximum ${MAX_POST_IMAGES} images`);
      return;
    }
    for (const file of files) {
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        toast.error(`Image must be under ${MAX_IMAGE_SIZE_MB}MB`);
        continue;
      }
      const b64 = await fileToBase64(file);
      setImages((prev) => [...prev, b64]);
      setPreviews((prev) => [...prev, URL.createObjectURL(file)]);
    }
    e.target.value = "";
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) {
      toast.error("Write something or add an image");
      return;
    }
    setLoading(true);
    const result = await createPost({ content: content.trim(), images });
    setLoading(false);
    if (result.success) {
      setContent("");
      setImages([]);
      setPreviews([]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4 mb-4"
    >
      <div className="flex gap-3">
        <Avatar src={user?.avatar} alt={user?.username} size="md" />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            className="w-full bg-transparent text-white placeholder-white/30 resize-none focus:outline-none text-[15px] leading-relaxed"
          />
          {previews.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              {previews.map((src, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden">
                  <img src={src} alt="" className="w-full h-32 object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white text-xs hover:bg-black/80"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 text-brand-400 hover:text-brand-300 text-sm font-medium"
            >
              <IconImage />
              Photo
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageSelect}
            />
            <button
              onClick={handleSubmit}
              disabled={loading || (!content.trim() && images.length === 0)}
              className="btn-primary px-6"
            >
              {loading ? "Posting…" : "Post"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CreatePost;
