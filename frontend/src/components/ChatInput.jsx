import { Input } from "@/components/retroui/Input";
import { Button } from "@/components/retroui/Button";

function ChatInput() {
    return (
        <div className="p-2 flex gap-3">
            <Input placeholder="Type a message..." className="flex-1 h-12 bg-input border border-border" />
            <Button>Send</Button>
        </div>
    );
}

export default ChatInput;