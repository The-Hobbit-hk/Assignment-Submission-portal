"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PaginatedResult } from "@/lib/pagination";

export interface EventItem {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  location: string | null;
  type: string;
  status: string;
  clubId: string | null;
  club: { id: string; name: string } | null;
  attendees: number;
  maxAttendees: number | null;
  registrationOpensAt: string | null;
  registrationClosesAt: string | null;
  serviceHours: number;
  budget: number | null;
  bannerUrl: string | null;
  minutesPdfUrl: string | null;
  registrationCount: number;
  gallery?: { id: string; url: string; caption: string | null; sortOrder: number }[];
  registrations?: { id: string; status: string; registeredAt: string; member: { id: string; firstName: string; lastName: string; email: string } }[];
}

interface EventFilters {
  search?: string;
  type?: string;
  status?: string;
  clubId?: string;
  month?: number;
  year?: number;
  page?: number;
  limit?: number;
}

function buildQs(f: EventFilters) {
  const p = new URLSearchParams();
  Object.entries(f).forEach(([k, v]) => v != null && p.set(k, String(v)));
  return p.toString();
}

export function useEvents(filters: EventFilters = {}) {
  return useQuery({
    queryKey: ["events", filters],
    queryFn: async (): Promise<PaginatedResult<EventItem>> => {
      const res = await fetch(`/api/events?${buildQs(filters)}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ["events", id],
    queryFn: async (): Promise<EventItem> => {
      const res = await fetch(`/api/events/${id}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error((await res.json()).error);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({ queryKey: ["reporting", "events-portal"] });
    },
  });
}

export function useUpdateEvent(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch(`/api/events/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error((await res.json()).error);
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["events"] }); qc.invalidateQueries({ queryKey: ["events", id] }); },
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useRegisterEvent(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (memberId: string) => {
      const res = await fetch(`/api/events/${eventId}/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events", eventId] }),
  });
}

export async function uploadEventFile(eventId: string, type: "banner" | "minutes" | "gallery", file: File, caption?: string) {
  const fd = new FormData();
  fd.append("file", file);
  if (caption) fd.append("caption", caption);
  const res = await fetch(`/api/events/${eventId}/${type === "gallery" ? "gallery" : type}`, { method: "POST", body: fd });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}
