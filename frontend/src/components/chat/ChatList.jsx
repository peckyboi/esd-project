import ChatListItem from "./ChatListItem";
import { Input } from "@/components/retroui/Input";

function ChatList({ chats, activeChatId, setActiveChatId }) {
    return (
        <div className="flex flex-col h-full">
            <aside className="p-3 flex flex-col gap-3 flex-1">
                <Input placeholder="Search chats..." className="h-10 bg-white" />

                <div className="flex flex-col gap-2 overflow-y-auto mt-2">
                    {chats.map((chat, idx) => (
                        <ChatListItem
                            key={chat.id}
                            chat={chat}
                            index={idx}
                            active={chat.id === activeChatId}
                            onClick={() => setActiveChatId(chat.id)}
                        />
                    ))}
                </div>
            </aside>
        </div>
    );
}

export default ChatList;