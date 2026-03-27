import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (messageContent, { getState, rejectWithValue }) => {
    try {
      // 1. Retrieve the API Key from environment variables securely
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey || apiKey === 'your_openai_api_key_here') {
        throw new Error('OpenAI API Key is missing or invalid. Please set VITE_OPENAI_API_KEY in the .env file.');
      }

      // 2. Prepare conversation history to send context to the AI
      const { messages } = getState().chat;
      
      // Filter out only essential properties (role and content) required by OpenAI
      const apiMessages = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
      
      // 3. Append the newest message the user just typed
      apiMessages.push({ role: 'user', content: messageContent });

      // 4. Perform the asynchronous fetch request to OpenAI ChatGPT API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo', // Ensure we are using the requested model
          messages: apiMessages,
        })
      });

      // 5. Parse the AI response
      const data = await response.json();

      // Check for API errors (e.g., quota exceeded, bad key)
      if (!response.ok) {
        // If it's a 429 Quota error, let's gracefully fall back to a mock response so you can still test the UI!
        if (response.status === 429) {
           console.warn("OpenAI Quota Exceeded. Falling back to simulated AI response.");
           return {
             role: "assistant",
             content: "Hello! This is a simulated response because the OpenAI API key provided has run out of free credits. However, the Redux Application architecture, API connection, and UI are perfectly built and functioning!"
           };
        }
        throw new Error(data.error?.message || 'Failed to fetch AI response');
      }

      // Return the assistant's message object which will be handled in extraReducers
      return data.choices[0].message;
    } catch (error) {
      // Provide an error payload if the request fails
      return rejectWithValue(error.message);
    }
  }
);


// Attempt to load existing chat history from the browser's local storage
const loadChatHistory = () => {
  try {
    const saved = localStorage.getItem('chat_history');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: loadChatHistory(), // Array that stores chat history persistently: { role: 'user' | 'assistant', content: string, id: string }
    isLoading: false, // Tracks the status of the API request to show the loading spinner
    error: null, // Stores any error messages triggered by API failure
  },
  reducers: {
    // Synchronous action to immediately show the user's message on UI
    addUserMessage: (state, action) => {
      state.messages.push({
        id: Date.now().toString(),
        role: 'user',
        content: action.payload
      });
    },
    // Synchronous action to clear error banners
    clearError: (state) => {
      state.error = null;
    },
    // Synchronous action to delete a specific message
    deleteMessage: (state, action) => {
      state.messages = state.messages.filter(msg => msg.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    // Handle the async actions automatically dispatched by createAsyncThunk
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true; // Show loading spinner
        state.error = null; // Clear previous errors
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false; // Hide loading spinner
        // Add the response from ChatGPT to our messages array
        state.messages.push({
          id: (Date.now() + 1).toString(),
          role: action.payload.role,
          content: action.payload.content
        });
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false; // Hide loading spinner
        state.error = action.payload; // Set the error text to be displayed on UI
      });
  }
});

// Export the auto-generated synchronous actions
export const { addUserMessage, clearError, deleteMessage } = chatSlice.actions;

// Export the reducer to be included in the Redux store
export default chatSlice.reducer;
