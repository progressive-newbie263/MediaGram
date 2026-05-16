import { useEffect } from "react";
import { useParams } from "react-router-dom";
import ChatSidebar from "../components/chat/ChatSidebar";
import ChatWindow from "../components/chat/ChatWindow";
import useChatStore from "../store/chatStore";

const ChatPage = () => {
  const { userId } = useParams();
  const {
    activeConversation,
    fetchConversations,
    setActiveConversation,
    openConversationWith,
  } = useChatStore();

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (userId) openConversationWith(userId);
  }, [userId]);

  return (
    <div className="flex h-[calc(100vh-64px)] lg:h-screen max-w-4xl mx-auto">
      <div className={`${activeConversation ? "hidden lg:flex" : "flex"} flex-col w-full lg:w-80`}>
        <ChatSidebar
          activeId={activeConversation?.id}
          onSelect={setActiveConversation}
        />
      </div>
      <div className={`flex-1 ${!activeConversation ? "hidden lg:flex" : "flex"}`}>
        <ChatWindow conversation={activeConversation} />
        {activeConversation && (
          <button
            type="button"
            className="lg:hidden fixed top-16 left-4 z-20 btn-secondary text-xs py-1 px-2"
            onClick={() => setActiveConversation(null)}
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
