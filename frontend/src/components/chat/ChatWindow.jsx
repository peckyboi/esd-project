import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import { Text } from "@/components/retroui/Text";

function ChatWindow({
  chat,
  messages = [],
  currentUserId,
  loading = false,
  onSendMessage,
  inputDisabled = false,
}) {

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Select a chat
      </div>
    );
  }

  const chatMessages = messages.map((msg) => ({
    id: msg.id,
    sender: String(msg.senderId) === String(currentUserId) ? "me" : "other",
    text: msg.text,
    timestamp: msg.timestamp,
  }));

  return (
    <section className="flex flex-col h-full w-full">
      <header className="px-6 py-4 bg-primary w-full">
        <Text as="p" className="font-semibold text-lg text-primary-foreground">
          Chat with {chat.name}
        </Text>
      </header>

      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-white w-full">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading messages...</div>
        ) : chatMessages.length === 0 ? (
          <div className="text-sm text-muted-foreground">No messages yet.</div>
        ) : (
          chatMessages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}
      </div>

      <div className="p-4 bg-card border-t border-border bg-muted w-full">
        <ChatInput onSendMessage={onSendMessage} disabled={inputDisabled} />
      </div>
    </section>
  );
}

export default ChatWindow;
