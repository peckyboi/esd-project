import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
const socket = io("http://localhost:5000"); 

// ---------------------------------------------------------
// COMPONENT 1: Create Chat Popup (The "PopUp" Widget)
// ---------------------------------------------------------
const CreateChatPopup = ({ currentUserId, onClose, onChatCreated }) => {
    const [targetUsername, setTargetUsername] = useState("");

    const handleConfirm = async () => {
        try {
            const response = await fetch('http://localhost:5000/disputes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order_id: 0,
                    user_id: currentUserId,
                    freelancer_id: targetUsername
                })
            });

            if (response.ok) {
                alert("Chat created successfully!");
                onChatCreated(); // Trigger parent to refresh data
                onClose();       // Hide popup
            } else {
                alert("Error creating chat. User may not exist.");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <div style={{ position: 'fixed', top: '30%', left: '40%', background: 'white', padding: '20px', border: '1px solid black', zIndex: 100 }}>
            <h3>Create New Chat</h3>
            <input 
                type="text" 
                placeholder="Enter Username" 
                value={targetUsername} 
                onChange={(e) => setTargetUsername(e.target.value)} 
            />
            <div style={{ marginTop: '10px' }}>
                <button onClick={onClose} style={{ marginRight: '10px' }}>Cancel</button>
                <button onClick={handleConfirm}>Confirm</button>
            </div>
        </div>
    );
};

// ---------------------------------------------------------
// COMPONENT 2: Sidebar List (The "List" Widget)
// ---------------------------------------------------------
const SidebarList = ({ rooms, onRoomClick }) => {
    return (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
            {rooms.map((room) => (
                <li 
                    key={room.chatId} 
                    onClick={() => onRoomClick(room.chatId)}
                    style={{ padding: '15px', cursor: 'pointer', borderBottom: '1px solid #eee', background: '#f9f9f9' }}
                >
                    <strong>Chat with:</strong> {room.freelancerId}
                </li>
            ))}
        </ul>
    );
};

// ---------------------------------------------------------
// COMPONENT 3: Chat Window (The "ChatWindow" Block)
// ---------------------------------------------------------
const ChatWindow = ({ activeChatId, currentUserId }) => {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");

    useEffect(() => {
        // Connect to your node.js chat microservice
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        // Tell backend to join the socket room
        newSocket.emit('join_room', { chat_id: activeChatId });

        // Listen for new incoming messages
        newSocket.on('receive_message', (msg) => {
            setMessages((prevMessages) => [...prevMessages, msg]);
        });

        // Cleanup connection when the user switches rooms
        return () => newSocket.close();
    }, [activeChatId]); 

    const handleSend = () => {
        if (inputText.trim() && socket) {
            socket.emit('send_message', {
                chat_id: activeChatId,
                sender_id: currentUserId,
                text: inputText
            });
            setInputText("");
        }
    };

    // Helper function to format the timestamp
    const formatTime = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };


    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h2>Chat Room: {activeChatId}</h2>
            
            {/* Message Display Area */}
            <div style={{ flexGrow: 1, overflowY: 'auto', border: '1px solid #ccc', padding: '10px', marginBottom: '10px', background: '#fff' }}>
                {messages.map((msg, index) => (
                    <div key={index} style={{ marginBottom: '10px', textAlign: msg.SenderId === currentUserId ? 'right' : 'left' }}>
                        <strong>{msg.SenderId}: </strong> 
                        <span style={{ background: msg.SenderId === currentUserId ? '#dcf8c6' : '#eee', padding: '5px 10px', borderRadius: '10px' }}>
                            {msg.MessageText}
                        </span>
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <div style={{ display: 'flex' }}>
                <input 
                    type="text" 
                    value={inputText} 
                    onChange={(e) => setInputText(e.target.value)} 
                    placeholder="Type a message..."
                    style={{ flexGrow: 1, padding: '10px' }}
                />
                <button onClick={handleSend} style={{ padding: '10px 20px', marginLeft: '10px' }}>Send</button>
            </div>
        </div>
    );
};

// ---------------------------------------------------------
// MAIN COMPONENT: The Screen (The "TestChat" Screen)
// ---------------------------------------------------------
const ChatApp = () => {
    // For testing purposes, hardcode a user ID, or pass this down from your App's login state
    const currentUserId = "User123"; 

    const [roomList, setRoomList] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [showPopup, setShowPopup] = useState(false);

    // Fetch Data Action
    const fetchRooms = async () => {
        try {
            const response = await fetch(`http://localhost:5000/disputes/${currentUserId}`);
            const data = await response.json();
            setRoomList(data);
        } catch (error) {
            console.error("Error fetching rooms:", error);
        }
    };

    // Run Data Action on Load
    useEffect(() => {
        fetchRooms();
    }, [currentUserId]);

    return (
        <div style={{ display: 'flex', height: '80vh', fontFamily: 'Arial, sans-serif' }}>
            
            {/* Columns 2: Left Column (3 Col) */}
            <div style={{ width: '25%', borderRight: '1px solid #ccc', padding: '10px', background: '#f4f4f4' }}>
                <button 
                    onClick={() => setShowPopup(true)}
                    style={{ width: '100%', padding: '10px', marginBottom: '20px', background: '#0056b3', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                    + Create New Chat
                </button>
                <SidebarList rooms={roomList} onRoomClick={setActiveChatId} />
            </div>

            {/* Columns 2: Right Column (9 Col) */}
            <div style={{ width: '75%', padding: '20px', background: '#fafafa' }}>
                {activeChatId ? (
                    <ChatWindow activeChatId={activeChatId} currentUserId={currentUserId} />
                ) : (
                    <div style={{ textAlign: 'center', marginTop: '20%', color: '#888' }}>
                        <h2>Select a chat from the sidebar</h2>
                        <p>Or create a new one to start messaging.</p>
                    </div>
                )}
            </div>

            {/* Popup Overlay */}
            {showPopup && (
                <CreateChatPopup 
                    currentUserId={currentUserId} 
                    onClose={() => setShowPopup(false)} 
                    onChatCreated={fetchRooms} 
                />
            )}
        </div>
    );
};

export default ChatApp;