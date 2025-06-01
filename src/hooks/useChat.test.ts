
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChat } from './useChat';

// Mock the contexts
vi.mock('@/contexts/MentorContext', () => ({
  useMentor: vi.fn(() => ({
    selectedMentor: {
      id: 'test-mentor-id',
      name: 'Test Mentor',
      icon: '🤖',
      description: 'Test mentor description',
      expertise: 'Testing'
    },
    chatSessionId: 'test-session-id',
    setChatSessionId: vi.fn()
  }))
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: {
      id: 'test-user-id'
    }
  }))
}));

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({
        data: {
          session: {
            access_token: 'test-token'
          }
        }
      }))
    }
  }
}));

// Mock fetch for the streaming response
global.fetch = vi.fn();

describe('useChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle streaming chat response successfully', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      headers: {
        get: vi.fn(() => 'test-session-id')
      },
      body: {
        getReader: vi.fn(() => ({
          read: vi.fn()
            .mockResolvedValueOnce({
              done: false,
              value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n')
            })
            .mockResolvedValueOnce({
              done: false,
              value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":" there!"}}]}\n\n')
            })
            .mockResolvedValueOnce({
              done: true,
              value: undefined
            }),
          releaseLock: vi.fn()
        }))
      }
    };

    (global.fetch as any).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.send('Hello');
    });

    // Verify fetch was called with correct parameters
    expect(global.fetch).toHaveBeenCalledWith(
      'https://bapditcjlxctrisoixpg.supabase.co/functions/v1/chat-with-mentor',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        }),
        body: expect.stringContaining('"mentorId":"test-mentor-id"')
      })
    );

    // Verify messages were updated correctly
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0]).toMatchObject({
      role: 'user',
      content: 'Hello'
    });
    expect(result.current.messages[1]).toMatchObject({
      role: 'assistant',
      content: 'Hello there!'
    });
  });

  it('should handle errors properly', async () => {
    const mockResponse = {
      ok: false,
      status: 500
    };

    (global.fetch as any).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useChat());

    await expect(async () => {
      await act(async () => {
        await result.current.send('Hello');
      });
    }).rejects.toThrow('HTTP error! status: 500');
  });
});
