'use client';

import * as React from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Trash2,
  Pencil,
  Users,
  Sparkles,
  MapPin,
  ListTodo,
  CheckCircle2,
} from 'lucide-react';
import {
  PageHeader,
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Textarea,
  Label,
  Skeleton,
  Avatar,
  AvatarFallback,
  Calendar,
  Popover,
  PopoverTrigger,
  PopoverContent,
  TimePicker,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  EmptyState,
  toast,
  ToastAction,
} from '@ds/ui';
import {
  addDays,
  addMonths,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  subMonths,
} from 'date-fns';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  start: string;
  end: string;
  category: 'meeting' | 'focus' | 'personal' | 'deadline';
  location: string;
  attendees: string[];
}

const CATEGORIES = {
  meeting: { label: 'Meeting', color: 'bg-highlight', text: 'text-highlight' },
  focus: { label: 'Focus', color: 'bg-primary', text: 'text-primary' },
  personal: { label: 'Personal', color: 'bg-success', text: 'text-success' },
  deadline: { label: 'Deadline', color: 'bg-destructive', text: 'text-destructive' },
} as const;

type CategoryKey = keyof typeof CATEGORIES;

const ATTENDEE_POOL = ['AL', 'BW', 'CM', 'DN', 'ER'];

function seedEvents(): CalendarEvent[] {
  const base = new Date();
  const mk = (offset: number) => addDays(base, offset);
  const data: Array<[number, string, CategoryKey, string, string, string, string]> = [
    [0, 'Product Review', 'meeting', '09:00', '10:00', 'War Room B', 'Demo of the new campaign builder'],
    [0, 'Deep Work Block', 'focus', '11:00', '13:00', 'Focus Room', 'Ship the virtualized list'],
    [1, 'Design Sync', 'meeting', '14:00', '15:00', 'Zoom', 'Sync on OKLCH token migration'],
    [1, 'Gym Session', 'personal', '18:30', '19:30', 'Fitness Center', 'Leg day'],
    [2, 'Client Demo', 'meeting', '10:30', '11:30', 'Auditorium', 'LumenUI 2.0 for Finora'],
    [3, 'Sprint Planning', 'meeting', '09:30', '10:30', 'War Room A', 'Plan the billing sprint'],
    [3, 'Design Review', 'deadline', '15:00', '16:00', 'Critique Wall', 'Final pass on marketing blocks'],
    [4, '1:1 with Alex', 'meeting', '16:00', '16:30', 'Room 12', 'Career growth discussion'],
    [5, 'Hackathon Kickoff', 'personal', '17:00', '21:00', 'Atrium', 'OKLCH Hackathon'],
    [6, 'Release Cutoff', 'deadline', '12:00', '12:00', 'CI Pipeline', 'Freeze for v2.0.0'],
    [-1, 'Onboarding Prep', 'focus', '09:00', '11:00', 'Onboarding Room', 'Prepare tour steps'],
    [-3, 'Contract Review', 'deadline', '13:00', '14:00', 'Legal Office', 'Review vendor contract'],
    [-2, 'Team Lunch', 'personal', '12:30', '13:30', 'Cafeteria', 'Birthday lunch for Dewi'],
  ];
  return data.map(([offset, title, category, start, end, location, description], i) => ({
    id: `evt-${i}`,
    title,
    description,
    date: mk(offset),
    start,
    end,
    category,
    location,
    attendees: ATTENDEE_POOL.slice(i % 3, (i % 3) + 2),
  }));
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export default function CalendarPage() {
  const today = new Date();
  const [visibleMonth, setVisibleMonth] = React.useState<Date>(startOfMonth(today));
  const [selectedDate, setSelectedDate] = React.useState<Date>(today);
  const [events, setEvents] = React.useState<CalendarEvent[]>(seedEvents);
  const [view, setView] = React.useState<'month' | 'week'>('month');
  const [isLoading, setIsLoading] = React.useState(true);

  // add/edit dialog state
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CalendarEvent | null>(null);
  const [draftTitle, setDraftTitle] = React.useState('');
  const [draftTitleError, setDraftTitleError] = React.useState<string | null>(null);
  const [draftDate, setDraftDate] = React.useState<Date>(today);
  const [draftStart, setDraftStart] = React.useState('09:00');
  const [draftEnd, setDraftEnd] = React.useState('10:00');
  const [draftCategory, setDraftCategory] = React.useState<CategoryKey>('meeting');
  const [draftLocation, setDraftLocation] = React.useState('');
  const [draftDescription, setDraftDescription] = React.useState('');
  const [deleteTarget, setDeleteTarget] = React.useState<CalendarEvent | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const dayEvents = React.useMemo(
    () => events.filter((e) => isSameDay(e.date, selectedDate)),
    [events, selectedDate]
  );

  const monthEvents = React.useMemo(
    () => events.filter((e) => isSameMonth(e.date, visibleMonth)),
    [events, visibleMonth]
  );

  const weekStart = React.useMemo(() => {
    const day = selectedDate.getDay();
    return addDays(selectedDate, day === 0 ? -6 : 1 - day);
  }, [selectedDate]);

  const weekDays = React.useMemo(
    () => Array.from({ length: 5 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const openCreate = (date: Date) => {
    setEditing(null);
    setDraftTitle('');
    setDraftTitleError(null);
    setDraftDate(date);
    setDraftStart('09:00');
    setDraftEnd('10:00');
    setDraftCategory('meeting');
    setDraftLocation('');
    setDraftDescription('');
    setDialogOpen(true);
  };

  const openEdit = (event: CalendarEvent) => {
    setEditing(event);
    setDraftTitle(event.title);
    setDraftTitleError(null);
    setDraftDate(event.date);
    setDraftStart(event.start);
    setDraftEnd(event.end);
    setDraftCategory(event.category);
    setDraftLocation(event.location);
    setDraftDescription(event.description);
    setDialogOpen(true);
  };

  const saveEvent = () => {
    if (!draftTitle.trim()) {
      setDraftTitleError('Event title cannot be empty.');
      return;
    }
    setDraftTitleError(null);

    if (editing) {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === editing.id
            ? {
                ...e,
                title: draftTitle.trim(),
                description: draftDescription,
                date: draftDate,
                start: draftStart,
                end: draftEnd,
                category: draftCategory,
                location: draftLocation,
              }
            : e
        )
      );
      toast({ variant: 'success', title: 'Event updated', description: `"${draftTitle.trim()}" was saved.` });
    } else {
      const newEvent: CalendarEvent = {
        id: `evt-${Date.now()}`,
        title: draftTitle.trim(),
        description: draftDescription,
        date: draftDate,
        start: draftStart,
        end: draftEnd,
        category: draftCategory,
        location: draftLocation,
        attendees: ATTENDEE_POOL.slice(0, 2),
      };
      setEvents((prev) => [...prev, newEvent]);
      setSelectedDate(draftDate);
      toast({ variant: 'success', title: 'Event created', description: `"${draftTitle.trim()}" was added to your calendar.` });
    }
    setDialogOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setEvents((prev) => prev.filter((e) => e.id !== deleteTarget.id));
    toast({
      variant: 'success',
      title: 'Event deleted',
      description: `"${deleteTarget.title}" was removed.`,
      action: (
        <ToastAction altText="Undo delete" onClick={() => setEvents((prev) => [...prev, deleteTarget])}>
          Undo
        </ToastAction>
      ),
    });
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={CalendarDays}
        title="Calendar & Event Scheduling"
        description="A month/week event scheduling dashboard with day detail panels, inline creation and editing, and destructive confirmations for deletion."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="highlight" className="font-mono text-xs">
              Month · Week
            </Badge>
            <Button size="sm" onClick={() => openCreate(selectedDate)} className="gap-1.5">
              <Plus className="h-4 w-4" />
              New Event
            </Button>
          </div>
        }
      />

      {/* Toolbar */}
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" aria-label="Previous month" onClick={() => setVisibleMonth((m) => subMonths(m, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" aria-label="Next month" onClick={() => setVisibleMonth((m) => addMonths(m, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setVisibleMonth(startOfMonth(today));
              setSelectedDate(today);
            }}
          >
            Today
          </Button>
          <h2 className="text-lg font-bold text-foreground font-display ml-1">
            {format(visibleMonth, 'MMMM yyyy')}
          </h2>
        </div>

        <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-card p-1">
          {(['month', 'week'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                view === v
                  ? 'bg-highlight text-highlight-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {v === 'month' ? 'Month' : 'Week'}
            </button>
          ))}
        </div>
      </section>

      {/* Category legend */}
      <div className="flex flex-wrap items-center gap-4">
        {(Object.keys(CATEGORIES) as CategoryKey[]).map((key) => (
          <span key={key} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={`h-2.5 w-2.5 rounded-full ${CATEGORIES[key].color}`} />
            {CATEGORIES[key].label}
          </span>
        ))}
        <span className="text-xs text-muted-foreground ml-auto font-mono">
          {monthEvents.length} events this month
        </span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Skeleton className="h-[420px] xl:col-span-2 rounded-2xl" />
          <Skeleton className="h-[420px] rounded-2xl" />
        </div>
      ) : view === 'month' ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          {/* Month grid */}
          <Card className="xl:col-span-2 border-border">
            <CardContent className="p-4 sm:p-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(day) => day && setSelectedDate(day)}
                onMonthChange={setVisibleMonth}
                month={visibleMonth}
                className="w-full"
              />
              {/* Mini event chips under the calendar */}
              <div className="mt-4 space-y-2 border-t border-border/60 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                  {format(visibleMonth, 'MMMM')} overview
                </p>
                <div className="flex flex-wrap gap-2">
                  {monthEvents.slice(0, 8).map((e) => (
                    <button
                      key={e.id}
                      onClick={() => setSelectedDate(e.date)}
                      className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-highlight/40 transition-colors"
                    >
                      <span className={`h-2 w-2 rounded-full ${CATEGORIES[e.category].color}`} />
                      <span className="font-mono">{format(e.date, 'd')}</span>
                      {e.title}
                    </button>
                  ))}
                  {monthEvents.length === 0 && (
                    <p className="text-xs text-muted-foreground">No events this month.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Day events panel */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <ListTodo className="h-4 w-4 text-highlight" />
                {format(selectedDate, 'EEEE, MMM d')}
              </CardTitle>
              <CardDescription className="text-xs">
                {dayEvents.length === 0
                  ? 'Nothing scheduled — enjoy the day.'
                  : `${dayEvents.length} event${dayEvents.length > 1 ? 's' : ''} on this day`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {dayEvents.length === 0 ? (
                <EmptyState
                  icon={CheckCircle2}
                  title="Clear day"
                  description="No events scheduled for this date."
                  actionLabel="Add an event"
                  onAction={() => openCreate(selectedDate)}
                />
              ) : (
                dayEvents.map((e) => (
                  <div
                    key={e.id}
                    className="group rounded-xl border border-border/60 bg-muted/10 p-3 transition-colors hover:border-highlight/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${CATEGORIES[e.category].color}`} />
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
                            {CATEGORIES[e.category].label}
                          </Badge>
                        </div>
                        <p className="text-sm font-semibold text-foreground">{e.title}</p>
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {e.start} – {e.end}
                        </p>
                        {e.location && (
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            {e.location}
                          </p>
                        )}
                        {e.description && (
                          <p className="text-xs text-muted-foreground leading-relaxed">{e.description}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" aria-label="Edit event" onClick={() => openEdit(e)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" aria-label="Delete event" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(e)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-1">
                      {e.attendees.map((a) => (
                        <Avatar key={a} className="h-6 w-6 border border-border">
                          <AvatarFallback className="text-[9px] font-mono font-bold">{a}</AvatarFallback>
                        </Avatar>
                      ))}
                      <Users className="h-3.5 w-3.5 text-muted-foreground ml-1" />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Week agenda */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {weekDays.map((day) => {
            const dayEvts = events.filter((e) => isSameDay(e.date, day));
            return (
              <Card
                key={day.toISOString()}
                className={`border-border ${isSameDay(day, selectedDate) ? 'ring-1 ring-highlight' : ''}`}
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-foreground">{WEEKDAYS[day.getDay() === 0 ? 4 : day.getDay() - 1]}</p>
                      <p className={`text-2xl font-extrabold font-display ${isSameDay(day, today) ? 'text-highlight' : 'text-foreground'}`}>
                        {format(day, 'd')}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Add event this day" onClick={() => openCreate(day)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-1.5">
                    {dayEvts.length === 0 ? (
                      <p className="text-xs text-muted-foreground/70">Free</p>
                    ) : (
                      dayEvts.map((e) => (
                        <button
                          key={e.id}
                          onClick={() => {
                            setSelectedDate(day);
                            setView('month');
                          }}
                          className="block w-full text-left rounded-md border border-border/60 bg-muted/20 px-2 py-1.5 text-[11px] hover:border-highlight/40 transition-colors"
                        >
                          <span className="flex items-center gap-1.5 font-semibold text-foreground">
                            <span className={`h-1.5 w-1.5 rounded-full ${CATEGORIES[e.category].color}`} />
                            {e.title}
                          </span>
                          <span className="font-mono text-muted-foreground">{e.start}</span>
                        </button>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">{editing ? 'Edit event' : 'Schedule new event'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update the details below and save your changes.' : 'Create a new event and it will appear on the calendar instantly.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="evt-title">Title</Label>
              <Input
                id="evt-title"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                placeholder="e.g. Sprint Planning"
                aria-invalid={!!draftTitleError}
              />
              {draftTitleError && <p className="text-xs text-destructive">{draftTitleError}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start font-normal">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      {format(draftDate, 'EEE, MMM d')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={draftDate} onSelect={(d) => d && setDraftDate(d)} />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={draftCategory} onValueChange={(v) => setDraftCategory(v as CategoryKey)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(CATEGORIES) as CategoryKey[]).map((key) => (
                      <SelectItem key={key} value={key}>
                        {CATEGORIES[key].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Start</Label>
                <TimePicker value={draftStart} onValueChange={setDraftStart} />
              </div>

              <div className="space-y-2">
                <Label>End</Label>
                <TimePicker value={draftEnd} onValueChange={setDraftEnd} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="evt-location">Location</Label>
              <Input
                id="evt-location"
                value={draftLocation}
                onChange={(e) => setDraftLocation(e.target.value)}
                placeholder="War Room A · Zoom · Coffee shop"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="evt-desc">Description</Label>
              <Textarea
                id="evt-desc"
                value={draftDescription}
                onChange={(e) => setDraftDescription(e.target.value)}
                placeholder="Agenda, links, or notes…"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="highlight" onClick={saveEvent}>
              {editing ? 'Save changes' : 'Create event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Delete this event?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong>{deleteTarget?.title}</strong> from the calendar. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmDelete}
            >
              <Trash2 className="h-4 w-4" />
              Delete event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Context card */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-highlight" />
            Pattern notes
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground leading-relaxed">
          <p>
            <strong className="text-foreground">Calendar token:</strong> the <code className="font-mono">Calendar</code> component wraps react-day-picker v10 with the design-system theme applied.
          </p>
          <p>
            <strong className="text-foreground">Destructive guard:</strong> deletion is always behind an <code className="font-mono">AlertDialog</code> with a success toast that offers Undo.
          </p>
          <p>
            <strong className="text-foreground">Perception:</strong> category colors double as legend chips, keeping color meaning consistent between grid, list, and agenda views.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}