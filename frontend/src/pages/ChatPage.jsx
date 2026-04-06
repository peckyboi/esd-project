import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import ChatList from "@/components/chat/ChatList";
import ChatWindow from "@/components/chat/ChatWindow";
import GigInfoPanel from "@/components/chat/GigInfoPanel";
import { Card } from "@/components/retroui/Card";
import {
  acceptSettlementProposal,
  createSettlementProposal,
  fetchChatBootstrap,
  fetchChatInbox,
  getLatestSettlementProposal,
  rejectSettlementProposal,
} from "@/api/disputeCompositeApi";

const fallbackGig = {
  title: "Select a dispute chat",
  freelancer: "-",
  price: "-",
  deliveryTime: "-",
  status: "unknown",
  statusMessage: "Use the chat to resolve disputes. Settlements require both parties.",
  actionPrimary: "Issue Refund",
  actionSecondary: "Release Payment",
  actionMessage: "Settlement requests can be accepted or rejected by the counterparty.",
};

const mapBootstrapMessage = (msg, idx) => ({
  id: msg.messageId ?? msg.message_id ?? `${msg.chat_id ?? msg.chatId ?? "chat"}-${idx}`,
  senderId: msg.senderId ?? msg.sender_id,
  text: msg.content ?? msg.message_text ?? "",
  timestamp: msg.createdAt ?? msg.created_at ?? null,
  chatId: msg.chatId ?? msg.chat_id,
});

const isNotFoundError = (error) => {
  const message = String(error?.message || "");
  return /^\[404\]/.test(message) || message.includes("No settlement proposal found");
};

async function fetchUserName(userId) {
  try {
    const res = await fetch(
      `https://personal-43hivjqa.outsystemscloud.com/User/rest/User/user/${userId}/`
    );
    const json = await res.json();
    const user = json?.data?.user ?? json?.data ?? json;
    return user?.displayName ?? user?.display_name ?? null;
  } catch {
    return null;
  }
}

function ChatPage({ currentUserId }) {
  const [searchParams] = useSearchParams();
  const wsRef = useRef(null);
  const latestProposalRef = useRef(null);

  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [gig, setGig] = useState(fallbackGig);
  const [latestProposal, setLatestProposal] = useState(null);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [busyAction, setBusyAction] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    latestProposalRef.current = latestProposal;
  }, [latestProposal]);

  const activeChat = useMemo(
    () => chats.find((chat) => String(chat.id) === String(activeChatId)) || null,
    [chats, activeChatId],
  );

  const refreshInbox = useCallback(async () => {
    if (!currentUserId) return;
    setLoadingChats(true);
    try {
      const data = await fetchChatInbox(currentUserId);
      const mapped = data.map((item) => ({
        id: item.chat_id,
        orderId: item.order_id,
        chatStatus: item.chat_status,
        orderStatus: item.order_status,
        otherUserId: item.other_user_id,
        name: `User ${item.other_user_id}`,
        lastMessage: `${item.chat_status.toLowerCase()} • ${item.order_status}`,
      }));

      setChats(mapped);

      const names = await Promise.all(
        mapped.map((item) => fetchUserName(item.otherUserId))
      );
      setChats(
        mapped.map((item, i) => ({
          ...item,
          name: names[i] ?? `User ${item.otherUserId}`,
          displayName: names[i]
            ? `${names[i]} (ID: ${item.otherUserId})`
            : `User ${item.otherUserId}`,
        }))
      );

      const queryChatId = searchParams.get("chatId");
      const queryOrderId = searchParams.get("orderId");

      if (queryChatId && mapped.some((c) => String(c.id) === String(queryChatId))) {
        setActiveChatId(Number(queryChatId));
      } else if (queryOrderId) {
        const match = mapped.find((c) => String(c.orderId) === String(queryOrderId));
        if (match) {
          setActiveChatId(match.id);
        } else if (mapped.length > 0) {
          setActiveChatId((prev) => prev ?? mapped[0].id);
        }
      } else if (mapped.length > 0) {
        setActiveChatId((prev) => prev ?? mapped[0].id);
      } else {
        setActiveChatId(null);
      }
    } catch (error) {
      console.error("Failed to load chat inbox:", error);
      setChats([]);
      setActiveChatId(null);
    } finally {
      setLoadingChats(false);
    }
  }, [currentUserId, searchParams]);

  useEffect(() => {
    refreshInbox();
  }, [refreshInbox]);

  useEffect(() => {
    if (!activeChatId || !currentUserId) {
      setMessages([]);
      setLatestProposal(null);
      setGig(fallbackGig);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    let cancelled = false;

    const loadBootstrapAndConnect = async () => {
      setLoadingMessages(true);
      try {
        const bootstrap = await fetchChatBootstrap(activeChatId, currentUserId);
        if (cancelled) return;

        const mappedMessages = (bootstrap.messages || []).map(mapBootstrapMessage);
        setMessages(mappedMessages);
        setLatestProposal(bootstrap.latest_proposal || null);

        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }

        const ws = new WebSocket(bootstrap.ws_url);
        wsRef.current = ws;

        ws.onopen = () => {
          ws.send(JSON.stringify({ type: "join_conversation" }));
        };

        ws.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload.type !== "receive_message") return;
            setMessages((prev) => {
              const normalized = {
                id: payload.messageId ?? payload.id,
                senderId: payload.senderId ?? payload.sender_id,
                text: payload.content ?? payload.message_text ?? "",
                timestamp: payload.createdAt ?? payload.created_at ?? null,
                chatId: payload.chatId ?? payload.chat_id ?? activeChatId,
              };
              if (prev.some((m) => String(m.id) === String(normalized.id))) {
                return prev;
              }
              return [...prev, normalized];
            });
          } catch (error) {
            console.error("Invalid websocket payload:", error);
          }
        };

        ws.onerror = (err) => {
          console.error("WebSocket error:", err);
        };
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to bootstrap chat:", error);
          setMessages([]);
          setLatestProposal(null);
        }
      } finally {
        if (!cancelled) setLoadingMessages(false);
      }
    };

    loadBootstrapAndConnect();

    return () => {
      cancelled = true;
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [activeChatId, currentUserId]);

  useEffect(() => {
    if (!activeChat) {
      setGig(fallbackGig);
      return;
    }

    const isClosed = activeChat.chatStatus !== "OPEN";
    const pending = latestProposal?.status === "PENDING" ? latestProposal : null;
    const waitingForMe = pending && Number(pending.proposer_id) !== Number(currentUserId);
    const waitingForOther = pending && Number(pending.proposer_id) === Number(currentUserId);

    let actionPrimary = "Issue Refund";
    let actionSecondary = "Release Payment";
    let actionMessage = "Settlement requests can be accepted or rejected by the counterparty.";

    if (isClosed) {
      actionPrimary = "Dispute Closed";
      actionSecondary = "No Further Action";
      actionMessage = "This dispute has been settled. Chat is now read-only.";
    } else if (waitingForMe) {
      actionPrimary = "Accept Proposal";
      actionSecondary = "Reject Proposal";
      actionMessage = `Pending ${pending.action.toLowerCase()} proposal from other party.`;
    } else if (waitingForOther) {
      actionPrimary = `Requested ${pending.action.toLowerCase()}`;
      actionSecondary = "Awaiting Response";
      actionMessage = "Waiting for counterparty to accept or reject your proposal.";
    }

    setGig({
      title: `Order #${activeChat.orderId}`,
      freelancer: activeChat.name,
      price: "-",
      deliveryTime: "-",
      status: activeChat.orderStatus || "unknown",
      statusMessage: `Chat ${activeChat.chatStatus.toLowerCase()} • Order ${activeChat.orderStatus}`,
      actionPrimary,
      actionSecondary,
      actionMessage,
    });
  }, [activeChat, latestProposal, currentUserId]);

  useEffect(() => {
    if (!activeChat?.orderId || !currentUserId) return;

    let cancelled = false;

    const pollLatestProposal = async () => {
      try {
        const proposal = await getLatestSettlementProposal(activeChat.orderId);
        if (cancelled) return;

        if (!proposal) {
          if (latestProposalRef.current) {
            setLatestProposal(null);
          }
          return;
        }

        const prev = latestProposalRef.current;
        const changed =
          !prev ||
          Number(prev.id) !== Number(proposal.id) ||
          String(prev.status) !== String(proposal.status) ||
          Number(prev.responder_id || 0) !== Number(proposal.responder_id || 0);

        if (changed) {
          setLatestProposal(proposal);

          if (proposal.status === "EXECUTED" || proposal.status === "REJECTED") {
            await refreshInbox();
          }
        }
      } catch (error) {
        if (isNotFoundError(error)) {
          if (latestProposalRef.current) {
            setLatestProposal(null);
          }
          return;
        }
        console.error("Failed polling latest settlement proposal:", error);
      }
    };

    pollLatestProposal();
    const intervalId = setInterval(pollLatestProposal, 2500);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [activeChat?.orderId, currentUserId, refreshInbox]);

  const handleSendMessage = useCallback(
    (content) => {
      const ws = wsRef.current;
      if (!activeChatId || !currentUserId || !ws || ws.readyState !== WebSocket.OPEN) {
        console.error("Cannot send message: socket not connected.");
        return;
      }
      const trimmed = String(content || "").trim();
      if (!trimmed) return;
      ws.send(
        JSON.stringify({
          type: "send_message",
          senderId: currentUserId,
          content: trimmed,
        }),
      );
    },
    [activeChatId, currentUserId],
  );

  const handleCreateProposal = useCallback(
    async (action) => {
      if (!activeChat || busyAction) return;
      setBusyAction(true);
      try {
        const proposal = await createSettlementProposal(activeChat.orderId, {
          proposer_id: currentUserId,
          action,
          amount: null,
        });
        setLatestProposal(proposal);
      } catch (error) {
        console.error(`Failed to create ${action} proposal:`, error);
      } finally {
        setBusyAction(false);
      }
    },
    [activeChat, busyAction, currentUserId],
  );

  const handleAcceptProposal = useCallback(async () => {
    if (!activeChat || !latestProposal || busyAction) return;
    setBusyAction(true);
    try {
      const result = await acceptSettlementProposal(
        activeChat.orderId,
        latestProposal.id,
        currentUserId,
      );
      setLatestProposal(result.proposal);
      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChat.id
            ? { ...c, chatStatus: "CLOSED", orderStatus: result.order?.status || c.orderStatus, lastMessage: `closed • ${result.order?.status || c.orderStatus}` }
            : c,
        ),
      );
      await refreshInbox();
    } catch (error) {
      console.error("Failed to accept settlement proposal:", error);
    } finally {
      setBusyAction(false);
    }
  }, [activeChat, latestProposal, busyAction, currentUserId, refreshInbox]);

  const handleRejectProposal = useCallback(async () => {
    if (!activeChat || !latestProposal || busyAction) return;
    setBusyAction(true);
    try {
      const proposal = await rejectSettlementProposal(
        activeChat.orderId,
        latestProposal.id,
        currentUserId,
      );
      setLatestProposal(proposal);
      await refreshInbox();
    } catch (error) {
      console.error("Failed to reject settlement proposal:", error);
    } finally {
      setBusyAction(false);
    }
  }, [activeChat, latestProposal, busyAction, currentUserId, refreshInbox]);

  const panelActions = useMemo(() => {
    if (!activeChat) {
      return { onPrimary: null, onSecondary: null, secondaryDisabled: true, inputDisabled: true };
    }

    const isClosed = activeChat.chatStatus !== "OPEN";
    const pending = latestProposal?.status === "PENDING" ? latestProposal : null;

    if (isClosed) {
      return { onPrimary: null, onSecondary: null, secondaryDisabled: true, inputDisabled: true };
    }

    if (pending) {
      const proposedByMe = Number(pending.proposer_id) === Number(currentUserId);
      if (proposedByMe) {
        return { onPrimary: null, onSecondary: null, secondaryDisabled: true, inputDisabled: false };
      }
      return {
        onPrimary: handleAcceptProposal,
        onSecondary: handleRejectProposal,
        secondaryDisabled: false,
        inputDisabled: false,
      };
    }

    return {
      onPrimary: () => handleCreateProposal("REFUND"),
      onSecondary: () => handleCreateProposal("RELEASE"),
      secondaryDisabled: false,
      inputDisabled: false,
    };
  }, [
    activeChat,
    latestProposal,
    currentUserId,
    handleAcceptProposal,
    handleRejectProposal,
    handleCreateProposal,
  ]);

  return (
    <main className="h-screen flex flex-col bg-background p-4">
      <div
        className={`flex-1 grid gap-4 min-h-0 ${showPanel ? "grid-cols-[340px_1fr]" : "grid-cols-[280px_1fr]"}`}
      >
        {showPanel ? (
          <Card className="overflow-hidden p-1 bg-muted rounded-md">
            <GigInfoPanel
              gig={gig}
              onPrimaryAction={panelActions.onPrimary}
              onSecondaryAction={panelActions.onSecondary}
              secondaryDisabled={panelActions.secondaryDisabled || busyAction}
            />
          </Card>
        ) : (
          <Card>
            <ChatList chats={chats} activeChatId={activeChatId} onSelectChat={setActiveChatId} />
            {loadingChats && <div className="p-4 text-sm text-muted-foreground">Loading chats...</div>}
          </Card>
        )}

        <div className="relative flex flex-col min-h-0 h-full">
          <button
            onClick={() => setShowPanel((prev) => !prev)}
            className="absolute top-[10px] right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold bg-white text-black border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all duration-100"
            title={showPanel ? "Hide details panel" : "Show details panel"}
          >
            {showPanel ? "Hide Details" : "Show Details"}
          </button>

          <Card className="overflow-hidden rounded-xl flex flex-col bg-card shadow-md h-full min-h-0">
            <ChatWindow
              chat={activeChat ? { ...activeChat, messages } : null}
              currentUserId={currentUserId}
              messages={messages}
              loading={loadingMessages}
              onSendMessage={handleSendMessage}
              inputDisabled={panelActions.inputDisabled}
            />
          </Card>
        </div>

      </div>
    </main>
  );
}

export default ChatPage;
