import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = {};
  }

  // Bağlantı kurma
  connect() {
    if (this.socket) return;
    
    this.socket = io(SOCKET_URL);
    
    this.socket.on('connect', () => {
      console.log('WebSocket bağlantısı kuruldu');
    });
    
    this.socket.on('disconnect', () => {
      console.log('WebSocket bağlantısı kesildi');
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('WebSocket bağlantı hatası:', error);
    });
    
    // Stok güncellemelerini dinle
    this.socket.on('inventory_updated', (data) => {
      if (this.listeners['inventory_updated']) {
        this.listeners['inventory_updated'].forEach(callback => callback(data));
      }
    });
    
    // Üretim güncellemelerini dinle
    this.socket.on('production_updated', (data) => {
      if (this.listeners['production_updated']) {
        this.listeners['production_updated'].forEach(callback => callback(data));
      }
    });
  }
  
  // Bağlantıyı kesme
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
  
  // Olay dinleyicisi ekleme
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }
  
  // Olay dinleyicisini kaldırma
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }
  
  // Sunucuya mesaj gönderme
  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}

// Singleton instance
const socketService = new SocketService();

export default socketService; 