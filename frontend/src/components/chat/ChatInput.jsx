import { useState } from "react";
import { Input } from "@/components/retroui/Input";
import { Button } from "@/components/retroui/Button";

function ChatInput({ onSendMessage }) {
  const [text, setText] = useState("");

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setText("");  // clear input after sending
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-2 flex gap-3">
      <Input
        placeholder="Type a message..."
        className="flex-1 h-12 bg-input border border-border"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <Button onClick={handleSend}>Send</Button>
    </div>
  );
}

export default ChatInput;