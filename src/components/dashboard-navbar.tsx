"use client";

import Link from "next/link";
import { createClient } from "../../supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import {
  UserCircle,
  Home,
  Video,
  Calendar,
  Settings,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ThemeSwitcher } from "./theme-switcher";

export default function DashboardNavbar() {
  const supabase = createClient();
  const router = useRouter();

  return (
    <nav className="w-full border-b border-gray-200 bg-white py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            prefetch
            className="text-xl font-bold flex items-center"
          >
            <Video className="h-6 w-6 text-blue-600 mr-2" />
            <span>VideoMeet</span>
          </Link>
          <div className="hidden md:flex space-x-6 ml-10">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <Home className="h-4 w-4" /> Home
            </Link>
            <Link
              href="/meetings"
              className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <Calendar className="h-4 w-4" /> Meetings
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <Users className="h-4 w-4" /> Contacts
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <Settings className="h-4 w-4" /> Settings
            </Link>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <ThemeSwitcher />
          <Link href="/meetings">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Video className="mr-2 h-4 w-4" /> New Meeting
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <UserCircle className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/dashboard">Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/meetings">Meetings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.refresh();
                }}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
