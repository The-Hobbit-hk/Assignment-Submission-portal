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
    title: "District Team Learning Seminar",
    startDate: "2026-03-21T09:00:00+05:30",
    endDate: "2026-03-22T18:00:00+05:30",
    location: "District 3131",
  },
  {
    key: "pre-pels-sels-2026",
    title: "Pre PELS SELS",
    startDate: "2026-05-03T09:00:00+05:30",
    endDate: "2026-05-03T18:00:00+05:30",
    location: "District 3131",
  },
  {
    key: "star-1-2026",
    title: "STAR 1.0",
    startDate: "2026-06-21T09:00:00+05:30",
    endDate: "2026-06-21T18:00:00+05:30",
    location: "District 3131",
  },
  {
    key: "dist-assembly-2026",
    title: "DRR & Council Installation",
    startDate: "2026-07-04T10:00:00+05:30",
    endDate: "2026-07-04T18:00:00+05:30",
    location: "District 3131",
    registrationOpensAt: "2026-06-01T00:00:00+05:30",
    registrationClosesAt: "2026-07-04T23:59:59+05:30",
    registrationUrl: "https://forms.gle/bgaP8kYZup8V3VmT9",
    maxAttendees: 300,
  },
  {
    key: "dg-installation-2026",
    title: "DG Installation",
    startDate: "2026-07-05T09:00:00+05:30",
    endDate: "2026-07-05T18:00:00+05:30",
    location: "District 3131",
  },
  {
    key: "dinner-drr-jul-2026",
    title: "Dinner with DRR",
    startDate: "2026-07-12T19:00:00+05:30",
    endDate: "2026-07-12T22:00:00+05:30",
    location: "District 3131",
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
    title: "SEARIC Summit – Sri Lanka",
    startDate: "2026-09-11T09:00:00+05:30",
    endDate: "2026-09-13T18:00:00+05:30",
    location: "Sri Lanka",
  },
  {
    key: "samyati-4-2026",
    title: "SAMYATI 4.0 (RIDE)",
    startDate: "2026-09-18T09:00:00+05:30",
    endDate: "2026-09-20T18:00:00+05:30",
    location: "District 3131",
  },
  {
    key: "star-2-2026",
    title: "STAR 2.0",
    startDate: "2026-09-27T09:00:00+05:30",
    endDate: "2026-09-27T18:00:00+05:30",
    location: "District 3131",
  },
  {
    key: "council-meeting-oct-2026",
    title: "Council Meeting",
    startDate: "2026-10-03T09:00:00+05:30",
    endDate: "2026-10-03T18:00:00+05:30",
    location: "District 3131",
  },
  {
    key: "cops-1-2026",
    title: "COPS Meeting – 01",
    startDate: "2026-10-04T09:00:00+05:30",
    endDate: "2026-10-04T18:00:00+05:30",
    location: "District 3131",
  },
  {
    key: "talk-9-2026",
    title: "The Talk 9.0",
    startDate: "2026-10-25T09:00:00+05:30",
    endDate: "2026-10-25T18:00:00+05:30",
    location: "District 3131",
  },
  {
    key: "dfm-youth-fest-2026",
    title: "ROTAFEST – Youth Festival (DFM)",
    startDate: "2026-11-21T09:00:00+05:30",
    endDate: "2026-11-22T18:00:00+05:30",
    location: "District 3131",
  },
  {
    key: "district-culturals-2026",
    title: "District Culturals",
    startDate: "2026-12-12T09:00:00+05:30",
    endDate: "2026-12-13T18:00:00+05:30",
    location: "District 3131",
  },
  {
    key: "council-meeting-dec-2026",
    title: "Council Meeting",
    startDate: "2026-12-27T09:00:00+05:30",
    endDate: "2026-12-27T18:00:00+05:30",
    location: "District 3131",
  },
  {
    key: "dsm-outdoors-2027",
    title: "DSM Outdoors",
    startDate: "2027-01-09T09:00:00+05:30",
    endDate: "2027-01-10T18:00:00+05:30",
    location: "District 3131",
  },
  {
    key: "dinner-drr-jan-2027",
    title: "Dinner with DRR",
    startDate: "2027-01-17T19:00:00+05:30",
    endDate: "2027-01-17T22:00:00+05:30",
    location: "District 3131",
  },
  {
    key: "rotasia-2027",
    title: "Rotasia Indore",
    startDate: "2027-02-04T09:00:00+05:30",
    endDate: "2027-02-07T18:00:00+05:30",
    location: "Indore",
  },
  {
    key: "rotary-district-conference-2027",
    title: "Rotary District Conference",
    startDate: "2027-02-05T09:00:00+05:30",
    endDate: "2027-02-07T18:00:00+05:30",
    location: "District 3131",
  },
  {
    key: "district-conference-2027",
    title: "Rotaract District Conference",
    startDate: "2027-02-13T09:00:00+05:30",
    endDate: "2027-02-14T18:00:00+05:30",
    location: "District 3131",
  },
  {
    key: "cops-2-2027",
    title: "COPS Meeting – 02",
    startDate: "2027-02-28T09:00:00+05:30",
    endDate: "2027-02-28T18:00:00+05:30",
    location: "District 3131",
  },
  {
    key: "world-rotaract-week-2027",
    title: "World Rotaract Week",
    startDate: "2027-03-08T00:00:00+05:30",
    endDate: "2027-03-14T23:59:59+05:30",
    location: "District 3131",
  },
  {
    key: "dsm-indoors-2027",
    title: "DSM Indoors",
    startDate: "2027-03-20T09:00:00+05:30",
    endDate: "2027-03-21T18:00:00+05:30",
    location: "District 3131",
  },
  {
    key: "council-meeting-apr-2027",
    title: "Council Meeting",
    startDate: "2027-04-17T09:00:00+05:30",
    endDate: "2027-04-17T18:00:00+05:30",
    location: "District 3131",
  },
  {
    key: "cops-3-2027",
    title: "COPS Meeting – 03",
    startDate: "2027-04-18T09:00:00+05:30",
    endDate: "2027-04-18T18:00:00+05:30",
    location: "District 3131",
  },
  {
    key: "abhipray-2027",
    title: "Abhipraay",
    startDate: "2027-04-25T09:00:00+05:30",
    endDate: "2027-04-25T18:00:00+05:30",
    location: "District 3131",
  },
  {
    key: "dinner-drr-may-2027",
    title: "Dinner with DRR",
    startDate: "2027-05-09T19:00:00+05:30",
    endDate: "2027-05-09T22:00:00+05:30",
    location: "District 3131",
  },
  {
    key: "rise-awards-2027",
    title: "RISE (RSA Awards) – Bangalore",
    startDate: "2027-05-29T09:00:00+05:30",
    endDate: "2027-05-30T18:00:00+05:30",
    location: "Bangalore",
  },
  {
    key: "council-meeting-jun-2027",
    title: "Council Meeting",
    startDate: "2027-06-05T09:00:00+05:30",
    endDate: "2027-06-05T18:00:00+05:30",
    location: "District 3131",
  },
  {
    key: "rotary-convention-2027",
    title: "Rotary Convention 2027",
    startDate: "2027-06-26T00:00:00+05:30",
    endDate: "2027-06-30T23:59:59+05:30",
    location: "TBA",
  },
  {
    key: "district-awards-2027",
    title: "District Awards",
    startDate: "2027-06-27T09:00:00+05:30",
    endDate: "2027-06-27T18:00:00+05:30",
    location: "District 3131",
  }
];

/** Legacy title used before the official calendar name was adopted. */
export const LEGACY_DISTRICT_ASSEMBLY_TITLE = "District Assembly";
