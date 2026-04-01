import { Avatar } from "@/components/retroui/Avatar";
import { Text } from "@/components/retroui/Text";
import { User } from "lucide-react";

function ChatListItem({ chat, active, onClick, index }) {
    const bgClass = active
        ? "bg-white border-l-4 border-primary font-semibold"
        : index % 2 === 0
            ? "bg-gray-50 hover:bg-white"
            : "bg-white hover:bg-gray-50";

    return (
        <div
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${bgClass}`}
            onClick={onClick}
        >
            <Avatar className="h-10 w-10 border border-border">
                <Avatar.Fallback>
                    <User size={18} />
                </Avatar.Fallback>
            </Avatar>

            <div className="flex flex-col">
                <Text as="p" className="font-medium text-foreground">
                    {chat.name}
                </Text>
                <Text as="p" className="text-sm text-muted-foreground">
                    {chat.lastMessage}
                </Text>
            </div>
        </div>
    );
}

export default ChatListItem;