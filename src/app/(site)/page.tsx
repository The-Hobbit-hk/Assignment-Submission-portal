import { HomePage } from "@/components/site/home-page";
import { getPublicClubLeaderboard } from "@/lib/club-live-scores";

export const revalidate = 900;

export default async function Home() {
  const board = await getPublicClubLeaderboard().catch(() => ({
    label: "",
    clubs: [],
  }));
  return <HomePage clubScores={board.clubs} scoreLabel={board.label} />;
}
