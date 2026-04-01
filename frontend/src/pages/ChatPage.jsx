import { useState } from "react";
import ChatList from "@/components/chat/ChatList";
import ChatWindow from "@/components/chat/ChatWindow";
import GigInfoPanel from "@/components/chat/GigInfoPanel";
import { Card } from "@/components/retroui/Card";

const chats = [
    { id: 1, name: "Alice W", lastMessage: "I'll deliver it tomorrow." },
    { id: 2, name: "John D", lastMessage: "Thanks for the update." },
];

function ChatPage() {
    const [activeChatId, setActiveChatId] = useState(1);
    const activeChat = chats.find((chat) => chat.id === activeChatId);

    return (
        <main className="h-screen flex flex-col bg-background p-4">
            <div className="flex-1 grid grid-cols-[280px_1fr_340px] gap-4">

                <Card className="overflow-hidden p-3 bg-muted rounded-md">
                    <ChatList
                        chats={chats}
                        activeChatId={activeChatId}
                        setActiveChatId={setActiveChatId}
                    />
                </Card>

                <Card className="overflow-hidden rounded-xl flex flex-col bg-card shadow-md">
                    <ChatWindow chat={activeChat} />
                </Card>

                <Card className="overflow-hidden p-1 bg-muted rounded-md">
                    <GigInfoPanel />
                </Card>

            </div>
        </main>
    );
}

export default ChatPage;