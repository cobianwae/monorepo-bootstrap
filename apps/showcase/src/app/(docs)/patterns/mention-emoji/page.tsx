'use client';

import * as React from 'react';
import {
  PageHeader,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  ChatContainer,
  ChatThread,
  ChatMessage,
  ChatComposer,
  ChatMentionChip,
  type ChatMentionCandidate,
  type ChatMentionStatus,
  type ChatMentionToken,
  cn,
} from '@ds/ui';

const PEOPLE: ChatMentionCandidate[] = [
  { id: 'u1', label: 'Budi' },
  { id: 'u2', label: 'Bunga' },
  { id: 'u3', label: 'Andi' },
  { id: 'u4', label: 'Siti' },
];

type ScenarioState = 'ready' | 'loading' | 'error' | 'empty';

const SCENARIOS: Array<{ id: ScenarioState; label: string; description: string }> = [
  { id: 'ready', label: 'Berisi', description: 'Kandidat tersedia dan bisa difilter.' },
  { id: 'loading', label: 'Memuat', description: 'Kandidat sedang diambil dari konsumen.' },
  { id: 'error', label: 'Error', description: 'Pengambilan kandidat gagal.' },
  { id: 'empty', label: 'Kosong', description: 'Tidak ada kandidat sama sekali.' },
];

function renderWithMentions(text: string, tokens: ChatMentionToken[]): React.ReactNode {
  if (tokens.length === 0) return text;
  const pattern = new RegExp(`@(${tokens.map((t) => escapeRegExp(t.label)).join('|')})`, 'g');
  const parts: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const token = tokens.find((t) => t.label === match?.[1]);
    if (token) parts.push(<ChatMentionChip key={`${token.id}-${match.index}`} id={token.id} label={token.label} />);
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface SentMessage {
  id: number;
  text: string;
  mentions: ChatMentionToken[];
}

const SEED: SentMessage[] = [
  {
    id: 1,
    text: 'Halo @Budi, bisa cek draft desain ini?',
    mentions: [{ id: 'u1', label: 'Budi' }],
  },
  { id: 2, text: 'Siap, nanti sore saya review.', mentions: [] },
];

export default function MentionEmojiPage() {
  const [scenario, setScenario] = React.useState<ScenarioState>('ready');
  const [draft, setDraft] = React.useState('');
  const [messages, setMessages] = React.useState<SentMessage[]>(SEED);
  const [lastMention, setLastMention] = React.useState<string | null>(null);

  const candidates = scenario === 'empty' ? [] : PEOPLE;
  const status: ChatMentionStatus =
    scenario === 'loading' ? 'loading' : scenario === 'error' ? 'error' : 'ready';

  const handleSend = (mentions: ChatMentionToken[]) => {
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: prev.length + 1, text, mentions }]);
    setDraft('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mention & Emoji"
        description="Composer chat dengan mention @user (popover kandidat) dan emoji picker yang menyisip di posisi kursor."
      />

      <div role="group" aria-label="Pilih state kandidat" className="flex flex-wrap gap-2">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={scenario === s.id}
            onClick={() => setScenario(s.id)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              scenario === s.id
                ? 'border-highlight bg-background text-foreground'
                : 'border-border bg-card text-muted-foreground hover:text-foreground'
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        {SCENARIOS.find((s) => s.id === scenario)?.description}
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Chat dengan mention dan emoji</CardTitle>
          <CardDescription>
            Ketik <kbd className="font-mono">@bu</kbd> untuk mencari kandidat. Navigasi dengan panah,
            pilih dengan Enter, tutup dengan Escape.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ChatContainer className="h-[28rem] rounded-b-lg">
            <ChatThread>
              {messages.map((m) => (
                <ChatMessage
                  key={m.id}
                  sender={m.id % 2 === 1 ? 'user' : 'assistant'}
                  senderName={m.id % 2 === 1 ? undefined : 'Rekan'}
                  content={renderWithMentions(m.text, m.mentions)}
                  timestamp="Baru saja"
                />
              ))}
            </ChatThread>
            <ChatComposer
              value={draft}
              onChange={setDraft}
              onSend={handleSend}
              candidates={candidates}
              candidatesStatus={status}
              onMention={(token) => setLastMention(token.label)}
              emojiPicker
              placeholder="Tulis pesan… (@ untuk mention)"
            />
          </ChatContainer>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground" aria-live="polite">
        {lastMention ? `Terakhir di-mention: @${lastMention}` : 'Belum ada mention dipilih.'}
      </p>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          setMessages(SEED);
          setLastMention(null);
        }}
      >
        Reset percakapan
      </Button>
    </div>
  );
}
