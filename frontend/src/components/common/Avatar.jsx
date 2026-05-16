const Avatar = ({ src, alt = "user", size = "md", online = false, className = "" }) => {
  const sizes = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
    "2xl": "w-24 h-24",
  };

  const fallback = `https://api.dicebear.com/7.x/avataaars/svg?seed=${alt}`;

  return (
    <div className={`relative inline-block flex-shrink-0 ${className}`}>
      <img
        src={src || fallback}
        alt={alt}
        className={`${sizes[size]} rounded-full object-cover ring-2 ring-surface-800`}
        onError={(e) => { e.target.src = fallback; }}
      />
      {online && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full ring-2 ring-surface-900" />
      )}
    </div>
  );
};

export default Avatar;
