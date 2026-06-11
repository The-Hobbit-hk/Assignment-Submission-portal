export interface KpiMetric {
  id: string;
  title: string;
  value: string | number;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: string;
}

export interface StatisticMetric {
  id: string;
  label: string;
  value: number;
  percentage: number;
  color: string;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  startDate: string;
  location: string | null;
  clubName: string | null;
  type: string;
}

export interface LeaderboardEntry {
  rank: number;
  memberId: string;
  name: string;
  clubName: string;
  points: number;
  avatar: string | null;
}

export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string | null;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: string;
}

export interface DashboardData {
  kpis: KpiMetric[];
  statistics: StatisticMetric[];
  upcomingEvents: UpcomingEvent[];
  leaderboard: LeaderboardEntry[];
  recentActivity: ActivityItem[];
  calendarEvents: CalendarEvent[];
}
