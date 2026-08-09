import { istWallTime } from "@/lib/timezone";

export type DrrCitationTier = "Essential" | "Active" | "Vibrant" | "Outstanding";

export type DrrCitationSeed = {
  srNo: number;
  title: string;
  /** Extra detail shown under the title */
  description: string;
  tier: DrrCitationTier;
  points: number;
  /** Deadline as Asia/Kolkata end-of-day */
  dueDate: Date;
};

export const DRR_CITATIONS_RIY_2026_27_LABEL = "2026-27";

/** Official DRR Citation criteria — RIY 2026-27 (total 200 pts). */
export const DRR_CITATIONS_RIY_2026_27: DrrCitationSeed[] = [
  {
    srNo: 1,
    title: "District Dues paid before official deadlines",
    description:
      "Essential · District Dues of all members to be paid before the official deadlines (new appointed member within 60 days of induction).",
    tier: "Essential",
    points: 10,
    dueDate: istWallTime(2026, 8, 31, 23, 59, 59, 999),
  },
  {
    srNo: 2,
    title: "Conduct your Club Assembly",
    description: "Essential · Conduct your Club Assembly.",
    tier: "Essential",
    points: 10,
    dueDate: istWallTime(2026, 8, 31, 23, 59, 59, 999),
  },
  {
    srNo: 3,
    title: "Conduct your Club Installation",
    description: "Essential · Conduct your Club Installation as per the District Guidelines.",
    tier: "Essential",
    points: 10,
    dueDate: istWallTime(2026, 10, 31, 23, 59, 59, 999),
  },
  {
    srNo: 4,
    title: "Conduct your Club Orientation",
    description: "Essential · Conduct your Club Orientation as per the District Guidelines.",
    tier: "Essential",
    points: 10,
    dueDate: istWallTime(2026, 11, 30, 23, 59, 59, 999),
  },
  {
    srNo: 5,
    title: "Conduct your DZR Visit",
    description: "Essential · Conduct your DZR Visit.",
    tier: "Essential",
    points: 10,
    dueDate: istWallTime(2026, 11, 30, 23, 59, 59, 999),
  },
  {
    srNo: 6,
    title: "100% payment of RI dues",
    description: "Essential · 100% payment of RI dues.",
    tier: "Essential",
    points: 10,
    dueDate: istWallTime(2027, 3, 31, 23, 59, 59, 999),
  },
  {
    srNo: 7,
    title: "Printed Minutes, Attendance & Assets books",
    description: "Essential · Printed Minutes book, Attendance Register and Assets Book.",
    tier: "Essential",
    points: 10,
    dueDate: istWallTime(2026, 8, 31, 23, 59, 59, 999),
  },
  {
    srNo: 8,
    title: "Conduct your DRR Visit",
    description: "Essential · Conduct your DRR Visit.",
    tier: "Essential",
    points: 10,
    dueDate: istWallTime(2027, 4, 15, 23, 59, 59, 999),
  },
  {
    srNo: 9,
    title: "Minimum 15 membership strength every month",
    description:
      "Active · Minimum of 15 membership strength of the Club - every month (excluding prospectives).",
    tier: "Active",
    points: 7,
    dueDate: istWallTime(2027, 6, 10, 23, 59, 59, 999),
  },
  {
    srNo: 10,
    title: "Club Bank Account with PAN",
    description: "Active · Clubs own Bank Account with PAN Card Number.",
    tier: "Active",
    points: 7,
    dueDate: istWallTime(2027, 6, 10, 23, 59, 59, 999),
  },
  {
    srNo: 11,
    title: "Complete monthly Secretarial Reporting",
    description: "Active · Complete Secretarial Reporting of every month.",
    tier: "Active",
    points: 7,
    dueDate: istWallTime(2027, 6, 10, 23, 59, 59, 999),
  },
  {
    srNo: 12,
    title: "100% attendance in STAR",
    description: "Active · 100% attendance in STAR.",
    tier: "Active",
    points: 7,
    dueDate: istWallTime(2027, 6, 10, 23, 59, 59, 999),
  },
  {
    srNo: 13,
    title: "Membership growth by 20 (5 per quarter)",
    description: "Active · Growth in membership by 20 (5 per quarter).",
    tier: "Active",
    points: 7,
    dueDate: istWallTime(2027, 6, 10, 23, 59, 59, 999),
  },
  {
    srNo: 14,
    title: "Follow District Guided Rotaract Branding",
    description: "Active · Follow the District Guided Rotaract Branding.",
    tier: "Active",
    points: 7,
    dueDate: istWallTime(2027, 6, 10, 23, 59, 59, 999),
  },
  {
    srNo: 15,
    title: "Min. 5 members at all District Events",
    description: "Active · Minimum 5 members attending in all District Events.",
    tier: "Active",
    points: 7,
    dueDate: istWallTime(2027, 6, 10, 23, 59, 59, 999),
  },
  {
    srNo: 16,
    title: "Newsletter/Bulletins once in 3 months",
    description: "Active · Publish Newsletter/Bulletins at least once in 3 months.",
    tier: "Active",
    points: 7,
    dueDate: istWallTime(2027, 6, 10, 23, 59, 59, 999),
  },
  {
    srNo: 17,
    title: "8+ Community Service activities",
    description: "Vibrant · Complete 8+ activities in Community Service.",
    tier: "Vibrant",
    points: 5,
    dueDate: istWallTime(2027, 6, 10, 23, 59, 59, 999),
  },
  {
    srNo: 18,
    title: "12+ Professional Development activities",
    description: "Vibrant · Complete 12+ activities in Professional Development.",
    tier: "Vibrant",
    points: 5,
    dueDate: istWallTime(2027, 6, 10, 23, 59, 59, 999),
  },
  {
    srNo: 19,
    title: "12+ Club Service activities",
    description: "Vibrant · Complete 12+ activities in Club Service.",
    tier: "Vibrant",
    points: 5,
    dueDate: istWallTime(2027, 6, 10, 23, 59, 59, 999),
  },
  {
    srNo: 20,
    title: "8+ International Service activities",
    description: "Vibrant · Complete 8+ activities in International Service.",
    tier: "Vibrant",
    points: 5,
    dueDate: istWallTime(2027, 6, 10, 23, 59, 59, 999),
  },
  {
    srNo: 21,
    title: "Successfully host a District Event",
    description: "Vibrant · Successfully host a District Event.",
    tier: "Vibrant",
    points: 5,
    dueDate: istWallTime(2027, 6, 10, 23, 59, 59, 999),
  },
  {
    srNo: 22,
    title: "2+ joint projects with Rotary",
    description: "Vibrant · Conduct at least 2 projects jointly with Rotary.",
    tier: "Vibrant",
    points: 5,
    dueDate: istWallTime(2027, 6, 10, 23, 59, 59, 999),
  },
  {
    srNo: 23,
    title: "Successfully participate in Samyati 4.0",
    description: "Vibrant · Successfully participate in Samyati 4.0.",
    tier: "Vibrant",
    points: 5,
    dueDate: istWallTime(2027, 6, 10, 23, 59, 59, 999),
  },
  {
    srNo: 24,
    title: "Participate in any 3 District Initiatives",
    description: "Vibrant · Participate In any 3 District Initiatives (PD, CM, DEI, Grants).",
    tier: "Vibrant",
    points: 5,
    dueDate: istWallTime(2027, 6, 10, 23, 59, 59, 999),
  },
  {
    srNo: 25,
    title: "Offline Public Image event/initiative",
    description: "Outstanding · Complete a Offline Public Image event/initiative.",
    tier: "Outstanding",
    points: 3,
    dueDate: istWallTime(2027, 6, 10, 23, 59, 59, 999),
  },
  {
    srNo: 26,
    title: "Min. 5 members at SEARIC or Rotasia",
    description: "Outstanding · Minimum 5 members attending SEARIC or Rotasia.",
    tier: "Outstanding",
    points: 3,
    dueDate: istWallTime(2027, 2, 10, 23, 59, 59, 999),
  },
  {
    srNo: 27,
    title: "Update goals & officers on RI website",
    description: "Outstanding · Update goals, incoming officers and members on RI website.",
    tier: "Outstanding",
    points: 3,
    dueDate: istWallTime(2026, 12, 31, 23, 59, 59, 999),
  },
  {
    srNo: 28,
    title: "Submit Outstanding Project form to RI",
    description: "Outstanding · Submit Outstanding Project recognition form to RI.",
    tier: "Outstanding",
    points: 3,
    dueDate: istWallTime(2027, 2, 1, 23, 59, 59, 999),
  },
  {
    srNo: 29,
    title: "Submit World Rotaract Week form to RI",
    description: "Outstanding · Submit World Rotaract Week recognition form to RI.",
    tier: "Outstanding",
    points: 3,
    dueDate: istWallTime(2027, 4, 15, 23, 59, 59, 999),
  },
  {
    srNo: 30,
    title: "Submit Club Excellence Award to RI",
    description: "Outstanding · Submit Club Excellence Award to RI.",
    tier: "Outstanding",
    points: 3,
    dueDate: istWallTime(2027, 4, 15, 23, 59, 59, 999),
  },
  {
    srNo: 31,
    title: "Contribute to Rotaract Giving Certificate",
    description: "Outstanding · Contribute to Rotaract Giving Certificate.",
    tier: "Outstanding",
    points: 3,
    dueDate: istWallTime(2027, 6, 10, 23, 59, 59, 999),
  },
  {
    srNo: 32,
    title: "Participate in or conduct a RYLA",
    description: "Outstanding · Participate in RYLA or conduct a RYLA.",
    tier: "Outstanding",
    points: 3,
    dueDate: istWallTime(2027, 6, 10, 23, 59, 59, 999),
  },
];

export function drrCitationDefinitionTitle(seed: DrrCitationSeed) {
  return `${String(seed.srNo).padStart(2, "0")}. ${seed.title}`;
}
