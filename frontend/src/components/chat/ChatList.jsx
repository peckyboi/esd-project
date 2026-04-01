import { Text } from "@/components/retroui/Text";
import ChatListItem from "./ChatListItem";

export default function ChatList({ chats, activeChatId, onSelectChat }) {
    return (
        <div className="flex flex-col w-full h-full border-r border-border bg-white overflow-y-auto">
            <div className="p-4 border-b border-border bg-primary">
                <Text as="h3" className="font-semibold text-lg">
                    Chats
                </Text>
            </div>

            <div className="flex flex-col">
                {chats.map((chat, index) => (
                    <ChatListItem
                        key={chat.id}
                        chat={chat}
                        index={index}
                        active={chat.id === activeChatId}
                        onClick={() => onSelectChat(chat.id)}
                    />
                ))}
            </div>
        </div>
    );
}