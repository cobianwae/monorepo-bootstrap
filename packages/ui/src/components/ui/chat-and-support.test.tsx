import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  ChatContainer,
  ChatThread,
  ChatMessage,
  ChatTypingIndicator,
  ChatSuggestionList,
} from './chat';
import { Prose } from './prose';
import { SearchInput } from './search-input';
import { Banner } from './banner';

describe('Chat and Supporting Primitives', () => {
  describe('Chat primitives', () => {
    it('renders chat thread with user and assistant messages', () => {
      render(
        <ChatContainer>
          <ChatThread>
            <ChatMessage
              sender="user"
              content="Hello AI"
              timestamp="10:00 AM"
              status="read"
            />
            <ChatMessage
              sender="assistant"
              senderName="Copilot"
              content="Hello, how can I help you?"
              timestamp="10:01 AM"
            />
            <ChatTypingIndicator />
          </ChatThread>
        </ChatContainer>
      );

      expect(screen.getByText('Hello AI')).toBeDefined();
      expect(screen.getByText('Copilot')).toBeDefined();
      expect(screen.getByText('Hello, how can I help you?')).toBeDefined();
      expect(screen.getByText('Thinking...')).toBeDefined();
    });

    it('renders suggestion list', () => {
      render(
        <ChatSuggestionList
          suggestions={['Draft an email', 'Summarize meeting']}
          onSelect={() => {}}
        />
      );

      expect(screen.getByText('“Draft an email”')).toBeDefined();
      expect(screen.getByText('“Summarize meeting”')).toBeDefined();
    });
  });

  describe('Prose', () => {
    it('renders rich text container', () => {
      render(
        <Prose>
          <h1>Design System</h1>
          <p>A comprehensive component library.</p>
        </Prose>
      );

      expect(screen.getByText('Design System')).toBeDefined();
      expect(screen.getByText('A comprehensive component library.')).toBeDefined();
    });
  });

  describe('SearchInput', () => {
    it('renders search input with shortcut hint', () => {
      render(<SearchInput placeholder="Search components..." shortcut="⌘K" />);
      expect(screen.getByPlaceholderText('Search components...')).toBeDefined();
      expect(screen.getByText('⌘K')).toBeDefined();
    });
  });

  describe('Banner', () => {
    it('renders announcement banner with action', () => {
      render(
        <Banner variant="highlight" actionText="Upgrade now" actionHref="/pricing">
          New features available in v2.0!
        </Banner>
      );

      expect(screen.getByText('New features available in v2.0!')).toBeDefined();
      expect(screen.getByText('Upgrade now')).toBeDefined();
    });
  });
});
