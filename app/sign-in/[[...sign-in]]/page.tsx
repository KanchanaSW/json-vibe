import { SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function SignInPage() {
  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-center bg-black px-4">
      <p className="mb-6 text-sm text-zinc-400 text-center max-w-sm">
        Continue with Google to use Screenshot → JSON
      </p>
      <SignIn routing="path" path="/sign-in" appearance={clerkAppearance} />
    </main>
  );
}
