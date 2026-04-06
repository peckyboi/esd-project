import { Avatar } from "@/components/retroui/Avatar";
import { Text } from "@/components/retroui/Text";
import { User } from "lucide-react";

function ChatListItem({ chat, active, onClick, index }) {
    const bgClass = active
        ? "bg-primary/10 border-l-4 border-primary font-semibold"
        : "bg-transparent hover:bg-gray-100";

    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-3 w-full p-3 transition-colors text-left rounded-r-lg ${bgClass}`}
        >
            <Avatar className="h-10 w-10 border border-border">
                <Avatar.Fallback>
                    <User size={18} />
                </Avatar.Fallback>
            </Avatar>

            <div className="flex flex-col overflow-hidden">
                <Text
                    as="p"
                    className={`font-medium text-foreground truncate`}
                >
                    {chat.displayName ?? chat.name}
                </Text>
                <Text
                    as="p"
                    className="text-sm text-muted-foreground truncate"
                >
                    {chat.lastMessage}
                </Text>
            </div>
        </button>
    );
}

export default ChatListItem;