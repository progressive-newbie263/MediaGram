import Avatar from "../common/Avatar";
import { formatChatTime, truncate } from "../../utils/timeFormat";
import useChatStore from "../../store/chatStore";

const ChatSidebar = ({ activeId, onSelect }) => {
  const { conversations, isOnline } = useChatStore();

  return (
    <div className="w-full lg:w-80 border-r border-white/5 flex flex-col h-full">
      <div className="p-4 border-b border-white/5">
        <h2 className="text-xl font-bold">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <p className="text-white/40 text-sm text-center py-8 px-4">
            No conversations yet. Message someone from their profile!
          </p>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left ${
                activeId === conv.id ? "bg-brand-500/10 border-r-2 border-brand-500" : ""
              }`}
            >
              <Avatar
                src={conv.participant?.avatar}
                alt={conv.participant?.username}
                size="md"
                online={isOnline(conv.participant?.id)}
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline gap-2">
                  <span className="font-semibold text-sm truncate">
                    {conv.participant?.displayName || conv.participant?.username}
                  </span>
                  {conv.lastMessage && (
                    <span className="text-[10px] text-white/30 flex-shrink-0">
                      {formatChatTime(conv.lastMessage.createdAt)}
                    </span>
                  )}
                </div>
                <p className="text-white/40 text-xs truncate">
                  {conv.lastMessage?.content
                    ? truncate(conv.lastMessage.content, 40)
                    : "Start a conversation"}
                </p>
              </div>
              {conv.unreadCount > 0 && (
                <span className="notif-badge">{conv.unreadCount}</span>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
