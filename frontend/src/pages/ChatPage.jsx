import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

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

function ChatPage() {
  const [currentUserId] = useState("User123");
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [gig, setGig] = useState(fallbackGig);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

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
          const otherUserId =
            String(room.userId1) === String(currentUserId)
              ? room.userId2
              : room.userId1;

        console.log("Fetched chats:", data)

          return {
            id: room.chatId,
            name: otherUserId,
            lastMessage: room.status || "No messages yet",
            raw: room,
          };
        });

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

        const mappedMessages = data.map((msg, index) => ({
          id: `${msg.ChatId}-${index}-${msg.Timestamp}`,
          senderId: msg.SenderId,
          text: msg.MessageText,
          timestamp: msg.Timestamp,
          chatId: msg.ChatId,
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
    const activeChat = chats.find((chat) => chat.id === activeChatId);

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

  const activeChat = chats.find((chat) => chat.id === activeChatId);

  const activeChatWithMessages = activeChat
    ? {
        ...activeChat,
        messages,
      }
    : null;

  return (
    <main className="h-screen flex flex-col bg-background p-4">
      <div className="flex-1 grid grid-cols-[280px_1fr_340px] gap-4">
        <Card>
          <ChatList
            chats={chats}
            activeChatId={activeChatId}
            onSelectChat={setActiveChatId}
          />
          {loadingChats && <div className="p-4 text-sm text-muted-foreground">Loading chats...</div>}
        </Card>

        <Card className="overflow-hidden rounded-xl flex flex-col bg-card shadow-md">
          <ChatWindow
            chat={activeChatWithMessages}
            currentUserId={currentUserId}
            messages={messages}
            loading={loadingMessages}
          />
        </Card>

        <Card className="overflow-hidden p-1 bg-muted rounded-md">
          <GigInfoPanel gig={gig} />
        </Card>
      </div>
    </main>
  );
}

export default ChatPage;