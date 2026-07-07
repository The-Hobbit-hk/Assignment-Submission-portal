import type { UserRole } from "@/types/auth";
import type { NavItem } from "@/types/navigation";
import { isProfessionalAssistanceOfficer } from "@/lib/professional-assistance";
import { isZonalRepresentative } from "@/lib/zonal-reps";
import {
  Award,
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

export function canViewCouncilBluebookOverview(role: UserRole) {
  return canAssignBluebook(role);
}

/** Council roster roles that submit their own Blue Book (not the club track). */
export const COUNCIL_BLUEBOOK_PARTICIPANT_ROLES: UserRole[] = [
  "COUNCIL_MEMBER",
  "DISTRICT_SECRETARY",
  "REPORTING_SECRETARY",
];

export function canViewMyCouncilBluebook(role: UserRole) {
  return COUNCIL_BLUEBOOK_PARTICIPANT_ROLES.includes(role) || DISTRICT_ROLES.includes(role);
}

export function canSubmitCouncilBluebook(role: UserRole) {
  return canViewMyCouncilBluebook(role);
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

/** DRR (district admin) — create definitions, assign, and approve citations. */
export function canManageCitations(role: UserRole) {
  return DISTRICT_ROLES.includes(role);
}

export function canSubmitCitations(role: UserRole) {
  return isClubUser(role);
}

/**
 * Club (citation) standings — visible to club users and district oversight roles.
 * Council members are intentionally excluded: they only see council standings.
 */
export function canViewCitationStandings(role: UserRole) {
  return role !== "MEMBER" && !isCouncilMember(role);
}

/**
 * Council live-score standings — visible to council members and district
 * oversight roles. Club users are intentionally excluded: they only see club
 * standings.
 */
export function canViewCouncilStandings(role: UserRole) {
  return role !== "MEMBER" && !isClubUser(role);
}

/** Professional Assistance Officers and district admins can post jobs. */
export function canManageJobs(role: UserRole, email?: string | null) {
  return DISTRICT_ROLES.includes(role) || isProfessionalAssistanceOfficer(email);
}

export function canManageClubMembers(role: UserRole) {
  return isClubUser(role) || DISTRICT_ROLES.includes(role) || role === "REPORTING_SECRETARY";
}

/** District-wide member visibility (all clubs). Club users only see their own club. */
export function canViewAllMembers(role: UserRole) {
  return DISTRICT_ROLES.includes(role) || role === "REPORTING_SECRETARY";
}

/** Create / update / delete clubs and the club roster — district administration only. */
export function canManageClubs(role: UserRole) {
  return DISTRICT_ROLES.includes(role) || role === "REPORTING_SECRETARY";
}

/** Create / edit / delete district events and their media. */
export function canManageEvents(role: UserRole) {
  return SECRETARY_ROLES.includes(role);
}

/** Approve / score club Blue Book submissions, and export district reports. */
export function canReviewClubBluebook(role: UserRole) {
  return isDistrictSecretary(role);
}

export function canExportDistrictReports(role: UserRole) {
  return SECRETARY_ROLES.includes(role);
}

/** May fields like clubId / role / points be reassigned on a member record? */
export function canReassignMemberPrivilegedFields(role: UserRole) {
  return DISTRICT_ROLES.includes(role) || role === "REPORTING_SECRETARY";
}

export function canViewClubBluebook(role: UserRole) {
  return !isClubUser(role);
}

export function getNavigationForRole(
  role: UserRole,
  email?: string | null,
  clubId?: string | null
): NavItem[] {
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
      { title: "Clubs", href: "/dashboard/clubs", icon: Building2 }
    );
  } else if (isClubUser(role) && clubId) {
    nav.push(
      { title: "Members", href: `/dashboard/members?clubId=${clubId}`, icon: Users },
      { title: "My Club", href: `/dashboard/clubs/${clubId}`, icon: Building2 }
    );
  }

  if (canViewCouncilStandings(role)) {
    nav.push({
      title: "Council Live Scores",
      href: "/dashboard/council-scores",
      icon: BarChart3,
    });
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
    nav.push({
      title: "Council Submissions",
      href: "/dashboard/bluebook/council-overview",
      icon: ClipboardList,
    });
  }

  if (canViewMyCouncilBluebook(role)) {
    nav.push({ title: "My Bluebook", href: "/dashboard/bluebook/my-tasks", icon: BookOpen });
  }

  if (canManageCitations(role)) {
    nav.push({
      title: "DRR Citations",
      href: "/dashboard/citations",
      icon: Award,
      children: [
        { title: "Manage Citations", href: "/dashboard/citations", icon: Award },
        { title: "Citation Review", href: "/dashboard/citations/review", icon: ClipboardList },
      ],
    });
  } else if (canSubmitCitations(role)) {
    nav.push(
      { title: "My Citations", href: "/dashboard/citations/my", icon: Award },
      { title: "Club Standings", href: "/dashboard/citations/standings", icon: BarChart3 }
    );
  } else if (canViewCitationStandings(role)) {
    nav.push({
      title: "Citation Standings",
      href: "/dashboard/citations/standings",
      icon: BarChart3,
    });
  }

  if (reportingChildren.length > 0) {
    nav.push({ title: "Reporting", icon: ClipboardList, children: reportingChildren });
  }

  nav.push({ title: "Job Portal", href: "/dashboard/jobs", icon: Briefcase });

  return nav;
}
