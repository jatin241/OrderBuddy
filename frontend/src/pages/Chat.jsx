
import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

export default function Chat({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    socketRef.current = io(import.meta.env.VITE_API_BASE_URL, {
      auth: { token },
    });

    socketRef.current.emit('joinRoom', roomId);

    socketRef.current.on('receiveMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [roomId]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (input.trim()) {
      socketRef.current.emit('sendMessage', { roomId, message: input });
      setInput('');
    }
  };

  return (
    <div style={{ border: '1px solid #eee', padding: 16, borderRadius: 8, maxWidth: 400 }}>
      <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 8 }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: 4 }}>
            <strong>{msg.senderId}:</strong> {msg.message}
            <span style={{ fontSize: 10, color: '#888', marginLeft: 8 }}>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
          placeholder="Type a message..."
        />
        <button
          type="submit"
          style={{
            padding: '6px 12px',
            background: '#e67e22',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}