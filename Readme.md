🗨️ TCP Chat Server (Node.js)

🎥 Demo Link:
▶️ Watch Demo on Google Drive

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

No external networking libraries — only built-in net and os

Optional: .env file for custom port configuration

📁 Project Structure
.
├── index.js       # Main chat server implementation
├── .env           # Contains PORT variable
└── README.md      # Documentation

🚀 How to Run the Server
1️⃣ Clone or Copy the Code

Save the provided code in a file named index.js.

2️⃣ Install Dependencies
npm init -y
npm install dotenv

3️⃣ Create .env File

(Optional) Specify a custom port:

PORT=4000

4️⃣ Start the Server
node index.js


By default, the server listens on port 4000 (or the port specified in .env).

Example using nodemon:

nodemon index.js 4000


Output:

Chat server listening on port 4000

💬 How to Connect Clients

You can connect using Netcat (ncat) from multiple terminals.

Using ncat:
ncat localhost 4000


Then log in and start chatting:

LOGIN Alice
MSG Hello everyone!
DM Bob Hi Bob!
WHO
PING

🧠 Example Commands
Command	Description	Example
LOGIN <username>	Log in with a username	LOGIN Alice
MSG <message>	Send broadcast message	MSG Hello everyone!
DM <username> <message>	Send a private message	DM Bob hi!
WHO	Show all connected users	WHO
PING	Check server health	PING → PONG
🧾 Example Output

Client 1 (Alice):

Welcome! Please login with: LOGIN <username>
LOGIN Alice
OK
MSG Hello everyone!
DM Bob Hi Bob!


Client 2 (Bob):

Welcome! Please login with: LOGIN <username>
LOGIN Bob
OK
INFO Alice connected
MSG Alice Hello everyone!
DM Alice Hi Bob!

⏹️ Graceful Shutdown

Press:

Ctrl + C


All connected users receive:

INFO server-shutdown

📹 Screen Recording

Demo Video (Google Drive):
🎥 https://drive.google.com/file/d/1LdXN551mGJNwxtmP5PF3CBEWm5AIOe20/view?usp=sharing

This video shows:

Server startup

Two clients connecting via ncat

Login, broadcast, and private messaging
