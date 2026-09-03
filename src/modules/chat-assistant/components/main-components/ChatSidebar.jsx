import { useState, useEffect, useRef } from "react";
import { fetchChatList, deleteJobChat } from "../../api/chatAssistantApi";

export default function ChatSidebar({ currentJobId, onSelectJob, onChatDeleted }) {
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);

  const handleMenuClick = (e, chatId) => {
    e.stopPropagation();
    if (menuOpenId === chatId) {
      setMenuOpenId(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuPos({ top: rect.top - 8, left: rect.right + 12 });
      setMenuOpenId(chatId);
    }
  };

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
      <div className="px-4 pt-3 pb-1 text-[13px] font-medium text-zinc-400">
        Recents
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-2 flex flex-col gap-0.5">
        {isLoading ? (
          <div className="space-y-2 px-2 py-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-zinc-100 rounded-xl animate-pulse"></div>
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
              className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                currentJobId === chat.jobId
                  ? "bg-zinc-100 text-zinc-900"
                  : "bg-transparent text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              <div className={`flex-1 truncate pr-6 text-[15px] ${currentJobId === chat.jobId ? 'font-medium' : 'font-normal'}`}>
                {chat.chatTitle || `${chat.company} - ${chat.jobTitle}`}
              </div>
              
              <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => handleMenuClick(e, chat.jobId)}
                  className="p-1.5 rounded-lg hover:bg-zinc-200/60 text-zinc-500 hover:text-zinc-800 transition-colors"
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
                    className="fixed z-[999] w-[180px] bg-white rounded-xl shadow-xl border border-zinc-100 py-1.5"
                    style={{ top: menuPos.top, left: menuPos.left }}
                  >
                    <button onClick={(e) => e.stopPropagation()} className="w-full text-left px-3 py-1.5 text-[13px] text-zinc-700 hover:bg-zinc-50 flex items-center gap-2.5 transition-colors">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
                      Share
                    </button>
                    <button onClick={(e) => e.stopPropagation()} className="w-full text-left px-3 py-1.5 text-[13px] text-zinc-700 hover:bg-zinc-50 flex items-center gap-2.5 transition-colors">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      Rename
                    </button>
                    <div className="h-px bg-zinc-100 my-1"></div>
                    <button onClick={(e) => e.stopPropagation()} className="w-full text-left px-3 py-1.5 text-[13px] text-zinc-700 hover:bg-zinc-50 flex items-center gap-2.5 transition-colors">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="17" x2="12" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.68V9a3 3 0 0 0-6 0v1.68a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path></svg>
                      Pin chat
                    </button>
                    <button onClick={(e) => e.stopPropagation()} className="w-full text-left px-3 py-1.5 text-[13px] text-zinc-700 hover:bg-zinc-50 flex items-center gap-2.5 transition-colors">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>
                      Archive
                    </button>
                    <button onClick={(e) => handleDelete(e, chat.jobId)} className="w-full text-left px-3 py-1.5 text-[13px] text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      Delete
                    </button>
                    <div className="h-px bg-zinc-100 my-1"></div>
                    <button onClick={(e) => e.stopPropagation()} className="w-full text-left px-3 py-1.5 text-[13px] text-zinc-700 hover:bg-zinc-50 flex items-center justify-between transition-colors">
                      <div className="flex items-center gap-2.5">
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                        Move to project
                      </div>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
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
