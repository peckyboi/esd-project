const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const mysql = require("mysql2/promise");

const app = express();
app.use(cors());
app.use(express.json());

// ─── DB Connection Pool ───────────────────────────────────────────────────────
const db = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",       // chat-db
  port: parseInt(process.env.DB_PORT) || 3312,  // 3306
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "chat_db",
  waitForConnections: true,
  connectionLimit: 10,
});

// Test DB connection on startup
db.getConnection()
  .then((conn) => {
    console.log("Connected to chat_db");
    conn.release();
  })
  .catch((err) => {
    console.error("Failed to connect to chat_db:", err.message);
  });

// ─── Auth Middleware ──────────────────────────────────────────────────────────
function mockAuth(req, res, next) {
  req.user = {
    id: req.headers["x-user-id"],
    role: req.headers["x-user-role"] || "user",
  };

  if (!req.user.id) {
    return res.status(401).json({ message: "Missing x-user-id header" });
  }

  next();
}

// ─── DB Helpers ──────────────────────────────────────────────────────────────
async function getChatById(chatId) {
    const [rows] = await db.query(
      "SELECT * FROM chat_rooms WHERE chat_id = ?",
      [chatId]
    );
    return rows[0] || null;
  }
  
  async function getChatsByUserId(userId) {
    const [rows] = await db.query(
      "SELECT * FROM chat_rooms WHERE user_id1 = ? OR user_id2 = ?",
      [userId, userId]
    );
    return rows;
  }
  
  async function getMessagesByChatId(chatId) {
    const [rows] = await db.query(
      "SELECT * FROM chat_messages WHERE chat_id = ? ORDER BY created_at ASC",
      [chatId]
    );
    return rows;
  }
  
  async function saveMessage(chatId, senderId, content) {
    const [result] = await db.query(
      "INSERT INTO chat_messages (chat_id, sender_id, message_text, created_at) VALUES (?, ?, ?, NOW())",
      [chatId, senderId, content]
    );
    return {
      id: result.insertId.toString(),
      chatId: String(chatId),
      senderId: String(senderId),
      content: content,
      createdAt: new Date().toISOString(),
    };
  }
  
  // ─── Participant Check ────────────────────────────────────────────────────────
  function isChatParticipant(chat, user) {
    return (
      String(chat.user_id1) === String(user.id) ||
      String(chat.user_id2) === String(user.id) ||
      user.role === "admin"
    );
  }

async function requireChatParticipant(req, res, next) {
  try {
    const chatId = req.params.chatId || req.params.id;
    const chat = await getChatById(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (!isChatParticipant(chat, req.user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    req.chat = chat;
    next();
  } catch (error) {
    console.error("Chat access check failed:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// ─── REST Routes ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Get all chats for a user
app.get("/users/:userId/chats", async (req, res) => {
  try {
    const chats = await getChatsByUserId(req.params.userId);
    res.json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get single chat
app.get("/chats/:chatId", mockAuth, requireChatParticipant, async (req, res) => {
  res.json(req.chat);
});

// Get messages for a chat
app.get("/chats/:chatId/messages", mockAuth, requireChatParticipant, async (req, res) => {
  try {
    const messages = await getMessagesByChatId(req.params.chatId);
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Post a message (REST fallback)
app.post("/chats/:chatId/messages", mockAuth, requireChatParticipant, async (req, res) => {
  const { content } = req.body;

  if (!content || !String(content).trim()) {
    return res.status(400).json({ message: "Message content is required" });
  }

  try {
    const newMessage = await saveMessage(
      req.params.chatId,
      req.user.id,
      String(content).trim()
    );

    res.status(201).json({ message: "Message sent", data: newMessage });
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ─── Socket.IO ───────────────────────────────────────────────────────────────
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join_conversation", async ({ chatId, userId, role }) => {
    try {
      const chat = await getChatById(chatId);

      if (!chat) {
        return socket.emit("socket_error", { message: "Chat not found" });
      }

      const user = { id: userId, role: role || "user" };

      if (!isChatParticipant(chat, user)) {
        return socket.emit("socket_error", { message: "Forbidden" });
      }

      const roomName = `chat:${chatId}`;
      socket.join(roomName);

      socket.emit("joined_conversation", {
        roomName,
        chatId: String(chatId),
      });

      console.log(`User ${userId} (${role}) joined ${roomName}`);
    } catch (error) {
      console.error("join_conversation failed:", error);
      socket.emit("socket_error", { message: "Internal server error" });
    }
  });

  socket.on("send_message", async ({ chatId, userId, role, content }) => {
    try {
      const chat = await getChatById(chatId);

      if (!chat) {
        return socket.emit("socket_error", { message: "Chat not found" });
      }

      const user = { id: userId, role: role || "user" };

      if (!isChatParticipant(chat, user)) {
        return socket.emit("socket_error", { message: "Forbidden" });
      }

      if (!content || !String(content).trim()) {
        return socket.emit("socket_error", { message: "Message content is required" });
      }

      // Save to DB and broadcast
      const newMessage = await saveMessage(chatId, userId, String(content).trim());

      io.to(`chat:${chatId}`).emit("receive_message", newMessage);

      console.log(`Message in chat:${chatId} from user ${userId}`);
    } catch (error) {
      console.error("send_message failed:", error);
      socket.emit("socket_error", { message: "Internal server error" });
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

server.listen(5001, () => {
  console.log("Chat socket server running on port 5001");
});