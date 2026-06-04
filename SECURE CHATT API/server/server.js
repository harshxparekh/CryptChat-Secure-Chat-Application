const WebSocket = require('ws');

// ✅ Set custom port
const PORT = 3100;

const wss = new WebSocket.Server({ port: PORT });

wss.on('connection', function connection(ws) {
    console.log('✅ New client connected');

    ws.on('message', function incoming(message) {
        const messageStr = message.toString();

        try {
            const parsed = JSON.parse(messageStr);
            console.log('📨 Parsed message:', parsed);

            // ✅ Send full parsed message as JSON string
            const fullMessage = JSON.stringify(parsed);

            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(fullMessage);
                }
            });

        } catch (err) {
            console.warn('⚠️ Message was not valid JSON. Wrapping and sending as text.');

            // 🔄 Optional fallback: wrap as text message
            const fallbackMessage = JSON.stringify({
                type: 'text',
                data: messageStr
            });

            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(fallbackMessage);
                }
            });
        }
    });

    ws.on('close', () => {
        console.log('❌ Client disconnected');
    });
});

wss.on('error', (err) => {
    console.error('❌ WebSocket server error:', err);
});

console.log(`🚀 WebSocket server running at ws://localhost:${PORT}`);
