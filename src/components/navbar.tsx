import Link from "next/link";
import { createClient } from "../../supabase/server";
import { Button } from "./ui/button";
import { ThemeSwitcher } from "./theme-switcher";
import { Video } from "lucide-react";
import UserProfile from "./user-profile";

export default async function Navbar() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="w-full border-b border-gray-200 bg-white py-3">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" prefetch className="text-xl font-bold flex items-center">
          <Video className="h-6 w-6 text-blue-600 mr-2" />
          <span>VideoMeet</span>
        </Link>
        <div className="hidden md:flex space-x-6">
          <Link href="/#features" className="text-gray-600 hover:text-gray-900">
            Features
          </Link>
          <Link href="/#pricing" className="text-gray-600 hover:text-gray-900">
            Pricing
          </Link>
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
            Meetings
          </Link>
          <Link href="/#" className="text-gray-600 hover:text-gray-900">
            Support
          </Link>
        </div>
        <div className="flex gap-4 items-center">
          <ThemeSwitcher />
          {user ? (
            <>
              <Link href="/dashboard">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Dashboard
                </Button>
              </Link>
              <UserProfile />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Sign In
              </Link>
              <Link href="/sign-up">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
