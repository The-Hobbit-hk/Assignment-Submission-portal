-- On-site event registration (run in Supabase SQL Editor if db:push is slow)
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "onSiteRegistration" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS "PublicEventRegistration" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "clubName" TEXT NOT NULL,
  "riId" TEXT NOT NULL,
  "paymentProofPath" TEXT NOT NULL,
  "governmentIdPath" TEXT NOT NULL,
  "acknowledged" BOOLEAN NOT NULL DEFAULT true,
  "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PublicEventRegistration_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PublicEventRegistration_eventId_riId_key"
  ON "PublicEventRegistration"("eventId", "riId");

CREATE INDEX IF NOT EXISTS "PublicEventRegistration_eventId_idx"
  ON "PublicEventRegistration"("eventId");

ALTER TABLE "PublicEventRegistration"
  ADD CONSTRAINT "PublicEventRegistration_eventId_fkey"
  FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
