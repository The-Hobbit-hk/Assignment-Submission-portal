import path from "path";
import fs from "fs";
import PptxGenJS from "pptxgenjs";
import type { MonthlyReportingOverview } from "@/lib/monthly-reporting-overview";

type TableCell = PptxGenJS.TableCell;
type TableRow = PptxGenJS.TableRow;

const PURPLE = "5B2C8A";
const PURPLE_DK = "3D1A63";
const BLUE_LT = "7EB6E8";
const INK = "1F2937";
const MUTED = "6B7280";
const WHITE = "FFFFFF";
const CREAM = "F8F5FC";
const GREEN = "059669";
const AMBER = "D97706";

const AVENUE_COLORS = [
  "5B2C8A",
  "4A90D9",
  "7C3AED",
  "06B6D4",
  "EC4899",
  "F59E0B",
  "10B981",
  "6366F1",
  "F97316",
  "8B5CF6",
];

function logoPath(name: string) {
  const full = path.join(process.cwd(), "public", name);
  return fs.existsSync(full) ? full : null;
}

function addHeader(pptx: PptxGenJS, slide: PptxGenJS.Slide, title: string) {
  const rotaract = logoPath("logo-rotaract-mark.png") ?? logoPath("logo-rotaract-3131.png");
  const reign = logoPath("reign-icon.png");

  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: "100%",
    h: 0.08,
    fill: { color: PURPLE },
    line: { color: PURPLE },
  });

  if (rotaract) {
    slide.addImage({ path: rotaract, x: 0.35, y: 0.22, w: 0.55, h: 0.55 });
  }
  if (reign) {
    slide.addImage({ path: reign, x: 12.4, y: 0.18, w: 0.6, h: 0.6 });
  }

  slide.addText(title, {
    x: 1.1,
    y: 0.28,
    w: 10.8,
    h: 0.45,
    fontSize: 22,
    fontFace: "Calibri",
    bold: true,
    color: PURPLE_DK,
  });
}

function splitClubs(names: string[]): [string[], string[]] {
  const mid = Math.ceil(names.length / 2);
  return [names.slice(0, mid), names.slice(mid)];
}

function headerCell(text: string): TableCell {
  return {
    text,
    options: { bold: true, color: WHITE, fill: { color: PURPLE } },
  };
}

function cell(text: string): TableCell {
  return { text };
}

function row(...texts: string[]): TableRow {
  return texts.map(cell);
}

export async function buildMonthlyReportingPptx(
  data: MonthlyReportingOverview
): Promise<Buffer> {
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "WIDE", width: 13.333, height: 7.5 });
  pptx.layout = "WIDE";
  pptx.author = "Rotaract District 3131";
  pptx.title = `Monthly Reporting — ${data.periodLabel}`;

  // 1. Cover
  {
    const slide = pptx.addSlide();
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: "100%",
      h: "100%",
      fill: { color: PURPLE_DK },
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 5.9,
      w: "100%",
      h: 1.6,
      fill: { color: PURPLE },
    });

    const rotaract = logoPath("logo-rotaract-3131.png");
    const reign = logoPath("reign-theme-riy-2026-27.png") ?? logoPath("reign-icon.png");
    if (rotaract) slide.addImage({ path: rotaract, x: 0.6, y: 0.5, w: 1.4, h: 1.4 });
    if (reign) slide.addImage({ path: reign, x: 11.2, y: 0.45, w: 1.5, h: 1.5 });

    slide.addText("MONTHLY REPORTING", {
      x: 0.8,
      y: 2.6,
      w: 11.7,
      h: 0.7,
      fontSize: 40,
      fontFace: "Calibri",
      bold: true,
      color: WHITE,
      align: "center",
    });
    slide.addText(data.periodLabel, {
      x: 0.8,
      y: 3.35,
      w: 11.7,
      h: 0.55,
      fontSize: 28,
      fontFace: "Calibri",
      color: BLUE_LT,
      align: "center",
    });
    slide.addText("Rotaract District 3131  ·  REIGN RIY 2026–27", {
      x: 0.8,
      y: 6.35,
      w: 11.7,
      h: 0.4,
      fontSize: 16,
      fontFace: "Calibri",
      color: WHITE,
      align: "center",
    });
  }

  // 2. Overview + zone chart
  {
    const slide = pptx.addSlide();
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: "100%",
      h: "100%",
      fill: { color: CREAM },
    });
    addHeader(pptx, slide, "MONTHLY REPORTING OVERVIEW");

    const bullets = [
      `${data.summary.completedClubs} of ${data.summary.totalClubs} clubs completed reporting`,
      `${data.summary.totalEvents} club events reported in the period`,
      `${data.summary.newMembers} new members reported`,
      `${data.summary.duesPaidClubs} clubs paid district dues covering ${data.summary.duesMembers} members`,
    ];

    slide.addText(
      bullets.map((t) => ({ text: t, options: { bullet: true, breakLine: true } })),
      {
        x: 0.5,
        y: 1.1,
        w: 5.8,
        h: 2.2,
        fontSize: 15,
        fontFace: "Calibri",
        color: INK,
      }
    );

    slide.addChart(
      pptx.ChartType.bar,
      [
        {
          name: "Completion %",
          labels: data.zones.map((z) => z.zone.replace("Zone ", "Z")),
          values: data.zones.map((z) => z.pct),
        },
      ],
      {
        x: 6.4,
        y: 1.0,
        w: 6.4,
        h: 3.6,
        barGrouping: "clustered",
        showTitle: true,
        title: "Zone-wise Reporting %",
        titleFontSize: 14,
        titleColor: PURPLE_DK,
        showValue: true,
        showLegend: false,
        chartColors: [PURPLE],
        catAxisLabelColor: INK,
        valAxisMaxVal: 100,
      }
    );

    const overviewTable: TableRow[] = [
      [headerCell("Zone"), headerCell("Done"), headerCell("Total"), headerCell("%")],
      ...data.zones.map((z) =>
        row(z.zone, String(z.completed), String(z.total), `${z.pct}%`)
      ),
    ];

    slide.addTable(overviewTable, {
      x: 0.5,
      y: 3.5,
      w: 5.6,
      fontFace: "Calibri",
      fontSize: 11,
      color: INK,
      border: { pt: 0.5, color: "E5E7EB" },
      align: "center",
      colW: [1.8, 1.2, 1.2, 1.4],
    });
  }

  // 3. Avenue-wise
  {
    const slide = pptx.addSlide();
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: "100%",
      h: "100%",
      fill: { color: CREAM },
    });
    addHeader(pptx, slide, "AVENUE-WISE REPORTING");

    if (data.avenues.length > 0) {
      slide.addChart(
        pptx.ChartType.doughnut,
        [
          {
            name: "Events",
            labels: data.avenues.map((a) => a.label),
            values: data.avenues.map((a) => a.count),
          },
        ],
        {
          x: 0.4,
          y: 1.1,
          w: 6.2,
          h: 5.2,
          showTitle: true,
          title: `Total events: ${data.summary.totalEvents}`,
          titleFontSize: 14,
          titleColor: PURPLE_DK,
          showPercent: true,
          showLegend: true,
          legendPos: "b",
          chartColors: AVENUE_COLORS,
          holeSize: 50,
        }
      );

      const avenueTable: TableRow[] = [
        [headerCell("Avenue"), headerCell("Events")],
        ...data.avenues.map((a) => row(a.label, String(a.count))),
      ];

      slide.addTable(avenueTable, {
        x: 7.0,
        y: 1.3,
        w: 5.7,
        fontFace: "Calibri",
        fontSize: 12,
        color: INK,
        border: { pt: 0.5, color: "E5E7EB" },
        colW: [4.2, 1.5],
        align: "left",
      });
    } else {
      slide.addText("No club events recorded for this period.", {
        x: 1,
        y: 3,
        w: 11,
        h: 0.5,
        fontSize: 18,
        color: MUTED,
        align: "center",
      });
    }
  }

  // 4. Dues & membership
  {
    const slide = pptx.addSlide();
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: "100%",
      h: "100%",
      fill: { color: CREAM },
    });
    addHeader(pptx, slide, "DUES & MEMBERSHIP");

    const zonesWithMembers = data.zones.filter((z) => z.newMembers > 0);
    if (zonesWithMembers.length > 0) {
      slide.addChart(
        pptx.ChartType.doughnut,
        [
          {
            name: "New members",
            labels: zonesWithMembers.map((z) => z.zone),
            values: zonesWithMembers.map((z) => z.newMembers),
          },
        ],
        {
          x: 0.3,
          y: 1.1,
          w: 5.5,
          h: 4.8,
          showTitle: true,
          title: `New members: ${data.summary.newMembers}`,
          titleFontSize: 14,
          titleColor: PURPLE_DK,
          showPercent: true,
          showLegend: true,
          legendPos: "b",
          chartColors: AVENUE_COLORS,
          holeSize: 50,
        }
      );
    } else {
      slide.addText("No new members reported this month.", {
        x: 0.5,
        y: 3,
        w: 5,
        h: 0.4,
        fontSize: 14,
        color: MUTED,
        align: "center",
      });
    }

    slide.addText("Members & dues by zone", {
      x: 6.2,
      y: 1.1,
      w: 6.5,
      h: 0.35,
      fontSize: 14,
      bold: true,
      color: PURPLE_DK,
      fontFace: "Calibri",
    });

    const duesTable: TableRow[] = [
      [
        headerCell("Zone"),
        headerCell("New members"),
        headerCell("Dues clubs"),
        headerCell("Dues members"),
      ],
      ...data.zones.map((z) =>
        row(z.zone, String(z.newMembers), String(z.duesPaidClubs), String(z.duesMembers))
      ),
    ];

    slide.addTable(duesTable, {
      x: 6.2,
      y: 1.5,
      w: 6.6,
      fontFace: "Calibri",
      fontSize: 11,
      color: INK,
      border: { pt: 0.5, color: "E5E7EB" },
      colW: [1.6, 1.6, 1.6, 1.8],
      align: "center",
    });
  }

  // 5. Zone-wise section divider
  {
    const slide = pptx.addSlide();
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: "100%",
      h: "100%",
      fill: { color: PURPLE },
    });
    slide.addText("ZONE-WISE CLUB NAMES", {
      x: 0.8,
      y: 2.8,
      w: 11.7,
      h: 0.7,
      fontSize: 36,
      bold: true,
      color: WHITE,
      align: "center",
      fontFace: "Calibri",
    });
    slide.addText("Clubs that completed monthly reporting", {
      x: 0.8,
      y: 3.6,
      w: 11.7,
      h: 0.45,
      fontSize: 18,
      color: BLUE_LT,
      align: "center",
      fontFace: "Calibri",
    });
  }

  // 6–12. Per-zone club lists
  for (const zone of data.zones) {
    const slide = pptx.addSlide();
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: "100%",
      h: "100%",
      fill: { color: CREAM },
    });
    addHeader(
      pptx,
      slide,
      `${zone.zone.toUpperCase()}  ·  ${zone.completed}/${zone.total} clubs reported`
    );

    const names = zone.completedClubs.map((c) => c.name);
    if (names.length === 0) {
      slide.addText("No clubs completed reporting in this zone yet.", {
        x: 1,
        y: 3.2,
        w: 11,
        h: 0.5,
        fontSize: 16,
        color: MUTED,
        align: "center",
      });
      continue;
    }

    const [left, right] = splitClubs(names);
    const makeRows = (list: string[], start: number): TableRow[] => [
      [headerCell("Sr."), headerCell("Club Name")],
      ...list.map((name, i) => row(String(start + i), name)),
    ];

    slide.addTable(makeRows(left, 1), {
      x: 0.4,
      y: 1.15,
      w: 6.1,
      fontFace: "Calibri",
      fontSize: 11,
      color: INK,
      border: { pt: 0.5, color: "E5E7EB" },
      colW: [0.7, 5.4],
      align: "left",
      valign: "middle",
    });

    if (right.length > 0) {
      slide.addTable(makeRows(right, left.length + 1), {
        x: 6.8,
        y: 1.15,
        w: 6.1,
        fontFace: "Calibri",
        fontSize: 11,
        color: INK,
        border: { pt: 0.5, color: "E5E7EB" },
        colW: [0.7, 5.4],
        align: "left",
        valign: "middle",
      });
    }
  }

  // Appreciation board
  {
    const slide = pptx.addSlide();
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: "100%",
      h: "100%",
      fill: { color: CREAM },
    });
    addHeader(pptx, slide, "APPRECIATION BOARD");

    slide.addText("100% REPORTING", {
      x: 0.8,
      y: 1.2,
      w: 11.7,
      h: 0.5,
      fontSize: 20,
      bold: true,
      color: GREEN,
      align: "center",
      fontFace: "Calibri",
    });

    if (data.perfectZones.length === 0) {
      slide.addText("No zone reached 100% completion this month — keep pushing!", {
        x: 1,
        y: 3.2,
        w: 11,
        h: 0.5,
        fontSize: 16,
        color: AMBER,
        align: "center",
      });
    } else {
      const cardW = 2.6;
      const gap = 0.35;
      const totalW =
        data.perfectZones.length * cardW + (data.perfectZones.length - 1) * gap;
      let x = Math.max(0.5, (13.333 - totalW) / 2);
      const y = 2.4;

      for (const zone of data.perfectZones) {
        slide.addShape(pptx.ShapeType.roundRect, {
          x,
          y,
          w: cardW,
          h: 2.2,
          fill: { color: PURPLE_DK },
          shadow: {
            type: "outer",
            color: "000000",
            blur: 8,
            offset: 3,
            opacity: 0.2,
          },
        });
        slide.addText(zone.toUpperCase(), {
          x,
          y: y + 0.55,
          w: cardW,
          h: 0.5,
          fontSize: 18,
          bold: true,
          color: WHITE,
          align: "center",
          fontFace: "Calibri",
        });
        slide.addText("100% REPORTING", {
          x,
          y: y + 1.15,
          w: cardW,
          h: 0.4,
          fontSize: 12,
          color: BLUE_LT,
          align: "center",
          fontFace: "Calibri",
        });
        x += cardW + gap;
      }
    }
  }

  // Closing
  {
    const slide = pptx.addSlide();
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: "100%",
      h: "100%",
      fill: { color: PURPLE_DK },
    });
    slide.addText("UNTIL NEXT MONTH,", {
      x: 0.8,
      y: 2.5,
      w: 11.7,
      h: 0.55,
      fontSize: 28,
      color: BLUE_LT,
      align: "center",
      fontFace: "Calibri",
    });
    slide.addText("KEEP REPORTING!", {
      x: 0.8,
      y: 3.15,
      w: 11.7,
      h: 0.7,
      fontSize: 36,
      bold: true,
      color: WHITE,
      align: "center",
      fontFace: "Calibri",
    });
    slide.addText("Rotaract District 3131  ·  REIGN", {
      x: 0.8,
      y: 5.8,
      w: 11.7,
      h: 0.4,
      fontSize: 14,
      color: WHITE,
      align: "center",
      fontFace: "Calibri",
    });
  }

  const output = (await pptx.write({ outputType: "nodebuffer" })) as Buffer;
  return Buffer.from(output);
}
