-- Ensure EventType enum includes club meeting types used in Events Reporting.
-- Safe to re-run (IF NOT EXISTS).
ALTER TYPE "EventType" ADD VALUE IF NOT EXISTS 'GBM';
ALTER TYPE "EventType" ADD VALUE IF NOT EXISTS 'BOD_MEET';
