const net = require('net');
const os = require('os');
const dotenvResult = require('dotenv').config();
const DEFAULT_PORT = process.env.PORT || 4000;
const IDLE_TIMEOUT_MS = 6000 * 1000; // 60s idle timeout (optional feature)

const port = (() => {
  // precedence: env PORT, CLI arg, default
  const fromEnv = process.env.PORT;
  const fromArg = process.argv[2];
  return Number(fromEnv || fromArg) || DEFAULT_PORT;
})();

const server = net.createServer();

// Map username -> socket
const users = new Map();
// Keep set of sockets to allow broadcasting to everyone
const sockets = new Set();

function safeWrite(sock, text) {
  try {
    sock.write(text + '\n');
  } catch (err) {
    // ignore write errors
  }
}

function broadcast(message, exceptSocket = null) {
  for (const s of sockets) {
    if (s !== exceptSocket) {
      safeWrite(s, message);
    }
  }
}

function cleanupSocket(sock) {
  sockets.delete(sock);
  if (sock._username) {
    users.delete(sock._username);
    broadcast(`INFO ${sock._username} disconnected`);
  }
  if (sock._timeout) {
    clearTimeout(sock._timeout);
  }
}

function resetIdleTimer(sock) {
  if (sock._timeout) clearTimeout(sock._timeout);
  if (IDLE_TIMEOUT_MS > 0) {
    sock._timeout = setTimeout(() => {
      // idle timeout reached
      try {
        safeWrite(sock, `INFO disconnected due to inactivity`);
        sock.end();
      } catch (e) { }
    }, IDLE_TIMEOUT_MS);
  }
}

server.on('connection', (sock) => {
  sockets.add(sock);
  sock.setEncoding('utf8');
  sock._buffer = '';
  sock._loggedIn = false;
  sock._username = null;
  resetIdleTimer(sock);

  safeWrite(sock, 'Welcome! Please login with: LOGIN <username>');

  sock.on('data', (data) => {
    resetIdleTimer(sock);
    sock._buffer += data;
    // handle lines (both \n and \r\n)
    let idx;
    while ((idx = sock._buffer.indexOf('\n')) !== -1) {
      let line = sock._buffer.slice(0, idx);
      sock._buffer = sock._buffer.slice(idx + 1);
      // trim CR and spaces
      line = line.replace(/\r$/, '').trim();
      if (line.length === 0) continue;
      processLine(sock, line);
    }
  });

  sock.on('end', () => {
    cleanupSocket(sock);
  });

  sock.on('close', () => {
    cleanupSocket(sock);
  });

  sock.on('error', (err) => {
    // ignore or log
    cleanupSocket(sock);
  });
});

function processLine(sock, line) {
  // Commands: LOGIN, MSG, WHO, DM, PING
  const [command, ...rest] = line.split(' ');
  const cmd = command && command.toUpperCase();
  if (!sock._loggedIn) {
    if (cmd === 'LOGIN') {
      const username = rest.join(' ').trim();
      if (!username) {
        safeWrite(sock, 'ERR invalid-username');
        return;
      }
      if (users.has(username)) {
        safeWrite(sock, 'ERR username-taken');
        return;
      }
      // register user
      sock._loggedIn = true;
      sock._username = username;
      users.set(username, sock);
      safeWrite(sock, 'OK');
      broadcast(`INFO ${username} connected`, sock);
    } else if (cmd === 'PING') {
      // allow PING before login for health checks
      safeWrite(sock, 'PONG');
    } else {
      safeWrite(sock, 'ERR not-logged-in');
    }
    return;
  }

  // After login
  if (cmd === 'MSG') {
    const text = rest.join(' ').trim();
    if (!text) return; // ignore empty
    // collapse multiple spaces and newlines inside message
    const cleanText = text.replace(/[\s\t\n\r]+/g, ' ').trim();
    broadcast(`MSG ${sock._username} ${cleanText}`);
  } else if (cmd === 'WHO') {
    for (const uname of users.keys()) {
      safeWrite(sock, `USER ${uname}`);
    }
  } else if (cmd === 'DM') {
    const target = rest[0];
    if (!target) {
      safeWrite(sock, 'ERR invalid-dm');
      return;
    }
    const text = rest.slice(1).join(' ').trim();
    if (!text) {
      safeWrite(sock, 'ERR invalid-dm');
      return;
    }
    const cleanText = text.replace(/[\s\t\n\r]+/g, ' ').trim();
    const targetSock = users.get(target);
    if (!targetSock) {
      safeWrite(sock, 'ERR user-not-found');
      return;
    }
    // deliver DM to target and optionally confirm to sender
    safeWrite(targetSock, `DM ${sock._username} ${cleanText}`);
    safeWrite(sock, `DM ${sock._username} -> ${target} ${cleanText}`);
  } else if (cmd === 'PING') {
    safeWrite(sock, 'PONG');
  } else {
    safeWrite(sock, 'ERR unknown-command');
  }
}

server.listen(port, () => {
  console.log(`Chat server listening on port ${port}`);
});

// graceful shutdown on SIGINT
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  for (const s of sockets) {
    try { s.end('INFO server-shutdown'); } catch (e) { }
  }
  server.close(() => process.exit(0));
});
