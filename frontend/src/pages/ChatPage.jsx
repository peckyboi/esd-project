import { useState } from "react";
import ChatList from "@/components/chat/ChatList";
import ChatWindow from "@/components/chat/ChatWindow";
import GigInfoPanel from "@/components/chat/GigInfoPanel";
import { Card } from "@/components/retroui/Card";

const chats = [
    { id: 1, name: "Alice W", lastMessage: "I'll deliver it tomorrow." },
    { id: 2, name: "John D", lastMessage: "Thanks for the update." },
];

const gig = {
    title: "SaaS Web App Development",
    freelancer: "Alice W",
    price: 250,
    deliveryTime: "3 days",
    status: "disputed",
    statusMessage: "Client has raised a dispute. Resolve through chat or issue a refund.",
    actionPrimary: "Resolve via Chat",
    actionSecondary: "Issue Refund",
    actionMessage: "Disputes are handled through direct communication. If unresolved, refund is processed."
};

function ChatPage() {
    const [activeChatId, setActiveChatId] = useState(1);
    const activeChat = chats.find((chat) => chat.id === activeChatId);

    return (
        <main className="h-screen flex flex-col bg-background p-4">
            <div className="flex-1 grid grid-cols-[280px_1fr_340px] gap-4">

                <Card>
                    <ChatList
                        chats={chats}
                        activeChatId={activeChatId}
                        onSelectChat={setActiveChatId}
                    />
                </Card>

                <Card className="overflow-hidden rounded-xl flex flex-col bg-card shadow-md">
                    <ChatWindow chat={activeChat} />
                </Card>

                <Card className="overflow-hidden p-1 bg-muted rounded-md">
                    <GigInfoPanel gig={gig} />
                </Card>

            </div>
        </main>
    );
}

export default ChatPage;