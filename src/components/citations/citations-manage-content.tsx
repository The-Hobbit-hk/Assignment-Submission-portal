"use client";

import { useState } from "react";
import { Award, Loader2 } from "lucide-react";
import { PageHeading, SectionLabel } from "@/components/layout/page-heading";
import { CitationAssignDialog } from "@/components/citations/citation-assign-dialog";
import { CitationDefinitionForm } from "@/components/citations/citation-definition-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useCitationDefinitions,
  useUpdateCitationDefinition,
} from "@/hooks/use-citations";
import { formatCitationTitle } from "@/lib/citations-shared";
import { toast } from "@/lib/toast";

export function CitationsManageContent() {
  const { data: definitions, isLoading } = useCitationDefinitions();
  const update = useUpdateCitationDefinition();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <section className="reporting-hero relative overflow-hidden rounded-2xl p-5 sm:p-6">
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent shadow-sm">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
                DRR Citations
              </p>
              <h1 className="font-display text-xl font-bold sm:text-2xl">Manage Citations</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Create citation definitions and assign them to clubs by period.
              </p>
            </div>
          </div>
          <Button onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Hide form" : "New citation"}
          </Button>
        </div>
      </section>

      {showForm && (
        <div className="depth-card rounded-xl p-5">
          <SectionLabel className="mb-4">Create definition</SectionLabel>
          <CitationDefinitionForm onSuccess={() => setShowForm(false)} />
        </div>
      )}

      <div className="space-y-3">
        <PageHeading title="Citation library" subtitle="Active and archived definitions" />

        {isLoading ? (
          <Skeleton className="h-48 rounded-xl" />
        ) : (
          <div className="table-scroll rounded-xl border border-border/40 bg-card/50">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Cadence</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead className="hidden md:table-cell">Assignments</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(definitions ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      No citations yet. Create your first definition above.
                    </TableCell>
                  </TableRow>
                ) : (
                  definitions!.map((def) => (
                    <TableRow key={def.id}>
                      <TableCell>
                        <p className="font-medium">{formatCitationTitle(def.title)}</p>
                        {def.description && (
                          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                            {def.description}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="capitalize">{def.cadence.toLowerCase()}</TableCell>
                      <TableCell>{def.points}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {def.assignmentCount ?? 0}
                      </TableCell>
                      <TableCell>
                        <Badge variant={def.isActive ? "success" : "secondary"}>
                          {def.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {def.isActive && <CitationAssignDialog definition={def} />}
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={update.isPending}
                            onClick={() =>
                              update.mutate(
                                { id: def.id, isActive: !def.isActive },
                                {
                                  onSuccess: () =>
                                    toast.success(
                                      def.isActive ? "Citation deactivated" : "Citation activated"
                                    ),
                                }
                              )
                            }
                          >
                            {update.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : def.isActive ? (
                              "Deactivate"
                            ) : (
                              "Activate"
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
