import type { UserRole } from "@/types/auth";
import type { NavItem } from "@/types/navigation";
import { isZonalRepresentative } from "@/lib/zonal-reps";
import {
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  Shield,
  UserCheck,
  UserCircle,
  Users,
} from "lucide-react";

export const CLUB_ROLES: UserRole[] = ["CLUB_PRESIDENT", "CLUB_SECRETARY"];
export const DISTRICT_ROLES: UserRole[] = ["SUPER_ADMIN", "DISTRICT_ADMIN"];
export const SECRETARY_ROLES: UserRole[] = [
  "DISTRICT_SECRETARY",
  "REPORTING_SECRETARY",
  ...DISTRICT_ROLES,
];

export function isClubUser(role: UserRole) {
  return CLUB_ROLES.includes(role);
}

export function isCouncilMember(role: UserRole) {
  return role === "COUNCIL_MEMBER";
}

export function isDistrictSecretary(role: UserRole) {
  return role === "DISTRICT_SECRETARY" || DISTRICT_ROLES.includes(role);
}

export function isReportingSecretary(role: UserRole) {
  return role === "REPORTING_SECRETARY" || DISTRICT_ROLES.includes(role);
}

export function canAssignBluebook(role: UserRole) {
  return isDistrictSecretary(role);
}

export function canSubmitCouncilBluebook(role: UserRole) {
  return isCouncilMember(role) || DISTRICT_ROLES.includes(role);
}

export function canSubmitClubReporting(role: UserRole) {
  return isClubUser(role) || DISTRICT_ROLES.includes(role);
}

export function canViewAllClubReports(role: UserRole) {
  return isReportingSecretary(role);
}

export function canViewZoneClubReports(email?: string | null) {
  return !!email && isZonalRepresentative(email);
}

export function canViewClubReportingOverview(role: UserRole, email?: string | null) {
  return canViewAllClubReports(role) || canViewZoneClubReports(email);
}

export function getNavigationForRole(role: UserRole, email?: string | null): NavItem[] {
  const reportingChildren: NavItem[] = [];

  if (canSubmitClubReporting(role)) {
    reportingChildren.push(
      { title: "Monthly Reporting", href: "/dashboard/reporting", icon: ClipboardList },
      { title: "Admin Reporting", href: "/dashboard/reporting/admin", icon: Shield },
      { title: "Events Reporting", href: "/dashboard/reporting/events", icon: CalendarDays }
    );
  }

  if (canViewAllClubReports(role)) {
    reportingChildren.push({
      title: "Club Reports",
      href: "/dashboard/reporting/club-reports",
      icon: Building2,
    });
    reportingChildren.push(
      { title: "Export Admin", href: "/dashboard/reporting/export/admin", icon: Briefcase },
      { title: "Export Events", href: "/dashboard/reporting/export/events", icon: Briefcase }
    );
  } else if (canViewZoneClubReports(email)) {
    reportingChildren.push({
      title: "Zone Reporting",
      href: "/dashboard/reporting/club-reports",
      icon: Building2,
    });
  } else if (DISTRICT_ROLES.includes(role)) {
    reportingChildren.push({
      title: "Export",
      href: "/dashboard/reports",
      icon: Briefcase,
    });
  }

  const nav: NavItem[] = [{ title: "Dashboard", href: "/dashboard", icon: LayoutDashboard }];

  if (DISTRICT_ROLES.includes(role) || role === "REPORTING_SECRETARY") {
    nav.push(
      { title: "All Members", href: "/dashboard/members", icon: Users },
      { title: "Clubs", href: "/dashboard/clubs", icon: Building2 },
      { title: "Council Live Scores", href: "/dashboard/council-scores", icon: BarChart3 }
    );
  }

  if (isCouncilMember(role)) {
    nav.push({ title: "My Profile", href: "/dashboard/profile", icon: UserCircle });
  } else if (!isClubUser(role)) {
    nav.push({ title: "My Profile", href: "/dashboard/profile", icon: UserCircle });
  }

  if (canAssignBluebook(role)) {
    nav.push({
      title: "Task Assignment",
      href: "/dashboard/bluebook/assignments",
      icon: UserCheck,
    });
  }

  if (canSubmitCouncilBluebook(role) && isCouncilMember(role)) {
    nav.push({ title: "My Bluebook", href: "/dashboard/bluebook/my-tasks", icon: BookOpen });
  } else if (DISTRICT_ROLES.includes(role) || role === "DISTRICT_SECRETARY") {
    nav.push({ title: "Bluebook", href: "/dashboard/bluebook", icon: BookOpen });
  }

  if (reportingChildren.length > 0) {
    nav.push({ title: "Reporting", icon: ClipboardList, children: reportingChildren });
  }

  return nav;
}
