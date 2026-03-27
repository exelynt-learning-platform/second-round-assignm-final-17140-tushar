import chatReducer, { addUserMessage, clearError, deleteMessage } from './chatSlice';

describe('chatSlice state management hooks', () => {

  const initialState = {
    messages: [],
    isLoading: false,
    error: null,
  };

  it('should handle initial state', () => {
    expect(chatReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle addUserMessage', () => {
    const actual = chatReducer(initialState, addUserMessage('Hello World!'));
    
    expect(actual.messages.length).toEqual(1);
    expect(actual.messages[0].content).toEqual('Hello World!');
    expect(actual.messages[0].role).toEqual('user');
  });

  it('should handle clearError', () => {
    const stateWithError = {
      messages: [],
      isLoading: false,
      error: 'Network Error',
    };
    
    const actual = chatReducer(stateWithError, clearError());
    expect(actual.error).toBeNull();
  });

  it('should handle deleteMessage', () => {
    const previousState = {
      messages: [
        { id: '123', role: 'user', content: 'Message to delete' },
        { id: '456', role: 'user', content: 'Message to keep' }
      ],
      isLoading: false,
      error: null,
    };
    
    const actual = chatReducer(previousState, deleteMessage('123'));
    
    expect(actual.messages.length).toEqual(1);
    expect(actual.messages[0].id).toEqual('456');
  });
});
