import { SignIn } from "@clerk/nextjs";
import { AuthCloseButton } from "@/components/auth-close-button";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function SignInPage() {
  return (
    <main className="min-h-[100dvh] flex items-center justify-center bg-black px-4">
      <AuthCloseButton />
      <div className="flex w-full justify-center">
        <SignIn routing="path" path="/sign-in" appearance={clerkAppearance} />
      </div>
    </main>
  );
}
