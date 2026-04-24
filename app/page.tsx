import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LandingPageClient from "@/components/LandingPageClient";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  return (
    <LandingPageClient
      isLoggedIn={!!session}
      userName={session?.user?.name ?? null}
      userRole={session?.user?.role ?? null}
    />
  );
}
