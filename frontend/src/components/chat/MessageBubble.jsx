import Avatar from "../common/Avatar";
import { formatChatTime } from "../../utils/timeFormat";

const MessageBubble = ({ message, isOwn }) => (
  <div className={`flex gap-2 mb-3 ${isOwn ? "flex-row-reverse" : ""}`}>
    {!isOwn && <Avatar src={message.sender?.avatar} alt={message.sender?.username} size="sm" />}
    <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
      <div
        className={`px-4 py-2.5 rounded-2xl text-sm ${
          isOwn
            ? "bg-brand-500 text-white rounded-br-md"
            : "bg-surface-800 text-white/90 rounded-bl-md"
        }`}
      >
        {message.image && (
          <img src={message.image} alt="" className="rounded-lg mb-2 max-h-48 object-cover" />
        )}
        {message.content && <p className="whitespace-pre-wrap break-words">{message.content}</p>}
      </div>
      <span className="text-[10px] text-white/30 mt-1 px-1">
        {formatChatTime(message.createdAt)}
        {isOwn && message.read && " · Seen"}
      </span>
    </div>
  </div>
);

export default MessageBubble;
