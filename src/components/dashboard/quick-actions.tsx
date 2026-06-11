import Link from "next/link";
import {
  Building2,
  CalendarPlus,
  FileDown,
  UserPlus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const actions = [
  {
    label: "Add Member",
    href: "/dashboard/members/new",
    icon: UserPlus,
  },
  {
    label: "Add Club",
    href: "/dashboard/clubs/new",
    icon: Building2,
  },
  {
    label: "Create Event",
    href: "/dashboard/events",
    icon: CalendarPlus,
  },
  {
    label: "Export Members",
    href: "/api/members/export",
    icon: FileDown,
    external: true,
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action) => {
            const Icon = action.icon;
            const content = (
              <Button
                variant="glass"
                className="h-auto w-full flex-col gap-2 py-4"
                asChild
              >
                {action.external ? (
                  <a href={action.href} download>
                    <Icon className="h-5 w-5 text-accent" />
                    <span className="text-xs">{action.label}</span>
                  </a>
                ) : (
                  <Link href={action.href}>
                    <Icon className="h-5 w-5 text-accent" />
                    <span className="text-xs">{action.label}</span>
                  </Link>
                )}
              </Button>
            );
            return <div key={action.label}>{content}</div>;
          })}
        </div>
      </CardContent>
    </Card>
  );
}
