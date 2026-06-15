import type { JobPosting, JobPostingStatus, User } from "@/generated/prisma/client";

export type SerializedJobPosting = {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string | null;
  recruiterName: string | null;
  recruiterEmail: string;
  status: JobPostingStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string | null;
    email: string;
  };
};

type JobWithCreator = JobPosting & {
  createdBy: Pick<User, "id" | "name" | "email">;
};

export function serializeJobPosting(job: JobWithCreator): SerializedJobPosting {
  return {
    id: job.id,
    title: job.title,
    company: job.company,
    description: job.description,
    location: job.location,
    recruiterName: job.recruiterName,
    recruiterEmail: job.recruiterEmail,
    status: job.status,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
    createdBy: {
      id: job.createdBy.id,
      name: job.createdBy.name,
      email: job.createdBy.email,
    },
  };
}

function buildJobApplyContent(
  job: Pick<SerializedJobPosting, "title" | "company" | "recruiterName">,
  applicant?: { name?: string | null; email?: string | null }
) {
  const subject = `Application: ${job.title} at ${job.company}`;
  const greeting = job.recruiterName ? `Dear ${job.recruiterName},` : "Dear Hiring Team,";
  const body = [
    greeting,
    "",
    `I am writing to express my interest in the ${job.title} role at ${job.company}.`,
    "",
    "Please find my details below:",
    applicant?.name ? `Name: ${applicant.name}` : null,
    applicant?.email ? `Email: ${applicant.email}` : null,
    "",
    "Thank you for your consideration.",
    applicant?.name ?? "",
  ]
    .filter((line) => line !== null)
    .join("\n");

  return { subject, body };
}

/** Opens Gmail compose in the same browser tab (works for most Rotaractors on web). */
export function buildJobApplyEmailUrl(
  job: Pick<SerializedJobPosting, "title" | "company" | "recruiterEmail" | "recruiterName">,
  applicant?: { name?: string | null; email?: string | null }
) {
  const { subject, body } = buildJobApplyContent(job, applicant);
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: job.recruiterEmail,
    su: subject,
    body,
  });

  return `https://mail.google.com/mail/?${params.toString()}`;
}

/** Desktop mail-app fallback. */
export function buildJobApplyMailto(
  job: Pick<SerializedJobPosting, "title" | "company" | "recruiterEmail" | "recruiterName">,
  applicant?: { name?: string | null; email?: string | null }
) {
  const { subject, body } = buildJobApplyContent(job, applicant);
  const params = new URLSearchParams({ subject, body });
  return `mailto:${job.recruiterEmail}?${params.toString()}`;
}
