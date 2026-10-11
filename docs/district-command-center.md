# District Command Center

Read-only page at `/dashboard/command-center`. While this is being tested, only the website admin account (`admin@rotaract3131.org`) can open it. The DRR, district council, and every other login are redirected away.

Figures come from the same club, member, monthly report, citation, and event records as the rest of the portal. Nothing on this page is stored as a separate total.

## What each number means

- **Active clubs** are official district clubs with status ACTIVE. The secondary count is every official club, including inactive ones.
- **Active Rotaractors** are members with status ACTIVE whose club is an official club. Prospective, inactive, and alumni members are excluded. The district council club is not an official club, so council-only roster rows are not added on top of a home club.
- **Reporting completion** uses the existing rule: both the admin report and the events report for the selected month must be SUBMITTED. Drafts and one-sided submissions stay open. Monthly reports have no approved or returned status.
- **Zone completion** is complete active clubs in that zone divided by active official clubs in that zone. A zone with no active clubs shows an em dash instead of 0%.
- **RI dues** have no payment ledger. Amounts stay unavailable. The “100% payment of RI dues” item is a citation, not a dollar balance.
- **District dues** use the admin report fields `districtDuesPaid` and `districtDuesAmount` for the selected month. The amount is what clubs declared when they marked dues paid. It is not an assessed, collected, or outstanding ledger, and it is not converted from any other currency. Partial payments are not recorded.
- **Upcoming events** are the next five district events (`clubId` empty or type DISTRICT) with status UPCOMING or ONGOING and a start time that has not passed. Cancelled events are excluded. Times are shown in Asia/Kolkata.
- **Citation standings** rank active official clubs by approved awarded points for RIY 2026–27. Equal points share a rank. Pending is SUBMITTED. Rejected is REJECTED. Points are not awarded for unapproved work.
- **Alerts** are calculated when the page loads. A reporting alert is overdue after the submission window closes (through 23:59:59.999 IST on the 10th of the following month), due soon within 3 days of that close, and pending while the window is still open. There is no notification inbox.

The reporting period selector defaults to the active report period. Zone links open Club Reports with that month, year, and zone. The district dues link opens District Dues for the same month.
