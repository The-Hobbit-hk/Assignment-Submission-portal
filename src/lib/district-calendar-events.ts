/** Official Rotaract District 3131 events calendar (RIY 2026-27). */
export type DistrictCalendarEventSeed = {
  /** Stable key for upsert matching */
  key: string;
  title: string;
  startDate: string;
  endDate?: string;
  location?: string;
  registrationUrl?: string;
  registrationOpensAt?: string;
  registrationClosesAt?: string;
  onSiteRegistration?: boolean;
  maxAttendees?: number;
};

export const DISTRICT_CALENDAR_EVENTS: DistrictCalendarEventSeed[] = [
  {
    key: "dtls-2026",
    title: "DTLS",
    startDate: "2026-03-21T09:00:00+05:30",
    endDate: "2026-03-22T18:00:00+05:30",
    location: "District 3131",
  },
  {
    key: "pre-pels-sels-2026",
    title: "Pre PELS- SELS",
    startDate: "2026-05-03T09:00:00+05:30",
    endDate: "2026-05-03T18:00:00+05:30",
    location: "District 3131",
  },
  {
    key: "star-2026",
    title: "STAR",
    startDate: "2026-06-21T09:00:00+05:30",
    endDate: "2026-06-21T18:00:00+05:30",
    location: "District 3131",
  },
  {
    key: "dist-assembly-2026",
    title: "Dist Assembly; DRR & Council Installation",
    startDate: "2026-07-04T10:00:00+05:30",
    endDate: "2026-07-04T18:00:00+05:30",
    location: "District 3131",
    registrationOpensAt: "2026-06-01T00:00:00+05:30",
    registrationClosesAt: "2026-07-04T23:59:59+05:30",
    registrationUrl: "https://forms.gle/bgaP8kYZup8V3VmT9",
    maxAttendees: 300,
  },
  {
    key: "district-trek-2026",
    title: "District Trek",
    startDate: "2026-08-16T06:00:00+05:30",
    endDate: "2026-08-16T18:00:00+05:30",
    location: "District 3131",
  },
  {
    key: "searic-summit-2026",
    title: "SEARIC SUMMIT",
    startDate: "2026-09-11T09:00:00+05:30",
    endDate: "2026-09-13T18:00:00+05:30",
    location: "District 3131",
  },
  {
    key: "samyati-4-2026",
    title: "Samyati 4.0 (RIDE)",
    startDate: "2026-09-18T09:00:00+05:30",
    endDate: "2026-09-20T18:00:00+05:30",
    location: "District 3131",
  },
  {
    key: "star-2-2026",
    title: "STAR 2",
    startDate: "2026-10-04T09:00:00+05:30",
    endDate: "2026-10-04T18:00:00+05:30",
    location: "District 3131",
  },
  {
    key: "dfm-youth-fest-2026",
    title: "DFM- Youth Fest",
    startDate: "2026-10-23T09:00:00+05:30",
    endDate: "2026-10-25T18:00:00+05:30",
    location: "District 3131",
  },
  {
    key: "dsm-outdoors-2026",
    title: "DSM - Outdoors",
    startDate: "2026-11-21T09:00:00+05:30",
    endDate: "2026-11-22T18:00:00+05:30",
    location: "District 3131",
  },
  {
    key: "district-culturals-2026",
    title: "District Culturals",
    startDate: "2026-12-19T09:00:00+05:30",
    endDate: "2026-12-20T18:00:00+05:30",
    location: "District 3131",
  },
  {
    key: "district-conference-2027",
    title: "District Conference",
    startDate: "2027-01-30T09:00:00+05:30",
    endDate: "2027-01-31T18:00:00+05:30",
    location: "District 3131",
  },
  {
    key: "talk-9-2027",
    title: "Talk 9.0",
    startDate: "2027-02-21T09:00:00+05:30",
    endDate: "2027-02-21T18:00:00+05:30",
    location: "District 3131",
  },
  {
    key: "rotasia-2027",
    title: "Rotasia",
    startDate: "2027-02-04T09:00:00+05:30",
    endDate: "2027-02-07T18:00:00+05:30",
    location: "District 3131",
  },
  {
    key: "world-rotaract-week-2027",
    title: "World Rotaract Week",
    startDate: "2027-03-06T00:00:00+05:30",
    endDate: "2027-03-13T23:59:59+05:30",
    location: "District 3131",
  },
  {
    key: "dsm-indoors-2027",
    title: "DSM - Indoors",
    startDate: "2027-03-20T09:00:00+05:30",
    endDate: "2027-03-21T18:00:00+05:30",
    location: "District 3131",
  },
  {
    key: "abhipray-2027",
    title: "Abhipray",
    startDate: "2027-05-30T09:00:00+05:30",
    endDate: "2027-05-30T18:00:00+05:30",
    location: "District 3131",
  },
  {
    key: "rotary-convention-2027",
    title: "Rotary Convention",
    startDate: "2027-06-01T00:00:00+05:30",
    endDate: "2027-06-30T23:59:59+05:30",
    location: "TBA",
  },
  {
    key: "district-awards-2027",
    title: "District Awards",
    startDate: "2027-06-27T09:00:00+05:30",
    endDate: "2027-06-27T18:00:00+05:30",
    location: "District 3131",
  },
];

/** Legacy title used before the official calendar name was adopted. */
export const LEGACY_DISTRICT_ASSEMBLY_TITLE = "District Assembly";
