"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-spin h-12 w-12 border-b-2 border-purple-500 rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>No user logged in.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <div className="bg-gray-900/70 backdrop-blur-xl p-8 rounded-2xl shadow-xl w-full max-w-lg text-center">

        {/* Profile Picture */}
        <div className="flex justify-center mb-6">
          <img
            src={user.profile_pic}
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
            {user.ls_points}
          </p>
        </div>
      </div>
    </div>
  );
}
