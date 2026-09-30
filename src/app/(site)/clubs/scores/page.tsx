import { ClubScoresBoard } from "@/components/site/club-scores-board";
import { PageHero } from "@/components/site/page-hero";
import { getPublicClubLeaderboard } from "@/lib/club-live-scores";

export const revalidate = 900;

export const metadata = {
  title: "Club Live Scores",
};

export default async function ClubScoresPage() {
  const board = await getPublicClubLeaderboard();

  return (
    <>
      <PageHero
        title="Club Live Scores"
        subtitle={`All Rotaract clubs ranked by points for RIY ${board.label}. Citation points are included as soon as they are approved.`}
      />
      <section className="py-8 sm:py-10">
        <div className="mx-auto max-w-3xl px-4 lg:px-8">
          <ClubScoresBoard clubs={board.clubs} label={board.label} />
        </div>
      </section>
    </>
  );
}
