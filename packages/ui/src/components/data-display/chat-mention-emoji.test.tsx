import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import * as React from 'react';
import { ChatComposer, type ChatComposerProps } from './chat';
import {
  ChatMentionChip,
  ChatMentionList,
  filterMentionCandidates,
  getMentionQuery,
  type ChatMentionCandidate,
} from './chat-composer-tools';

const CANDIDATES: ChatMentionCandidate[] = [
  { id: 'u1', label: 'Budi' },
  { id: 'u2', label: 'Bunga' },
  { id: 'u3', label: 'Andi' },
];

interface HarnessProps extends Partial<ChatComposerProps> {
  initial?: string;
  onSend?: ChatComposerProps['onSend'];
}

function Harness({ initial = '', onSend = () => {}, ...rest }: HarnessProps) {
  const [value, setValue] = React.useState(initial);
  return (
    <ChatComposer
      value={value}
      onChange={setValue}
      onSend={onSend}
      candidates={CANDIDATES}
      {...rest}
    />
  );
}

function getTextarea() {
  return screen.getByRole('combobox') as HTMLTextAreaElement;
}

describe('getMentionQuery', () => {
  it('mendeteksi query di awal teks dan setelah whitespace', () => {
    expect(getMentionQuery('@bu', 3)).toEqual({ start: 0, end: 3, query: 'bu' });
    expect(getMentionQuery('halo @bu', 8)).toEqual({ start: 5, end: 8, query: 'bu' });
  });

  it('mengabaikan @ di tengah kata (mis. email) dan teks tanpa @', () => {
    expect(getMentionQuery('a@b', 3)).toBeNull();
    expect(getMentionQuery('halo dunia', 10)).toBeNull();
  });

  it('hanya membaca sampai posisi kursor', () => {
    expect(getMentionQuery('@bu nanti', 3)).toEqual({ start: 0, end: 3, query: 'bu' });
    expect(getMentionQuery('@bu nanti', 9)).toBeNull();
  });
});

describe('filterMentionCandidates', () => {
  it('memfilter kandidat tanpa membedakan huruf besar-kecil', () => {
    expect(filterMentionCandidates(CANDIDATES, 'BU').map((c) => c.label)).toEqual([
      'Budi',
      'Bunga',
    ]);
    expect(filterMentionCandidates(CANDIDATES, '').length).toBe(3);
  });
});

describe('ChatMentionList states (FR-006)', () => {
  const base = {
    listId: 'list',
    candidates: [],
    query: 'xy',
    activeIndex: 0,
    onActiveChange: () => {},
    onSelect: () => {},
  };

  it('menampilkan state loading dengan aria-busy', () => {
    render(<ChatMentionList {...base} status="loading" />);
    expect(screen.getByRole('status').getAttribute('aria-busy')).toBe('true');
  });

  it('menampilkan state error sebagai alert', () => {
    render(<ChatMentionList {...base} status="error" />);
    expect(screen.getByRole('alert').textContent).toContain('Could not load candidates');
  });

  it('menampilkan state kosong dengan query', () => {
    render(<ChatMentionList {...base} status="ready" />);
    expect(screen.getByText('No candidates')).toBeTruthy();
    expect(screen.getByText('Nothing matches "xy".')).toBeTruthy();
  });
});

describe('ChatComposer mention (FR-001, FR-002, FR-003)', () => {
  it('mengetik @bu membuka popover dan memfilter ke Budi dan Bunga (AC-01)', () => {
    render(<Harness />);
    const ta = getTextarea();
    fireEvent.change(ta, { target: { value: '@bu' } });

    expect(ta.getAttribute('aria-expanded')).toBe('true');
    const listbox = screen.getByRole('listbox', { name: 'Mention candidates' });
    const options = within(listbox).getAllByRole('option');
    expect(options.map((o) => o.getAttribute('aria-label'))).toEqual(['Budi', 'Bunga']);
  });

  it('memanggil onMentionQuery dengan query terbaru', () => {
    const onMentionQuery = vi.fn();
    render(<Harness onMentionQuery={onMentionQuery} />);
    fireEvent.change(getTextarea(), { target: { value: '@bu' } });
    expect(onMentionQuery).toHaveBeenLastCalledWith('bu');
  });

  it('memilih dengan panah + Enter (AC-02)', () => {
    const onMention = vi.fn();
    render(<Harness onMention={onMention} />);
    const ta = getTextarea();
    fireEvent.change(ta, { target: { value: '@bu' } });
    fireEvent.keyDown(ta, { key: 'ArrowDown' });
    fireEvent.keyDown(ta, { key: 'Enter' });

    expect(ta.value).toBe('@Bunga ');
    expect(onMention).toHaveBeenCalledWith({ id: 'u2', label: 'Bunga' });
  });

  it('memilih dengan klik (AC-02)', () => {
    render(<Harness />);
    const ta = getTextarea();
    fireEvent.change(ta, { target: { value: 'halo @bu' } });
    fireEvent.click(screen.getByRole('option', { name: 'Budi' }));
    expect(ta.value).toBe('halo @Budi ');
  });

  it('Escape menutup popover tanpa memilih (AC-02)', () => {
    const onMention = vi.fn();
    render(<Harness onMention={onMention} />);
    const ta = getTextarea();
    fireEvent.change(ta, { target: { value: '@bu' } });
    fireEvent.keyDown(ta, { key: 'Escape' });

    expect(ta.getAttribute('aria-expanded')).toBe('false');
    expect(ta.value).toBe('@bu');
    expect(onMention).not.toHaveBeenCalled();
  });

  it('mengirim token {id,label} di payload onSend (AC-03)', () => {
    const onSend = vi.fn();
    render(<Harness onSend={onSend} />);
    const ta = getTextarea();
    fireEvent.change(ta, { target: { value: '@bu' } });
    fireEvent.click(screen.getByRole('option', { name: 'Budi' }));
    fireEvent.change(ta, { target: { value: 'Halo @Budi, cek ini' } });
    fireEvent.keyDown(ta, { key: 'Enter' });

    expect(onSend).toHaveBeenCalledWith([{ id: 'u1', label: 'Budi' }]);
  });

  it('membuang token jika teks mention dihapus', () => {
    const onSend = vi.fn();
    render(<Harness onSend={onSend} />);
    const ta = getTextarea();
    fireEvent.change(ta, { target: { value: '@bu' } });
    fireEvent.click(screen.getByRole('option', { name: 'Budi' }));
    fireEvent.change(ta, { target: { value: 'tanpa mention' } });
    fireEvent.keyDown(ta, { key: 'Enter' });

    expect(onSend).toHaveBeenCalledWith([]);
  });

  it('merender chip mention di bubble (AC-03)', () => {
    render(<ChatMentionChip id="u1" label="Budi" />);
    const chip = screen.getByText('@Budi');
    expect(chip.getAttribute('data-mention-id')).toBe('u1');
  });

  it('tanpa prop candidates, textarea tetap textbox biasa (non-breaking)', () => {
    render(<ChatComposer value="" onChange={() => {}} onSend={() => {}} />);
    expect(screen.getByRole('textbox').getAttribute('role')).toBeNull();
  });
});

describe('ChatComposer emoji picker (FR-004)', () => {
  it('menyisip emoji tepat di posisi kursor (AC-04)', () => {
    const onChange = vi.fn();
    function EmojiHarness() {
      const [value, setValue] = React.useState('halo  dunia');
      return (
        <ChatComposer
          value={value}
          onChange={(v) => {
            onChange(v);
            setValue(v);
          }}
          onSend={() => {}}
          emojiPicker
        />
      );
    }
    render(<EmojiHarness />);
    const ta = screen.getByRole('textbox') as HTMLTextAreaElement;
    ta.focus();
    ta.setSelectionRange(5, 5);

    fireEvent.click(screen.getByRole('button', { name: 'Sisipkan emoji' }));
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search emoji' }), {
      target: { value: 'tertawa' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'tertawa sampai menangis' }));

    expect(onChange).toHaveBeenLastCalledWith('halo 😂 dunia');
  });

  it('menampilkan kategori dan bisa berpindah kategori', () => {
    render(<ChatComposer value="" onChange={() => {}} onSend={() => {}} emojiPicker />);
    fireEvent.click(screen.getByRole('button', { name: 'Sisipkan emoji' }));
    const objek = screen.getByRole('button', { name: 'Objek' });
    fireEvent.click(objek);
    expect(objek.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: 'roket' })).toBeTruthy();
  });

  it('pencarian tanpa hasil menampilkan pesan kosong', () => {
    render(<ChatComposer value="" onChange={() => {}} onSend={() => {}} emojiPicker />);
    fireEvent.click(screen.getByRole('button', { name: 'Sisipkan emoji' }));
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search emoji' }), {
      target: { value: 'zzzz' },
    });
    expect(screen.getByText('No matching emoji.')).toBeTruthy();
  });
});
