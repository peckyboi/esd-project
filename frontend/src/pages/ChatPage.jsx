import React, { useState, useEffect, useCallback } from 'react';
import { socket } from "@/lib/socket";

import ChatList from "@/components/chat/ChatList";
import ChatWindow from "@/components/chat/ChatWindow";
import GigInfoPanel from "@/components/chat/GigInfoPanel";
import { Card } from "@/components/retroui/Card";

const API_BASE_URL = "http://localhost:8090";

const fallbackGig = {
  title: "Loading gig details...",
  freelancer: "Loading...",
  price: "-",
  deliveryTime: "-",
  status: "active",
  statusMessage: "Select a chat to view details.",
  actionPrimary: "Resolve Dispute",
  actionSecondary: "Issue Refund",
  actionMessage: "Disputes are handled through direct communication. If unresolved, refund is processed.",
};

function ChatPage({ currentUserId, currentUserRole }) {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [gig, setGig] = useState(fallbackGig);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showPanel, setShowPanel] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoadingChats(true);

        const response = await fetch(`${API_BASE_URL}/users/${currentUserId}/chats`);
        if (!response.ok) {
          throw new Error(`Failed to fetch chats: ${response.status}`);
        }

        const data = await response.json();

        const mappedChats = data.map((room) => {
          const isUser1 = String(room.userId1) === String(currentUserId);
          const otherUserId = isUser1 ? room.userId2 : room.userId1;
              
          return {
            id: room.chatId,
            name: otherUserId !== undefined ? String(otherUserId) : "Unknown",
            lastMessage: room.status || "No messages yet",
            raw: room,
          };
        });
        
        console.log("Mapped chats:", mappedChats);
        setChats(mappedChats);

        if (mappedChats.length > 0) {
          setActiveChatId((prev) => prev ?? mappedChats[0].id);
        }
      } catch (error) {
        console.error("Error fetching chats:", error);
        setChats([]);
      } finally {
        setLoadingChats(false);
      }
    };

    fetchChats();
  }, [currentUserId]);

  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      setGig(fallbackGig);
      return;
    }

    const fetchChatMessages = async () => {
      try {
        setLoadingMessages(true);

        const response = await fetch(`${API_BASE_URL}/chats/${activeChatId}/messages`);
        if (!response.ok) {
          throw new Error(`Failed to fetch messages: ${response.status}`);
        }

        const data = await response.json();

        const mappedMessages = data.map((msg) => ({
          id: msg.message_id,
          senderId: msg.sender_id,
          text: msg.message_text,
          timestamp: msg.created_at,
          chatId: msg.chat_id,
        }));

        setMessages(mappedMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchChatMessages();
  }, [activeChatId]);

  useEffect(() => {
    const activeChat = chats.find((chat) => String(chat.id) === String(activeChatId));

    if (!activeChat) {
      setGig(fallbackGig);
      return;
    }

    setGig({
      title: `Order #${activeChat.raw.orderId ?? "-"}`,
      freelancer: activeChat.name,
      price: "-",
      deliveryTime: "-",
      status: activeChat.raw.status || "active",
      statusMessage: "Chat details loaded. Gig details endpoint can be connected next.",
      actionPrimary: "Resolve Dispute",
      actionSecondary: "Issue Refund",
      actionMessage: "Disputes are handled through direct communication. If unresolved, refund is processed.",
    });
  }, [activeChatId, chats]);

  const activeChat = chats.find((chat) => String(chat.id) === String(activeChatId));

  const activeChatWithMessages = activeChat
    ? {
        ...activeChat,
        messages,
      }
    : null;

  // 1. Join room when active chat changes
  useEffect(() => {
    if (!activeChatId || !currentUserId) return;

    socket.emit("join_conversation", {
      chatId: activeChatId,
      userId: currentUserId,
      role: currentUserRole || "user",
    });

    console.log("Joining room:", activeChatId);
  }, [activeChatId, currentUserId, currentUserRole]);


  // 2. Listen for incoming messages
  useEffect(() => {
    const handleReceiveMessage = (message) => {
      console.log("Received message:", message);
      if (String(message.chatId) === String(activeChatId)) {
        setMessages((prev) => {
          const exists = prev.some((m) => String(m.id) === String(message.id));
          if (exists) return prev;
          return [...prev, {
            id: message.id,
            senderId: message.senderId,
            text: message.content,
            timestamp: message.createdAt,
            chatId: message.chatId,
          }];
        });
      }
    };

    const handleSocketError = (err) => {
      console.error("Socket error:", err);
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("socket_error", handleSocketError);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("socket_error", handleSocketError);
    };
  }, [activeChatId]);


  // 3. Send message handler
  const handleSendMessage = useCallback((content) => {
    console.log("handleSendMessage called with:", content);
    console.log("activeChatId:", activeChatId);
    console.log("currentUserId:", currentUserId);
    console.log("socket connected:", socket.connected);
  
    if (!activeChatId || !currentUserId) {
      console.error("Cannot send: missing chatId or userId");
      return;
    }
  
    const trimmed = String(content || "").trim();
    if (!trimmed) {
      console.error("Cannot send: empty content");
      return;
    }
  
    socket.emit("send_message", {
      chatId: activeChatId,
      userId: currentUserId,
      role: currentUserRole || "user",
      content: trimmed,
    });
  
    console.log("Emitted send_message");
  }, [activeChatId, currentUserId, currentUserRole]);

  return (
    <main className="h-screen flex flex-col bg-background p-4">
      <div
        className={`flex-1 grid gap-4 min-h-0 ${
          showPanel ? "grid-cols-[280px_1fr_340px]" : "grid-cols-[280px_1fr]"
        }`}
      >
        <Card>
          <ChatList
            chats={chats}
            activeChatId={activeChatId}
            onSelectChat={setActiveChatId}
          />
          {loadingChats && <div className="p-4 text-sm text-muted-foreground">Loading chats...</div>}
        </Card>

        <div className="relative flex flex-col min-h-0 h-full">
          {/* Toggle button — top right corner of chat column */}
          <button
            onClick={() => setShowPanel((prev) => !prev)}
            className="absolute top-[10px] right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 text-sm 
            font-semibold bg-white text-black border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] 
            hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all duration-100"
            title={showPanel ? "Hide details panel" : "Show details panel"}
          >
            {showPanel ? (
              // Panel-close icon
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M15 3v18"/><path d="m17 9 3 3-3 3"/>
              </svg>
            ) : (
              // Panel-open icon
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M15 3v18"/><path d="m21 15-3-3 3-3"/>
              </svg>
            )}
            {showPanel ? "Hide Details" : "Show Details"}
          </button>

        <Card className="overflow-hidden rounded-xl flex flex-col bg-card shadow-md h-full min-h-0">
          <ChatWindow
            chat={activeChatWithMessages}
            currentUserId={currentUserId}
            messages={messages}
            loading={loadingMessages}
            // onSendMessage={handleSendMessage}
          />
        </Card>
      </div>
      {showPanel && (
        <Card className="overflow-hidden p-1 bg-muted rounded-md">
          <GigInfoPanel gig={gig} />
        </Card>
      )}
      </div>
    </main>
  );
}

export default ChatPage;