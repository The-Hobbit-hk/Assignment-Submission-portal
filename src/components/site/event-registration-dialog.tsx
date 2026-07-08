"use client";

import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DISTRICT_CLUBS } from "@/lib/district-clubs-data";
import { toast } from "@/lib/toast";

const CLUB_NAMES = [...DISTRICT_CLUBS]
  .map((c) => c.name)
  .sort((a, b) => a.localeCompare(b));

const ACKNOWLEDGEMENT_TEXT =
  "I confirm that the information provided is accurate. I agree to follow district event guidelines and understand that false submissions may lead to cancellation of my registration.";

export function EventRegistrationDialog({
  eventId,
  eventTitle,
  open,
  onOpenChange,
}: {
  eventId: string;
  eventTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [clubName, setClubName] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const paymentRef = useRef<HTMLInputElement>(null);
  const govtIdRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const paymentFile = paymentRef.current?.files?.[0];
    const govtIdFile = govtIdRef.current?.files?.[0];

    if (!paymentFile) {
      toast.error("Please upload your payment screenshot.");
      return;
    }
    if (!govtIdFile) {
      toast.error("Please upload your government ID.");
      return;
    }
    if (!acknowledged) {
      toast.error("Please acknowledge the terms to continue.");
      return;
    }

    data.set("clubName", clubName);
    data.set("acknowledged", "true");
    data.set("paymentProof", paymentFile);
    data.set("governmentId", govtIdFile);

    setSubmitting(true);
    try {
      const res = await fetch(`/api/events/${eventId}/public-register`, {
        method: "POST",
        body: data,
      });
      const body = (await res.json().catch(() => null)) as {
        error?: string;
        message?: string;
      } | null;
      if (!res.ok) {
        throw new Error(
          body?.error ??
            body?.message ??
            (res.status === 429
              ? "Too many registration attempts. Please try again later."
              : "Registration failed. Please try again.")
        );
      }
      setSubmitted(true);
      toast.success("Registration submitted successfully.");
      form.reset();
      setClubName("");
      setAcknowledged(false);
      if (paymentRef.current) paymentRef.current.value = "";
      if (govtIdRef.current) govtIdRef.current.value = "";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!submitting) {
          onOpenChange(next);
          if (!next) setSubmitted(false);
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Register for {eventTitle}</DialogTitle>
          <DialogDescription>
            Fill in your details and upload payment proof and government ID. Fields marked * are
            required.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="space-y-4 py-4 text-center">
            <p className="text-sm font-medium text-emerald-700">
              Thank you! Your registration has been submitted. The district team will review your
              payment and confirm your spot.
            </p>
            <Button type="button" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div
              className="absolute left-[-9999px] h-0 w-0 overflow-hidden"
              aria-hidden="true"
            >
              <label htmlFor="reg-website">Website</label>
              <input
                id="reg-website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-name">Full name *</Label>
              <Input id="reg-name" name="name" required maxLength={120} autoComplete="name" />
            </div>

            <div className="space-y-2">
              <Label>Club name *</Label>
              <Select value={clubName} onValueChange={setClubName} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select your Rotaract club" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {CLUB_NAMES.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-riid">RI ID *</Label>
              <Input
                id="reg-riid"
                name="riId"
                required
                maxLength={40}
                placeholder="Your Rotary International member ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-payment">Payment screenshot *</Label>
              <Input
                id="reg-payment"
                ref={paymentRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                required
              />
              <p className="text-xs text-zinc-500">JPG, PNG, WebP, or PDF — max 5 MB</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-govtid">Government ID *</Label>
              <Input
                id="reg-govtid"
                ref={govtIdRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                required
              />
              <p className="text-xs text-zinc-500">
                Aadhaar, PAN, college ID, or other valid government-issued ID
              </p>
            </div>

            <label className="flex gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm leading-relaxed text-zinc-700">
              <input
                type="checkbox"
                className="mt-1"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
              />
              <span>{ACKNOWLEDGEMENT_TEXT}</span>
            </label>

            <Button type="submit" className="w-full" disabled={submitting || !clubName}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit registration"
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
