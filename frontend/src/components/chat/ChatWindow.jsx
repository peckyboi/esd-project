import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import { Text } from "@/components/retroui/Text";

const messages = {
    1: [
        { id: 1, sender: "other", text: "Hi! Any update on the order?" },
        { id: 2, sender: "me", text: "Yes! I'm finishing it today." },
    ],
    2: [
        { id: 1, sender: "other", text: "Hello! Can we discuss the payment?" },
        { id: 2, sender: "me", text: "Sure, let's talk now." },
    ],
};

function ChatWindow({ chat }) {
    if (!chat)
        return (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Select a chat
            </div>
        );

    const chatMessages = messages[chat.id] || [];

    return (
        <section className="flex flex-col h-full w-full">
            <header className="px-6 py-4 bg-primary w-full">
                <Text as="p" className="font-semibold text-lg text-primary-foreground">
                    Chat with {chat.name}
                </Text>
            </header>

            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-white w-full">
                {chatMessages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}
            </div>

            <div className="p-4 bg-card border-t border-border bg-muted w-full">
                <ChatInput />
            </div>
        </section>
    );
}

export default ChatWindow;