import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './chatSlice';

export const store = configureStore({
  reducer: {
    chat: chatReducer,
  },
});

// Subscribe to store updates to automatically save the chats to localStorage
store.subscribe(() => {
  const currentMessages = store.getState().chat.messages;
  localStorage.setItem('chat_history', JSON.stringify(currentMessages));
});
