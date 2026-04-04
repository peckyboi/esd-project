// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const mysql = require('mysql2/promise');
// const cors = require('cors');
// const amqp = require('amqplib');


// // 1. App & Server Initialization
// const app = express();
// const server = http.createServer(app);

// app.use(cors());
// app.use(express.json());

// const io = new Server(server, {
//   cors: {
//     origin: "*", // Or "http://localhost:5173"
//     methods: ["GET", "POST"]
//   }
// });


// // 2. Database Connection Setup
// const dbConfig = {
//   host: process.env.DB_HOST || 'localhost',
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASSWORD || 'root',
//   database: process.env.DB_NAME || 'chat_db',
//   port: process.env.DB_PORT || 3306
// };

// let db;

// async function connectDB() {
//   try {
//     // 1. Connect WITHOUT the database to create it first
//     const initDb = await mysql.createConnection({
//       host: dbConfig.host,
//       user: dbConfig.user,
//       password: dbConfig.password
//     });
    
//     await initDb.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
//     await initDb.end(); // Close this temporary connection

//     // 2. Now connect WITH the database selected
//     db = await mysql.createConnection(dbConfig);
//     console.log(`✅ Connected to MySQL database: ${dbConfig.database}`);

//     // 3. Create your tables
//     await db.execute(`
//       CREATE TABLE IF NOT EXISTS chat_rooms (
//         chat_id       INT AUTO_INCREMENT PRIMARY KEY,
//         order_id      INT NOT NULL,
//         user_id       VARCHAR(255) NOT NULL,
//         freelancer_id VARCHAR(255) NOT NULL,
//         status        ENUM('active', 'resolved', 'closed') DEFAULT 'active',
//         created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
//         updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
//       )
//     `);

//     await db.execute(`
//       CREATE TABLE IF NOT EXISTS chat_messages (
//         message_id   INT AUTO_INCREMENT PRIMARY KEY,
//         chat_id      INT NOT NULL,
//         sender_id    VARCHAR(255) NOT NULL,
//         message_text TEXT NOT NULL,
//         created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
//         FOREIGN KEY (chat_id) REFERENCES chat_rooms(chat_id) ON DELETE CASCADE
//       )
//     `);

//   } catch (error) {
//     console.error('❌ Database connection failed:', error.message);
//     setTimeout(connectDB, 5000);
//   }
// }


// connectDB();


// // 3. RabbitMQ Setup
// const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

// async function connectRabbitMQ() {

//   try {

//     const connection = await amqp.connect(rabbitUrl);
//     const channel = await connection.createChannel();
//     const queue = 'OrderCreated';

//     await channel.assertQueue(queue, { durable: true });

//     console.log('✅ Connected to RabbitMQ, waiting for messages in %s', queue);

//     channel.consume(queue, async (msg) => {

//       if (msg !== null) {

//         const orderData = JSON.parse(msg.content.toString());

//         console.log(`RabbitMQ Event Received: Order ${orderData.orderId} created`);

//         channel.ack(msg);

//       }

//     });

//   } catch (error) {

//     console.error('❌ RabbitMQ connection failed:', error);
//     setTimeout(connectRabbitMQ, 5000);

//   }

// }

// connectRabbitMQ();


// // 4. REST API: Fetch Chat History
// app.get('/api/chat/:chat_id/history', async (req, res) => {
//   try {
//     const { chat_id } = req.params;

//     // Remove the DATE_FORMAT from SQL
//     const [rows] = await db.execute(
//       `SELECT 
//         sender_id AS SenderId,
//         message_text AS MessageText,
//         created_at, 
//         chat_id AS ChatId
//       FROM chat_messages
//       WHERE chat_id = ?
//       ORDER BY created_at ASC`,
//       [chat_id]
//     );

//     // Map through the rows and format the Date perfectly for OutSystems
//     const formattedHistory = rows.map(row => ({
//       SenderId: row.SenderId,
//       MessageText: row.MessageText,
//       ChatId: row.ChatId,
//       Timestamp: new Date(row.created_at).toISOString() // This guarantees strict formatting!
//     }));

//     res.status(200).json(formattedHistory);

//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch history' });
//   }
// });

// // app.get('/api/chat/:chat_id/history', async (req, res) => {

// //   try {

// //     const { chat_id } = req.params;

// //     const [rows] = await db.execute(
// //       `SELECT 
// //         sender_id AS SenderId,
// //         message_text AS MessageText,
// //         DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%sZ') AS Timestamp,
// //         chat_id AS ChatId
// //       FROM chat_messages
// //       WHERE chat_id = ?
// //       ORDER BY created_at ASC`,
// //       [chat_id]
// //     );

// //     res.status(200).json(rows);

// //   } catch (error) {

// //     res.status(500).json({ error: 'Failed to fetch history' });

// //   }

// // });


// // 5. REST API: Get All Chat Rooms for a User
// app.get('/disputes/:user_id', async (req, res) => {

//   const { user_id } = req.params;

//   try {

//     const [rows] = await db.execute(
//       `SELECT 
//         chat_id AS chatId,
//         order_id AS orderId,
//         user_id AS clientId,
//         freelancer_id AS freelancerId,
//         status,
//         created_at,
//         updated_at
//       FROM chat_rooms
//       WHERE user_id = ? OR freelancer_id = ?
//       ORDER BY updated_at DESC`,
//       [user_id, user_id]
//     );

//     res.status(200).json(rows);

//   } catch (err) {

//     res.status(500).json({ error: err.message });

//   }

// });


// // 6. REST API: Create a New Dispute Chat Room
// app.post('/disputes', async (req, res) => {

//   const { order_id, user_id, freelancer_id } = req.body;

//   try {

//     const [result] = await db.execute(
//       'INSERT INTO chat_rooms (order_id, user_id, freelancer_id) VALUES (?, ?, ?)',
//       [order_id, user_id, freelancer_id]
//     );

//     const chat_id = result.insertId;

//     res.status(201).json({
//       chat_id: chat_id,
//       room_url: `/chat/${chat_id}`
//     });

//   } catch (err) {

//     res.status(500).json({ error: err.message });

//   }

// });


// // 7. WebSocket Logic: Handle Live Chat
// io.on('connection', (socket) => {

//   console.log(`Client connected: ${socket.id}`);

//   socket.on('join_room', (data) => {

//     const chat_id = data.chat_id || data.chatId || data;

//     socket.join(String(chat_id));

//     console.log(`Socket ${socket.id} joined room ${chat_id}`);

//   });

//   socket.on('send_message', async (data) => {

//     const chat_id = data.chat_id || data.chatId;
//     const sender_id = data.sender_id || data.senderId;
//     const text = data.text;

//     try {

//       const [result] = await db.execute(
//         'INSERT INTO chat_messages (chat_id, sender_id, message_text) VALUES (?, ?, ?)',
//         [chat_id, sender_id, text]
//       );

//       // Retrieve the exact saved row (ensures correct timestamp)
//       const [rows] = await db.execute(
//         `SELECT 
//           sender_id AS SenderId,
//           message_text AS MessageText,
//           DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%sZ') AS Timestamp,
//           chat_id AS ChatId
//         FROM chat_messages
//         WHERE message_id = ?`,
//         [result.insertId]
//       );

//       const message = rows[0];

//       io.to(String(chat_id)).emit('receive_message', message);

//     } catch (err) {

//       console.error('❌ Failed to save/send message:', err.message);

//     }

//   });

//   socket.on('disconnect', () => {

//     console.log(`Client disconnected: ${socket.id}`);

//   });

// });


// // 8. Start the Server
// const PORT = process.env.PORT || 5000;

// server.listen(PORT, '0.0.0.0', () => {

//   console.log(`🚀 Chat Microservice running on port ${PORT}`);

// });