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
  Badge,
  Textarea,
  Avatar,
  AvatarFallback,
  Skeleton,
  EmptyState,
  SegmentedControl,
  SegmentedControlItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  Kbd,
  toast,
  cn,
} from '@ds/ui';
import {
  MessagesSquare,
  PenLine,
  Paperclip,
  AtSign,
  Heart,
  MessageCircle,
  Pencil,
  Trash2,
  ChevronDown,
  MessageCircleOff,
} from 'lucide-react';

interface Person {
  id: string;
  name: string;
  handle: string;
  initials: string;
  avatarClass: string;
  role?: string;
}

interface ReplyData {
  id: string;
  author: Person;
  body: string;
  createdAtLabel: string;
  timestamp: number;
  likes: number;
  likedByMe: boolean;
}

interface CommentData extends ReplyData {
  collapsed: boolean;
  replies: ReplyData[];
}

interface ReplyHandlers {
  onToggleLike: (replyId: string) => void;
  onReply: (replyId: string) => void;
  onCancelReply: (replyId: string) => void;
  onEdit: (replyId: string) => void;
  onCancelEdit: (replyId: string) => void;
  onDelete: (replyId: string) => void;
  onSaveEdit: (replyId: string, body: string) => void;
  onPostReply: (replyId: string, body: string) => void;
  isEditing: (replyId: string) => boolean;
  isReplying: (replyId: string) => boolean;
}

type SortMode = 'newest' | 'top';

type DeleteTarget =
  | { type: 'comment'; id: string }
  | { type: 'reply'; commentId: string; replyId: string };

const PEOPLE: Person[] = [
  {
    id: 'u1',
    name: 'Maya Anindya',
    handle: 'maya.a',
    initials: 'MA',
    avatarClass: 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white',
    role: 'Design Lead',
  },
  {
    id: 'u2',
    name: 'Raka Pratama',
    handle: 'raka',
    initials: 'RP',
    avatarClass: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white',
    role: 'Engineer',
  },
  {
    id: 'u3',
    name: 'Sari Wulandari',
    handle: 'sari.w',
    initials: 'SW',
    avatarClass: 'bg-gradient-to-br from-pink-500 to-rose-500 text-white',
    role: 'Product',
  },
  {
    id: 'u4',
    name: 'Dimas Saputra',
    handle: 'dimas',
    initials: 'DS',
    avatarClass: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white',
  },
  {
    id: 'u5',
    name: 'Ayu Lestari',
    handle: 'ayu.l',
    initials: 'AL',
    avatarClass: 'bg-gradient-to-br from-sky-500 to-blue-600 text-white',
    role: 'QA',
  },
];

const CURRENT_USER: Person = {
  id: 'me',
  name: 'You',
  handle: 'you',
  initials: 'YO',
  avatarClass: 'bg-gradient-to-br from-fuchsia-500 to-violet-600 text-white',
};

const INITIAL_COMMENTS: CommentData[] = [
  {
    id: 'c1',
    author: PEOPLE[0],
    body: 'Love the new OKLCH token ramp — the hue interpolation on the primary scale is noticeably smoother. One ask: can we surface the WCAG contrast ratio inline in the token editor?',
    createdAtLabel: '2h ago',
    timestamp: Date.now() - 2 * 3_600_000,
    likes: 4,
    likedByMe: false,
    collapsed: false,
    replies: [
      {
        id: 'r1',
        author: PEOPLE[1],
        body: 'Agreed on contrast! I built a small validator util in packages/tokens — happy to wire it into the editor if you want.',
        createdAtLabel: '1h ago',
        timestamp: Date.now() - 3_600_000,
        likes: 2,
        likedByMe: false,
      },
      {
        id: 'r2',
        author: PEOPLE[2],
        body: 'The 4.5:1 floor on text tokens is a godsend. Our clinic app was shipping some 2.8:1 labels before this.',
        createdAtLabel: '42m ago',
        timestamp: Date.now() - 42 * 60_000,
        likes: 3,
        likedByMe: false,
      },
    ],
  },
  {
    id: 'c2',
    author: PEOPLE[1],
    body: 'Ran a quick audit on the Dialog focus trap. Escape and return-focus both work, but the overlay click region on mobile is about 44px short of the a11y target.',
    createdAtLabel: '5h ago',
    timestamp: Date.now() - 5 * 3_600_000,
    likes: 2,
    likedByMe: true,
    collapsed: false,
    replies: [
      {
        id: 'r3',
        author: PEOPLE[4],
        body: 'Good catch. I will bump the hit area and add a regression test this sprint.',
        createdAtLabel: '4h ago',
        timestamp: Date.now() - 4 * 3_600_000,
        likes: 1,
        likedByMe: false,
      },
      {
        id: 'r4',
        author: PEOPLE[3],
        body: 'Also worth gating the zoom animation behind prefers-reduced-motion while we are in there.',
        createdAtLabel: '3h ago',
        timestamp: Date.now() - 3 * 3_600_000,
        likes: 2,
        likedByMe: false,
      },
    ],
  },
  {
    id: 'c3',
    author: PEOPLE[2],
    body: 'The data table skeleton is fantastic — it mirrors the real column widths so nothing jumps on load. Shipping it to the CRM leads page this week.',
    createdAtLabel: '1d ago',
    timestamp: Date.now() - 24 * 3_600_000,
    likes: 3,
    likedByMe: false,
    collapsed: false,
    replies: [
      {
        id: 'r5',
        author: PEOPLE[0],
        body: 'Nice! Remember to pair it with the EmptyState so filtered views do not dead-end.',
        createdAtLabel: '22h ago',
        timestamp: Date.now() - 22 * 3_600_000,
        likes: 1,
        likedByMe: false,
      },
      {
        id: 'r6',
        author: PEOPLE[1],
        body: 'Also give the striped variant a try — it reads much better on dense screens.',
        createdAtLabel: '20h ago',
        timestamp: Date.now() - 20 * 3_600_000,
        likes: 2,
        likedByMe: false,
      },
    ],
  },
];

function commentScore(comment: CommentData) {
  return comment.likes + comment.replies.reduce((sum, reply) => sum + reply.likes, 0);
}

function createReply(body: string): ReplyData {
  return {
    id: `r-new-${Date.now()}`,
    author: CURRENT_USER,
    body,
    createdAtLabel: 'Just now',
    timestamp: Date.now(),
    likes: 0,
    likedByMe: false,
  };
}

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

function MentionTextarea({
  value,
  onChange,
  placeholder,
  className,
  autoFocus,
}: MentionTextareaProps) {
  const [open, setOpen] = React.useState(false);

  const mentionQuery = React.useMemo(() => {
    const match = value.match(/(?:^|\s)@([a-zA-Z0-9._]*)$/);
    return match ? match[1].toLowerCase() : null;
  }, [value]);

  React.useEffect(() => {
    setOpen(mentionQuery !== null);
  }, [mentionQuery]);

  const suggestions = React.useMemo(
    () =>
      PEOPLE.filter((person) =>
        `${person.name} ${person.handle}`.toLowerCase().includes(mentionQuery ?? '')
      ),
    [mentionQuery]
  );

  const handleSelect = (person: Person) => {
    onChange(
      value.replace(/(?:^|\s)@[a-zA-Z0-9._]*$/, (match) =>
        match.startsWith('@') ? `@${person.handle} ` : ` @${person.handle} `
      )
    );
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={className}
          autoFocus={autoFocus}
        />
      </PopoverTrigger>
      <PopoverContent align="start" side="bottom" sideOffset={4} className="w-64 p-1.5">
        <p className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Suggestions
        </p>
        <div className="space-y-0.5">
          {suggestions.length === 0 ? (
            <p className="px-2 py-1.5 text-xs text-muted-foreground">No matches</p>
          ) : (
            suggestions.map((person) => (
              <button
                key={person.id}
                type="button"
                onClick={() => handleSelect(person)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Avatar size="xs">
                  <AvatarFallback className={person.avatarClass}>
                    {person.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-foreground">{person.name}</span>
                <span className="ml-auto text-[10px] text-muted-foreground">
                  @{person.handle}
                </span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface CommentComposerProps {
  onPost: (body: string) => void;
}

function CommentComposer({ onPost }: CommentComposerProps) {
  const [body, setBody] = React.useState('');
  const [isPosting, setIsPosting] = React.useState(false);

  const handleSubmit = () => {
    if (!body.trim() || isPosting) return;
    onPost(body.trim());
    setBody('');
    setIsPosting(true);
    window.setTimeout(() => {
      setIsPosting(false);
      toast({
        variant: 'success',
        title: 'Comment posted',
        description: 'Your comment appeared instantly in the thread.',
      });
    }, 600);
  };

  return (
    <div className="flex gap-3">
      <Avatar size="sm" className="mt-0.5 shrink-0">
        <AvatarFallback className={CURRENT_USER.avatarClass}>
          {CURRENT_USER.initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <MentionTextarea
          value={body}
          onChange={setBody}
          placeholder="Share your thoughts on the design system..."
          className="min-h-20"
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-muted-foreground"
              onClick={() =>
                toast({
                  variant: 'info',
                  title: 'Attachments',
                  description: 'File picker would open here.',
                })
              }
            >
              <Paperclip className="h-4 w-4" />
              Attach
            </Button>
            <span className="hidden items-center gap-1 text-[11px] text-muted-foreground sm:inline-flex">
              <AtSign className="h-3 w-3" />
              Type <Kbd>@</Kbd> to mention someone
            </span>
          </div>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!body.trim()}
            loading={isPosting}
          >
            Comment
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ReplyComposerProps {
  onCancel: () => void;
  onPost: (body: string) => void;
  placeholder: string;
}

function ReplyComposer({ onCancel, onPost, placeholder }: ReplyComposerProps) {
  const [body, setBody] = React.useState('');
  const [isPosting, setIsPosting] = React.useState(false);

  const handleSubmit = () => {
    if (!body.trim() || isPosting) return;
    onPost(body.trim());
    setBody('');
    setIsPosting(true);
    window.setTimeout(() => {
      setIsPosting(false);
      toast({
        variant: 'success',
        title: 'Reply posted',
        description: 'Your reply was added to the thread.',
      });
    }, 500);
  };

  return (
    <div className="flex gap-2.5">
      <Avatar size="sm" className="mt-0.5 shrink-0">
        <AvatarFallback className={CURRENT_USER.avatarClass}>
          {CURRENT_USER.initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <MentionTextarea
          value={body}
          onChange={setBody}
          placeholder={placeholder}
          className="min-h-16"
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!body.trim()}
            loading={isPosting}
          >
            Reply
          </Button>
        </div>
      </div>
    </div>
  );
}

interface EditBodyProps {
  initial: string;
  onSave: (body: string) => void;
  onCancel: () => void;
}

function EditBody({ initial, onSave, onCancel }: EditBodyProps) {
  const [body, setBody] = React.useState(initial);

  return (
    <div className="mt-2 space-y-2">
      <Textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        className="min-h-16 text-sm"
        autoFocus
      />
      <div className="flex justify-end gap-2">
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => onSave(body.trim())}
          disabled={!body.trim()}
        >
          Save
        </Button>
      </div>
    </div>
  );
}

interface ReplyItemProps {
  reply: ReplyData;
  isEditing: boolean;
  isReplying: boolean;
  onToggleLike: () => void;
  onReply: () => void;
  onCancelReply: () => void;
  onEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onSaveEdit: (body: string) => void;
  onPostReply: (body: string) => void;
}

function ReplyItem({
  reply,
  isEditing,
  isReplying,
  onToggleLike,
  onReply,
  onCancelReply,
  onEdit,
  onCancelEdit,
  onDelete,
  onSaveEdit,
  onPostReply,
}: ReplyItemProps) {
  return (
    <div className="flex gap-3">
      <Avatar size="sm" className="mt-0.5 shrink-0">
        <AvatarFallback className={reply.author.avatarClass}>
          {reply.author.initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="text-sm font-semibold text-foreground">
            {reply.author.name}
          </span>
          {reply.author.role && (
            <Badge variant="muted" size="sm">
              {reply.author.role}
            </Badge>
          )}
          <span className="text-[11px] text-muted-foreground">
            · {reply.createdAtLabel}
          </span>
        </div>

        {isEditing ? (
          <EditBody
            initial={reply.body}
            onSave={onSaveEdit}
            onCancel={onCancelEdit}
          />
        ) : (
          <p className="mt-1 text-sm leading-relaxed text-foreground/90">
            {reply.body}
          </p>
        )}

        <div className="mt-1.5 flex flex-wrap items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              'h-7 gap-1 text-xs',
              reply.likedByMe ? 'text-destructive' : 'text-muted-foreground'
            )}
            onClick={onToggleLike}
            aria-pressed={reply.likedByMe}
          >
            <Heart
              className={cn('h-3.5 w-3.5', reply.likedByMe && 'fill-current')}
            />
            {reply.likes}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={onReply}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Reply
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={onEdit}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>

        {isReplying && (
          <div className="mt-2">
            <ReplyComposer
              onCancel={onCancelReply}
              onPost={onPostReply}
              placeholder={`Reply to ${reply.author.name}...`}
            />
          </div>
        )}
      </div>
    </div>
  );
}

interface CommentCardProps {
  comment: CommentData;
  editingId: string | null;
  replyToId: string | null;
  onToggleLike: () => void;
  onToggleCollapse: () => void;
  onReply: () => void;
  onCancelReply: () => void;
  onEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onSaveEdit: (body: string) => void;
  onPostReply: (body: string) => void;
  replies: ReplyHandlers;
}

function CommentCard({
  comment,
  editingId,
  replyToId,
  onToggleLike,
  onToggleCollapse,
  onReply,
  onCancelReply,
  onEdit,
  onCancelEdit,
  onDelete,
  onSaveEdit,
  onPostReply,
  replies,
}: CommentCardProps) {
  return (
    <Card className="border-border">
      <CardContent className="space-y-3 p-5">
        <div className="flex items-start gap-3">
          <Avatar size="sm" className="mt-0.5 shrink-0">
            <AvatarFallback className={comment.author.avatarClass}>
              {comment.author.initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="text-sm font-semibold text-foreground">
                {comment.author.name}
              </span>
              {comment.author.role && (
                <Badge variant="muted" size="sm">
                  {comment.author.role}
                </Badge>
              )}
              <span className="text-[11px] text-muted-foreground">
                · {comment.createdAtLabel}
              </span>
            </div>

            {editingId === comment.id ? (
              <EditBody
                initial={comment.body}
                onSave={onSaveEdit}
                onCancel={onCancelEdit}
              />
            ) : (
              <p className="mt-1 text-sm leading-relaxed text-foreground/90">
                {comment.body}
              </p>
            )}

            <div className="mt-2 flex flex-wrap items-center gap-0.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  'h-7 gap-1 text-xs',
                  comment.likedByMe ? 'text-destructive' : 'text-muted-foreground'
                )}
                onClick={onToggleLike}
                aria-pressed={comment.likedByMe}
              >
                <Heart
                  className={cn('h-3.5 w-3.5', comment.likedByMe && 'fill-current')}
                />
                {comment.likes}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={onReply}
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Reply
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={onEdit}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-destructive hover:text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
              {comment.replies.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 text-xs text-muted-foreground"
                  onClick={onToggleCollapse}
                >
                  <ChevronDown
                    className={cn(
                      'h-3.5 w-3.5 transition-transform',
                      comment.collapsed && '-rotate-90'
                    )}
                  />
                  {comment.collapsed
                    ? `Show ${comment.replies.length} repl${comment.replies.length === 1 ? 'y' : 'ies'}`
                    : 'Hide replies'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {replyToId === comment.id && (
          <ReplyComposer
            onCancel={onCancelReply}
            onPost={onPostReply}
            placeholder={`Reply to ${comment.author.name}...`}
          />
        )}

        {!comment.collapsed &&
          (comment.replies.length > 0 ? (
            <div className="ml-4 space-y-4 border-l-2 border-border pl-4 sm:ml-10">
              {comment.replies.map((reply) => (
                <ReplyItem
                  key={reply.id}
                  reply={reply}
                  isEditing={replies.isEditing(reply.id)}
                  isReplying={replies.isReplying(reply.id)}
                  onToggleLike={() => replies.onToggleLike(reply.id)}
                  onReply={() => replies.onReply(reply.id)}
                  onCancelReply={() => replies.onCancelReply(reply.id)}
                  onEdit={() => replies.onEdit(reply.id)}
                  onCancelEdit={() => replies.onCancelEdit(reply.id)}
                  onDelete={() => replies.onDelete(reply.id)}
                  onSaveEdit={(body) => replies.onSaveEdit(reply.id, body)}
                  onPostReply={(body) => replies.onPostReply(reply.id, body)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={MessageCircleOff}
              title="No replies yet"
              description={`Be the first to respond to ${comment.author.name}.`}
              actionLabel="Reply"
              onAction={onReply}
              className="p-6"
            />
          ))}
      </CardContent>
    </Card>
  );
}

export default function CommentsPage() {
  const [comments, setComments] = React.useState<CommentData[]>(INITIAL_COMMENTS);
  const [sortMode, setSortMode] = React.useState<SortMode>('newest');
  const [isLoading, setIsLoading] = React.useState(true);
  const [replyToId, setReplyToId] = React.useState<string | null>(null);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<DeleteTarget | null>(null);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 600);
    return () => window.clearTimeout(timer);
  }, []);

  const totalReplies = comments.reduce((sum, comment) => sum + comment.replies.length, 0);

  const sortedComments = React.useMemo(() => {
    const list = [...comments];
    list.sort((a, b) =>
      sortMode === 'top' ? commentScore(b) - commentScore(a) : b.timestamp - a.timestamp
    );
    return list;
  }, [comments, sortMode]);

  const updateComment = (id: string, updater: (comment: CommentData) => CommentData) =>
    setComments((prev) => prev.map((c) => (c.id === id ? updater(c) : c)));

  const toggleCommentLike = (id: string) =>
    updateComment(id, (c) => ({
      ...c,
      likedByMe: !c.likedByMe,
      likes: c.likes + (c.likedByMe ? -1 : 1),
    }));

  const toggleReplyLike = (commentId: string, replyId: string) =>
    updateComment(commentId, (c) => ({
      ...c,
      replies: c.replies.map((r) =>
        r.id === replyId
          ? { ...r, likedByMe: !r.likedByMe, likes: r.likes + (r.likedByMe ? -1 : 1) }
          : r
      ),
    }));

  const addReply = (commentId: string, body: string) =>
    updateComment(commentId, (c) => ({
      ...c,
      replies: [...c.replies, createReply(body)],
    }));

  const toggleCollapse = (id: string) =>
    updateComment(id, (c) => ({ ...c, collapsed: !c.collapsed }));

  const deleteComment = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
    toast({
      variant: 'success',
      title: 'Comment deleted',
      description: 'The comment was removed from the thread.',
    });
  };

  const deleteReply = (commentId: string, replyId: string) => {
    updateComment(commentId, (c) => ({
      ...c,
      replies: c.replies.filter((r) => r.id !== replyId),
    }));
    toast({
      variant: 'success',
      title: 'Reply deleted',
      description: 'The reply was removed from the thread.',
    });
  };

  const editComment = (id: string, body: string) => {
    updateComment(id, (c) => ({ ...c, body }));
    setEditingId(null);
    toast({
      variant: 'success',
      title: 'Comment updated',
      description: 'Changes saved.',
    });
  };

  const editReply = (commentId: string, replyId: string, body: string) => {
    updateComment(commentId, (c) => ({
      ...c,
      replies: c.replies.map((r) => (r.id === replyId ? { ...r, body } : r)),
    }));
    setEditingId(null);
    toast({
      variant: 'success',
      title: 'Reply updated',
      description: 'Changes saved.',
    });
  };

  const handlePost = (body: string) => {
    setComments((prev) => [
      {
        id: `c-new-${Date.now()}`,
        author: CURRENT_USER,
        body,
        createdAtLabel: 'Just now',
        timestamp: Date.now(),
        likes: 0,
        likedByMe: false,
        collapsed: false,
        replies: [],
      },
      ...prev,
    ]);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'comment') {
      deleteComment(deleteTarget.id);
    } else {
      deleteReply(deleteTarget.commentId, deleteTarget.replyId);
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={MessagesSquare}
        title="Threaded Comments &amp; Discussions"
        description="A rich discussion thread with an optimistic comment composer, @mention suggestions, like/reply/edit/delete actions, collapsible reply threads, and Newest/Top sorting."
      />

      <section id="composer" className="space-y-4 scroll-mt-20">
        <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
          <PenLine className="h-6 w-6 text-highlight" />
          <span>Comment Composer</span>
        </h2>

        <Card className="border-border">
          <CardHeader className="gap-1.5">
            <CardTitle>Start a discussion</CardTitle>
            <CardDescription>
              Comments post optimistically — they appear instantly while the save is simulated in
              the background.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CommentComposer onPost={handlePost} />
          </CardContent>
        </Card>
      </section>

      <section id="discussion" className="space-y-4 scroll-mt-20">
        <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
          <MessagesSquare className="h-6 w-6 text-highlight" />
          <span>Threaded Discussion</span>
        </h2>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <SegmentedControl
            type="single"
            value={sortMode}
            onValueChange={(value) => {
              if (value) setSortMode(value as SortMode);
            }}
            aria-label="Sort comments"
          >
            <SegmentedControlItem value="newest">Newest</SegmentedControlItem>
            <SegmentedControlItem value="top">Top</SegmentedControlItem>
          </SegmentedControl>
          <span className="text-xs text-muted-foreground">
            {comments.length} comment{comments.length === 1 ? '' : 's'} ·{' '}
            {totalReplies} repl{totalReplies === 1 ? 'y' : 'ies'}
          </span>
        </div>

        {isLoading ? (
          <Card className="border-border">
            <CardContent className="space-y-5 p-5">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex gap-3">
                  <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3.5 w-28 rounded-md" />
                      <Skeleton className="h-3 w-16 rounded-md" />
                    </div>
                    <Skeleton className="h-3.5 w-full rounded-md" />
                    <Skeleton className="h-3.5 w-3/4 rounded-md" />
                    <Skeleton className="h-3 w-24 rounded-md" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-5">
            {sortedComments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                editingId={editingId}
                replyToId={replyToId}
                onToggleLike={() => toggleCommentLike(comment.id)}
                onToggleCollapse={() => toggleCollapse(comment.id)}
                onReply={() =>
                  setReplyToId(replyToId === comment.id ? null : comment.id)
                }
                onCancelReply={() => setReplyToId(null)}
                onEdit={() =>
                  setEditingId(editingId === comment.id ? null : comment.id)
                }
                onCancelEdit={() => setEditingId(null)}
                onDelete={() => setDeleteTarget({ type: 'comment', id: comment.id })}
                onSaveEdit={(body) => editComment(comment.id, body)}
                onPostReply={(body) => {
                  addReply(comment.id, body);
                  setReplyToId(null);
                }}
                replies={{
                  onToggleLike: (replyId) => toggleReplyLike(comment.id, replyId),
                  onReply: (replyId) =>
                    setReplyToId(replyToId === replyId ? null : replyId),
                  onCancelReply: () => setReplyToId(null),
                  onEdit: (replyId) =>
                    setEditingId(editingId === replyId ? null : replyId),
                  onCancelEdit: () => setEditingId(null),
                  onDelete: (replyId) =>
                    setDeleteTarget({ type: 'reply', commentId: comment.id, replyId }),
                  onSaveEdit: (replyId, body) =>
                    editReply(comment.id, replyId, body),
                  onPostReply: (_replyId, body) => {
                    addReply(comment.id, body);
                    setReplyToId(null);
                  },
                  isEditing: (replyId) => editingId === replyId,
                  isReplying: (replyId) => replyToId === replyId,
                }}
              />
            ))}
          </div>
        )}
      </section>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete this {deleteTarget?.type === 'comment' ? 'comment' : 'reply'}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The{' '}
              {deleteTarget?.type === 'comment' ? 'comment and its replies' : 'reply'} will be
              permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              <Trash2 className="h-4 w-4" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}