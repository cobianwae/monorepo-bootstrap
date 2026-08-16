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

    it('renders customer, agent, bot, and system message variants', () => {
      render(
        <ChatContainer>
          <ChatThread>
            <ChatMessage
              sender="system"
              content="Conversation transferred to Omnichannel Queue"
              timestamp="09:59 AM"
            />
            <ChatMessage
              sender="customer"
              senderName="Sarah Connor"
              content="I need help with billing."
              timestamp="10:00 AM"
            />
            <ChatMessage
              sender="bot"
              senderName="AI Triage"
              content="Checking your account details..."
              timestamp="10:00 AM"
            />
            <ChatMessage
              sender="agent"
              content="Hello Sarah, I can help you with that."
              timestamp="10:01 AM"
              status="read"
            />
          </ChatThread>
        </ChatContainer>
      );

      expect(screen.getByText(/Conversation transferred to Omnichannel Queue/)).toBeDefined();
      expect(screen.getByText('Sarah Connor')).toBeDefined();
      expect(screen.getByText('I need help with billing.')).toBeDefined();
      expect(screen.getByText('AI Triage')).toBeDefined();
      expect(screen.getByText('Checking your account details...')).toBeDefined();
      expect(screen.getByText('Hello Sarah, I can help you with that.')).toBeDefined();
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
