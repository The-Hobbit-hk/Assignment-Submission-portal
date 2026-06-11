import {
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Shield,
  UserCircle,
  Users,
} from "lucide-react";
import type { NavItem } from "@/types/navigation";

export const mainNavigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "All Members",
    href: "/dashboard/members",
    icon: Users,
  },
  {
    title: "My Profile",
    href: "/dashboard/profile",
    icon: UserCircle,
  },
  {
    title: "Clubs",
    href: "/dashboard/clubs",
    icon: Building2,
  },
  {
    title: "Council Live Scores",
    href: "/dashboard/council-scores",
    icon: BarChart3,
  },
  {
    title: "Bluebook",
    href: "/dashboard/bluebook",
    icon: BookOpen,
  },
  {
    title: "Events",
    href: "/dashboard/events",
    icon: GraduationCap,
  },
  {
    title: "Reporting",
    icon: ClipboardList,
    children: [
      {
        title: "Admin",
        href: "/dashboard/reporting/admin",
        icon: Shield,
      },
      {
        title: "Events",
        href: "/dashboard/reporting/events",
        icon: CalendarDays,
      },
      {
        title: "Export",
        href: "/dashboard/reports",
        icon: Briefcase,
      },
    ],
  },
];

export const footerNavigation: NavItem[] = [
  {
    title: "Log Out",
    href: "/login",
    icon: LogOut,
    action: "signout",
  },
];
