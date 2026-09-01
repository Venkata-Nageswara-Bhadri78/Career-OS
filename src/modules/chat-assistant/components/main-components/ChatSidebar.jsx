import { useState, useEffect, useRef } from "react";
import { fetchChatList, deleteJobChat } from "../../api/chatAssistantApi";

export default function ChatSidebar({ currentJobId, onSelectJob, onChatDeleted }) {
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const loadChats = async () => {
      setIsLoading(true);
      try {
        const response = await fetchChatList();
        if (response?.success) {
          setChats(response.data || []);
        }
      } catch (error) {
        console.error("Failed to load chat list:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChats();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // loadChats moved

  const handleDelete = async (e, jobId) => {
    e.stopPropagation();
    setMenuOpenId(null);
    try {
      await deleteJobChat(jobId);
      setChats(chats.filter((c) => c.jobId !== jobId));
      if (onChatDeleted) {
        onChatDeleted(jobId);
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
      alert("Failed to delete chat history.");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isLoading ? (
          <div className="space-y-2 px-2 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-zinc-200 rounded animate-pulse"></div>
            ))}
          </div>
        ) : chats.length === 0 ? (
          <div className="text-xs text-zinc-500 text-center py-6 px-2">
            No active job conversations. Click a job from the dashboard to start chatting.
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.jobId}
              onClick={() => onSelectJob(chat.jobId)}
              className={`group relative flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                currentJobId === chat.jobId
                  ? "bg-zinc-200 text-zinc-900 font-medium"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <div className="flex-1 truncate pr-6 text-[14px]">
                {chat.chatTitle || `${chat.company} - ${chat.jobTitle}`}
              </div>
              
              <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenId(menuOpenId === chat.jobId ? null : chat.jobId);
                  }}
                  className="p-1 rounded-md hover:bg-zinc-300 text-zinc-500 hover:text-zinc-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="1"></circle>
                    <circle cx="12" cy="5" r="1"></circle>
                    <circle cx="12" cy="19" r="1"></circle>
                  </svg>
                </button>
                
                {menuOpenId === chat.jobId && (
                  <div
                    ref={menuRef}
                    className="absolute right-0 top-6 z-10 w-32 bg-white rounded-md shadow-lg border border-zinc-200 py-1"
                  >
                    <button
                      onClick={(e) => handleDelete(e, chat.jobId)}
                      className="w-full text-left px-4 py-1.5 text-sm text-red-600 hover:bg-zinc-100 flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                      Clear Chat
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
