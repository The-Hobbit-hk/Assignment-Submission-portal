import type { LucideIcon } from "lucide-react";
import {
  Award,
  BookOpen,
  CalendarDays,
  FileText,
  Gavel,
  ImageIcon,
  Users,
} from "lucide-react";

export const RESOURCE_CATEGORIES = [
  "All",
  "Handbooks",
  "Governance",
  "District",
  "Brand",
] as const;

export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number];

export const RESOURCE_META: Record<
  string,
  { category: Exclude<ResourceCategory, "All">; icon: LucideIcon }
> = {
  "rotaract-handbook": { category: "Handbooks", icon: BookOpen },
  "rotary-code-of-policies": { category: "Governance", icon: Gavel },
  "rotary-club-excellence-guide": { category: "Handbooks", icon: Award },
  "council-on-legislation": { category: "Governance", icon: FileText },
  "rotaract-directory": { category: "District", icon: Users },
  "district-calendar": { category: "District", icon: CalendarDays },
  "rotary-standard-constitution": { category: "Governance", icon: FileText },
  "manual-of-procedure": { category: "Governance", icon: BookOpen },
  "logo-resources": { category: "Brand", icon: ImageIcon },
  "awards-structure-riy-2026-27": { category: "District", icon: Award },
};
