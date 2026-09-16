let ioInstance = null;

const setSocketIO = (io) => {
  ioInstance = io;
};

const emitRealtimeEvent = (eventName, data) => {
  if (ioInstance) {
    try {
      ioInstance.emit(eventName, data);
      console.log(`📡 [Real-Time] Emitted '${eventName}' with payload:`, typeof data === 'object' ? Object.keys(data) : data);
    } catch (err) {
      console.error(`❌ [Real-Time] Failed to emit '${eventName}':`, err.message);
    }
  }
};

module.exports = {
  setSocketIO,
  emitRealtimeEvent
};
