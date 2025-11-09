🗨️ TCP Chat Server (Node.js)

A simple multi-client chat server built using Node.js native net module (no external networking libraries).
It supports login, broadcast messages, direct messages (DMs), online user listing, and idle timeout disconnections.

📦 Features

✅ Multi-user real-time chat
✅ Private messaging using DM command
✅ Broadcast messages with MSG
✅ User list with WHO
✅ Ping support (PING → PONG)
✅ Automatic idle timeout disconnection
✅ Graceful shutdown on Ctrl + C

⚙️ Requirements

Node.js (v16 or later recommended)

No external dependencies required (uses Node.js standard net and os libraries)

.env file for custom port configuration

📁 Project Structure
.
├── index.js          # Main chat server implementation
├── .env              # Contains PORT variable
└── README.md         # Documentation

🚀 How to Run the Server
1️⃣ Clone or Copy the Code

Save the provided code in a file named index.js.

2️⃣ Install Dependencies
npm init -y
npm install dotenv

3️⃣  Create .env File

If you want to specify a custom port:

PORT=4000

4️⃣ Start the Server
node server.js


By default, the server listens on port 4000 (or the port specified in .env ).

Example:

nodemon server.js 4000


Output:

Chat server listening on port 4000

💬 How to Connect Clients

You can connect using Netcat (ncat)  from multiple terminals.

Using ncat:
ncat localhost 4000