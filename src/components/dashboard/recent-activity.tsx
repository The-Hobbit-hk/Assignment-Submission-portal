import {
  Building2,
  Calendar,
  FileText,
  LogIn,
  UserPlus,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ActivityItem } from "@/types/dashboard";

interface RecentActivityProps {
  activities: ActivityItem[];
}

const typeConfig: Record<
  string,
  { icon: React.ElementType; color: string }
> = {
  MEMBER_JOINED: { icon: UserPlus, color: "text-green-400" },
  MEMBER_UPDATED: { icon: Users, color: "text-blue-400" },
  EVENT_CREATED: { icon: Calendar, color: "text-accent" },
  CLUB_CREATED: { icon: Building2, color: "text-purple-400" },
  DOCUMENT_UPLOADED: { icon: FileText, color: "text-yellow-400" },
  LOGIN: { icon: LogIn, color: "text-muted-foreground" },
};

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No recent activity
          </p>
        ) : (
          activities.map((activity, i) => {
            const config = typeConfig[activity.type] ?? typeConfig.LOGIN;
            const Icon = config.icon;
            return (
              <div key={activity.id} className="flex gap-3">
                <div className="relative flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full bg-muted",
                      config.color
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  {i < activities.length - 1 && (
                    <div className="mt-1 h-full w-px bg-border/60" />
                  )}
                </div>
                <div className="min-w-0 flex-1 pb-4">
                  <p className="text-sm font-medium text-foreground">
                    {activity.title}
                  </p>
                  {activity.description && (
                    <p className="text-xs text-muted-foreground">
                      {activity.description}
                    </p>
                  )}
                  <p className="mt-0.5 text-xs text-muted-foreground/70">
                    {timeAgo(activity.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
