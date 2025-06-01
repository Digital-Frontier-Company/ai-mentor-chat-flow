
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChat } from './useChat';

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    }
  }
}));

describe('useChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return status 200 when chat function is called successfully', async () => {
    const mockInvoke = vi.fn().mockResolvedValue({
      data: { answer: 'Hello! How can I help you today?' },
      error: null
    });

    // Mock the supabase functions invoke
    const { supabase } = await import('@/integrations/supabase/client');
    supabase.functions.invoke = mockInvoke;

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.send('Hello');
    });

    // Verify the function was called
    expect(mockInvoke).toHaveBeenCalledWith('chat', {
      body: { message: 'Hello' }
    });

    // Verify messages were updated correctly
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0]).toMatchObject({
      role: 'user',
      content: 'Hello'
    });
    expect(result.current.messages[1]).toMatchObject({
      role: 'assistant',
      content: 'Hello! How can I help you today?'
    });
  });

  it('should handle errors properly', async () => {
    const mockInvoke = vi.fn().mockResolvedValue({
      data: null,
      error: new Error('Network error')
    });

    const { supabase } = await import('@/integrations/supabase/client');
    supabase.functions.invoke = mockInvoke;

    const { result } = renderHook(() => useChat());

    await expect(async () => {
      await act(async () => {
        await result.current.send('Hello');
      });
    }).rejects.toThrow('Network error');
  });
});
