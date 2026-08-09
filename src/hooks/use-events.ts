"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiJson } from "@/lib/api-client";
import type { PaginatedResult } from "@/lib/pagination";

export interface EventItem {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  location: string | null;
  hostedBy?: string | null;
  collaborations?: string | null;
  type: string;
  status: string;
  clubId: string | null;
  club: { id: string; name: string } | null;
  attendees: number;
  maxAttendees: number | null;
  registrationOpensAt: string | null;
  registrationClosesAt: string | null;
  onSiteRegistration?: boolean;
  budget: number | null;
  bannerUrl: string | null;
  minutesPdfUrl: string | null;
  forDistrictNewsletter?: boolean;
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
    queryFn: () => apiJson<PaginatedResult<EventItem>>(`/api/events?${buildQs(filters)}`),
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ["events", id],
    queryFn: () => apiJson<EventItem>(`/api/events/${id}`),
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiJson<{ id: string }>("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({ queryKey: ["reporting", "events-portal"] });
    },
  });
}

export function useUpdateEvent(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiJson(`/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({ queryKey: ["events", id] });
      qc.invalidateQueries({ queryKey: ["reporting", "events-portal"] });
      qc.invalidateQueries({ queryKey: ["reporting", "club-reports"] });
    },
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiJson(`/api/events/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

export async function uploadEventFile(eventId: string, type: "banner" | "minutes" | "gallery", file: File, caption?: string) {
  const fd = new FormData();
  fd.append("file", file);
  if (caption) fd.append("caption", caption);
  return apiJson(`/api/events/${eventId}/${type === "gallery" ? "gallery" : type}`, {
    method: "POST",
    body: fd,
  });
}
