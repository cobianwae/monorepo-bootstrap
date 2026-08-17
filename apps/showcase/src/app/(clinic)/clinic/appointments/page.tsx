'use client';

import * as React from 'react';
import {
  CalendarClock,
  Plus,
  CheckCircle2,
  Clock,
  Stethoscope,
  Trash2,
  Calendar,
  Building,
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Avatar,
  AvatarImage,
  AvatarFallback,
  KanbanBoard,
} from '@ds/ui';
import type { KanbanColumnData, KanbanItemData } from '@ds/ui';
import { PageHeader } from '@ds/ui';
import { useClinic } from '@/scenarios/clinic/store/clinic-context';
import type {
  AppointmentStatus,
  AppointmentType,
  PractitionerRole,
} from '@/scenarios/clinic/types';

const COLUMNS: Array<{ id: AppointmentStatus; title: string }> = [
  { id: 'scheduled', title: 'Scheduled Bookings' },
  { id: 'checked-in', title: 'Checked-In (Waiting)' },
  { id: 'in-consult', title: 'In-Consultation' },
  { id: 'completed', title: 'Completed Sessions' },
  { id: 'no-show', title: 'No-Show / Cancelled' },
];

export default function AppointmentsPage() {
  const {
    appointments,
    patients,
    staff,
    addAppointment,
    updateAppointmentStatus,
    deleteAppointment,
  } = useClinic();

  const [roleFilter, setRoleFilter] = React.useState<string>('all');
  const [selectedDate, setSelectedDate] = React.useState('2024-03-16');
  const [isBookModalOpen, setIsBookModalOpen] = React.useState(false);
  const [apptToCancel, setApptToCancel] = React.useState<string | null>(null);

  // New Booking Form State
  const [patientId, setPatientId] = React.useState('PAT-1001');
  const [practitionerRole, setPractitionerRole] = React.useState<PractitionerRole>('doctor');
  const [practitionerName, setPractitionerName] = React.useState('Dr. Evelyn Vance, M.D., Ph.D.');
  const [type, setType] = React.useState<AppointmentType>('doctor-followup');
  const [date, setDate] = React.useState('2024-03-16');
  const [timeSlot, setTimeSlot] = React.useState('15:00 - 15:45');
  const [room, setRoom] = React.useState('Suite 1A');
  const [notes, setNotes] = React.useState('');

  const filteredAppointments = React.useMemo(() => {
    return appointments.filter((a) => {
      const matchesRole = roleFilter === 'all' || a.practitionerRole === roleFilter;
      const matchesDate = !selectedDate || a.date === selectedDate;
      return matchesRole && matchesDate;
    });
  }, [appointments, roleFilter, selectedDate]);

  const kanbanColumns: KanbanColumnData[] = React.useMemo(
    () =>
      COLUMNS.map((col) => ({
        id: col.id,
        title: col.title,
        items: filteredAppointments
          .filter((a) => a.status === col.id)
          .map((a) => a.id),
      })),
    [filteredAppointments]
  );

  const kanbanItems: Record<string, KanbanItemData> = React.useMemo(
    () =>
      Object.fromEntries(
        filteredAppointments.map((a) => [
          a.id,
          { id: a.id, title: a.patientName, label: a.timeSlot },
        ])
      ),
    [filteredAppointments]
  );

  const handleColumnsChange = (next: KanbanColumnData[]) => {
    for (const column of next) {
      const prev = kanbanColumns.find((c) => c.id === column.id);
      const prevIds = new Set(prev?.items ?? []);
      for (const itemId of column.items) {
        if (!prevIds.has(itemId)) {
          updateAppointmentStatus(itemId, column.id as AppointmentStatus);
        }
      }
    }
  };

  const renderAppointmentCard = (item: KanbanItemData) => {
    const appt = appointments.find((a) => a.id === item.id);
    if (!appt) return null;

    return (
      <Card className="p-3.5 bg-card border-border shadow-xs hover:border-primary/50 transition-all space-y-2.5">
        {/* Header: Patient Info & Avatar */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Avatar size="sm" className="h-7 w-7">
              {appt.patientAvatar && (
                <AvatarImage src={appt.patientAvatar} alt={appt.patientName} />
              )}
              <AvatarFallback className="text-[10px] font-display">
                {appt.patientName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-display font-bold text-xs text-foreground leading-tight">
                {appt.patientName}
              </p>
              <span className="text-[10px] font-mono text-muted-foreground block">
                {appt.id}
              </span>
            </div>
          </div>

          <button
            onClick={() => setApptToCancel(appt.id)}
            className="text-muted-foreground hover:text-destructive transition-colors p-0.5 cursor-pointer"
            title="Cancel Appointment"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>

        {/* Slot & Room */}
        <div className="space-y-1 text-[11px] text-muted-foreground font-mono">
          <div className="flex items-center gap-1.5 text-foreground font-medium">
            <Clock className="h-3 w-3 text-primary" />
            <span>{appt.timeSlot}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Building className="h-3 w-3" />
            <span>
              {appt.room} • {appt.practitionerName.split(',')[0]}
            </span>
          </div>
        </div>

        {/* Type Badge */}
        <div>
          <Badge variant="outline" size="sm" className="text-[10px] h-4">
            {appt.type}
          </Badge>
        </div>

        {appt.notes && (
          <p className="text-[11px] text-muted-foreground bg-muted/30 p-2 rounded-md leading-tight line-clamp-2">
            {appt.notes}
          </p>
        )}

        {/* Transition Action Buttons */}
        <div className="pt-1 border-t border-border/30 flex items-center justify-end gap-1.5">
          {appt.status === 'scheduled' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateAppointmentStatus(appt.id, 'checked-in')}
              className="h-6 text-[10px] px-2 gap-1 text-warning border-warning/30 hover:bg-warning/10"
            >
              <CheckCircle2 className="h-3 w-3" />
              Check-In
            </Button>
          )}

          {appt.status === 'checked-in' && (
            <Button
              size="sm"
              variant="highlight"
              onClick={() => updateAppointmentStatus(appt.id, 'in-consult')}
              className="h-6 text-[10px] px-2 gap-1"
            >
              <Stethoscope className="h-3 w-3" />
              Call In
            </Button>
          )}

          {appt.status === 'in-consult' && (
            <Button
              size="sm"
              variant="success"
              onClick={() => updateAppointmentStatus(appt.id, 'completed')}
              className="h-6 text-[10px] px-2 gap-1"
            >
              <CheckCircle2 className="h-3 w-3" />
              Finish
            </Button>
          )}
        </div>
      </Card>
    );
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === patientId);
    if (!pat) return;

    addAppointment({
      patientId: pat.id,
      patientName: pat.name,
      patientAvatar: pat.avatarUrl,
      patientProgram: pat.program,
      practitionerRole,
      practitionerName,
      type,
      date,
      timeSlot,
      status: 'scheduled',
      room,
      notes,
    });

    setIsBookModalOpen(false);
    setNotes('');
  };

  const confirmCancel = () => {
    if (apptToCancel) {
      deleteAppointment(apptToCancel);
      setApptToCancel(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Page Header */}
      <PageHeader
        eyebrow="Clinical Schedule & Flow"
        eyebrowIcon={CalendarClock}
        title="Appointments & Scheduling Board"
        description="Daily patient flow tracking across Consultation, InBody Scanning, CBT-E Counseling, and Body Sculpting sessions."
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              size="sm"
              variant="highlight"
              onClick={() => setIsBookModalOpen(true)}
              className="gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Book Appointment
            </Button>
          </div>
        }
      />

      {/* Filter Toolbar */}
      <Card className="p-4 bg-card border-border shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-9 w-40 text-xs font-mono"
            />
          </div>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="h-9 w-44 text-xs">
              <SelectValue placeholder="All Disciplines" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Disciplines</SelectItem>
              <SelectItem value="doctor">Medical Doctors</SelectItem>
              <SelectItem value="psychologist">Psychologists</SelectItem>
              <SelectItem value="dietician">Dieticians / RD</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-xs font-mono text-muted-foreground">
          Showing <strong>{filteredAppointments.length}</strong> appointments for {selectedDate}
        </div>
      </Card>

      {/* 5-Column Kanban Board */}
      <KanbanBoard
        columns={kanbanColumns}
        items={kanbanItems}
        onColumnsChange={handleColumnsChange}
        renderItem={renderAppointmentCard}
        className="-mx-1 px-1"
      />

      {/* Book Appointment Modal Dialog */}
      <Dialog open={isBookModalOpen} onOpenChange={setIsBookModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleCreateAppointment} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="font-display text-base">Book Patient Appointment</DialogTitle>
              <DialogDescription className="text-xs">
                Schedule a consultation, therapy session, or lab measurement.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">Select Patient *</Label>
                <Select value={patientId} onValueChange={setPatientId}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.id}) — {p.program.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Practitioner Discipline</Label>
                <Select
                  value={practitionerRole}
                  onValueChange={(v) => {
                    setPractitionerRole(v as PractitionerRole);
                    const matched = staff.find((s) => s.role === v);
                    if (matched) {
                      setPractitionerName(matched.name);
                      setRoom(matched.room);
                    }
                  }}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor">Medical Doctor</SelectItem>
                    <SelectItem value="psychologist">Psychologist</SelectItem>
                    <SelectItem value="dietician">Dietician</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Practitioner</Label>
                <Select value={practitionerName} onValueChange={setPractitionerName}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {staff
                      .filter((s) => s.role === practitionerRole)
                      .map((s) => (
                        <SelectItem key={s.id} value={s.name}>
                          {s.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Appointment Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as AppointmentType)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initial-assessment">Initial Assessment</SelectItem>
                    <SelectItem value="doctor-followup">Doctor Follow-up</SelectItem>
                    <SelectItem value="glp1-titration">GLP-1 Titration Review</SelectItem>
                    <SelectItem value="dietician-mealplan">Dietician Meal Plan Review</SelectItem>
                    <SelectItem value="psychologist-counseling">Psychologist CBT-E Counseling</SelectItem>
                    <SelectItem value="inbody-scan">InBody Composition Scan</SelectItem>
                    <SelectItem value="emsculpt-session">HIFEM Body Contouring</SelectItem>
                    <SelectItem value="rf-lipolysis">RF Monopolar Lipolysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Room / Suite</Label>
                <Input
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Date</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Time Slot</Label>
                <Input
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="h-9 text-xs font-mono"
                  placeholder="e.g. 14:00 - 14:45"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">Clinical Notes / Reason for Visit</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="h-9 text-xs"
                  placeholder="e.g. Patient requested dosage review after mild nausea."
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsBookModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="highlight">
                Schedule Booking
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cancel Appointment Alert Dialog */}
      <AlertDialog open={Boolean(apptToCancel)} onOpenChange={(open) => !open && setApptToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-display">Cancel Appointment Booking?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              This will remove the appointment from today&apos;s schedule and notify the patient.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Cancel Appointment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
