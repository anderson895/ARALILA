"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import FullscreenMenu from "@/components/student/fullscreen-menu";
import Sidebar from "@/components/student/sidebar";
import Header from "@/components/student/header";
import AnimatedBackground from "@/components/bg/animatedforest-bg";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center bg-black text-white">
        <div className="animate-spin h-12 w-12 border-b-2 border-purple-500 rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  // Badges for login streak milestones
  const badges = [
    { id: 1, name: "3 Days Login Streak", icon: "/images/badges/3days.png", requiredPoints: 3 },
    { id: 2, name: "5 Days Login Streak", icon: "/images/badges/5days.png", requiredPoints: 5 },
    { id: 3, name: "30 Days Login Streak", icon: "/images/badges/30days.png", requiredPoints: 30 },
    { id: 4, name: "100 Days Login Streak", icon: "/images/badges/100days.png", requiredPoints: 100 },
    { id: 5, name: "200 Days Login Streak", icon: "/images/badges/200days.png", requiredPoints: 200 },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      {/* Navigation & Background */}
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <FullscreenMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <AnimatedBackground />
      <Sidebar />

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 pt-28 pb-10 md:p-8 md:pl-24 md:pt-32 md:pb-12">
        <div className="w-full max-w-lg bg-gray-900/70 backdrop-blur-xl p-8 rounded-2xl shadow-xl text-center">
          {/* Profile Picture */}
          <div className="flex justify-center mb-6">
            <img
              src={user.profile_pic || "/default-avatar.png"}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-purple-400 shadow-lg"
            />
          </div>

          {/* Name */}
          <h1 className="text-3xl font-bold mb-2">
            {user.first_name} {user.last_name}
          </h1>

          {/* Email */}
          <p className="text-gray-300 mb-2">{user.email}</p>

          {/* School */}
          {user.school_name && (
            <p className="text-purple-300 mb-4">{user.school_name}</p>
          )}

          {/* Login Streak Points */}
          <div className="mt-6 p-4 rounded-xl bg-purple-500/20 border border-purple-400/40">
            <p className="text-lg font-semibold">🔥 Login Streak Points</p>
            <p className="text-4xl font-bold text-purple-300 mt-2">
              {user.ls_points || 0}
            </p>
          </div>

         {/* Badges Section */}
          <div className="mt-8 text-left">
            <h2 className="text-xl font-semibold mb-4">Login Streak Badges</h2>
            <div className="grid grid-cols-2 gap-4">
              {badges.map((badge) => {
                // Check if the badge id exists in the user's collected badges
                const unlocked = user.collected_badges?.includes(badge.id.toString()) || false;

                return (
                  <div
                    key={badge.id}
                    className={`flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-2 transition-colors rounded-full ${
                      unlocked ? "bg-purple-500/20 border-purple-400" : "opacity-50"
                    }`}
                  >
                    <img
                      src={badge.icon}
                      alt={badge.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-sm md:text-base">{badge.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
