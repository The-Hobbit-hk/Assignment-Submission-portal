import type { ClubStatus, EventStatus, EventType } from "@/generated/prisma/client";

export interface ClubListItem {
  id: string;
  name: string;
  charterNumber: string | null;
  city: string | null;
  zone: string | null;
  status: ClubStatus;
  foundedAt: string | null;
  serviceHours: number;
  memberCount: number;
  eventCount: number;
  president: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  secretary: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  logo: string | null;
}

export interface ClubDetail extends Omit<ClubListItem, "memberCount" | "eventCount"> {
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClubAnalytics {
  totalMembers: number;
  activeMembers: number;
  totalEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  totalServiceHours: number;
  averageAttendance: number;
  citationsApproved: number;
  citationPoints: number;
  citationsSubmitted: number;
  citationsInProgress: number;
  memberGrowth: { month: string; count: number }[];
}

export interface ClubPerformance {
  score: number;
  rank: number;
  metrics: {
    label: string;
    value: number;
    target: number;
    unit: string;
  }[];
}

export interface ClubEventItem {
  id: string;
  title: string;
  startDate: string;
  endDate: string | null;
  location: string | null;
  type: EventType;
  status: EventStatus;
  attendees: number;
  serviceHours: number;
}
