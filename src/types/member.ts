import type { MemberRole, MemberStatus } from "@/generated/prisma/client";

export interface MemberListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: string;
  riId: string | null;
  profession: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  duesPaid: string | null;
  duesProofUrl: string | null;
  bloodGroup: string | null;
  whatsapp: string | null;
  avatar: string | null;
  points: number;
  club: {
    id: string;
    name: string;
  };
}

export interface MemberDetail extends MemberListItem {
  bio: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MemberFilters {
  search?: string;
  clubId?: string;
  role?: MemberRole;
  status?: MemberStatus;
  page?: number;
  limit?: number;
}
