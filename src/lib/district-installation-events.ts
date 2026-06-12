/** Official RIY 2026-27 club installations for the public district calendar. */
export type DistrictInstallationSeed = {
  /** Official club charter number from district-clubs-data */
  clubCharterId: string;
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  meetUrl: string;
};

export const DISTRICT_INSTALLATION_EVENTS: DistrictInstallationSeed[] = [
  {
    clubCharterId: "8825815",
    title: "Club Installation — Rotaract Club of Nigdi Pune",
    startDate: "2026-07-11T20:00:00+05:30",
    endDate: "2026-07-11T22:00:00+05:30",
    location:
      "Rotary Club of Pimpri, Pune — MQ5W+WHW, Sambhajinagar, Chinchwad, Pimpri-Chinchwad, Pune",
    meetUrl: "https://meet.google.com/sne-fqjz-qok",
  },
  {
    clubCharterId: "8823957",
    title: "Club Installation — Rotaract Club of Pune City Fortune",
    startDate: "2026-07-19T16:00:00+05:30",
    endDate: "2026-07-19T18:00:00+05:30",
    location:
      "Veer Baji Pasalkar Statue — 203, Narveer Tanaji Malusare Rd, Jaydeo Nagar, Dattawadi, Pune",
    meetUrl: "https://meet.google.com/scc-aeph-udk",
  },
  {
    clubCharterId: "215158",
    title: "Club Installation — Rotaract Club of Daund College",
    startDate: "2026-07-26T16:00:00+05:30",
    endDate: "2026-07-26T18:00:00+05:30",
    location: "CREATIVE COMPUTER — Daund, Maharashtra 413801, India",
    meetUrl: "https://meet.google.com/epr-uxdu-tqv",
  },
];
