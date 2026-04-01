function MessageBubble({ message }) {
    const isMe = message.sender === "me";

    return (
        <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
            <div
                className={`px-4 py-2 rounded-lg max-w-[60%]
          ${isMe ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
            >
                {message.text}
            </div>
        </div>
    );
}

export default MessageBubble;