"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import FullscreenMenu from "@/components/student/fullscreen-menu";
import Sidebar from "@/components/student/sidebar";
import Header from "@/components/student/header";
import AnimatedBackground from "@/components/bg/animatedforest-bg";
import { createClient } from "@/lib/supabase/client";

export default function ReviewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const areaParam = searchParams.get("area") || "0";

  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);

  // NEW STATES (optimized)
  const [currentQuestion, setCurrentQuestion] = useState<any | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1); // load Q1 first
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  // Word → number of image variations
  const wordVariations: Record<string, number> = {
    bola: 1,
    laro: 4,
    sample: 3,
  };

  // Convert word → Supabase image URL
  const getQuestionImage = (word: string) => {
    const base = word.split("_")[0].toLowerCase();
    const max = wordVariations[base] || 1;
    const index = max === 1 ? 1 : Math.floor(Math.random() * max) + 1;
    const fileName = `${base}_${index}.jpg`;

    const { data } = supabase.storage
      .from("games_fourpicsoneword_images")
      .getPublicUrl(fileName);

    if (!data?.publicUrl) {
      console.warn("Image missing:", fileName);
      return "";
    }

    return data.publicUrl;
  };

  // Fetch single question from backend
  const fetchSingleQuestion = async (num: number) => {
    try {
      setLoading(true);
      setFlipped(false);
      setError(null);

      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const areaId = parseInt(areaParam, 10);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/games/questions/single/${areaId}/${num}/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch question.");

      const data = await res.json();
      const imgUrl = getQuestionImage(data.word);

      setCurrentQuestion({ ...data, imgUrl });
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Load first question
  useEffect(() => {
    if (user) {
      fetchSingleQuestion(1);
    }
  }, [user]);

  // Next question handler
  const nextQuestion = () => {
    const next = questionNumber + 1;
    setQuestionNumber(next);
    fetchSingleQuestion(next);
  };

  // Flip card
  const flipCard = () => setFlipped((prev) => !prev);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackground />

      <FullscreenMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <Sidebar />
      <Header onMenuClick={() => setMenuOpen(true)} />

      <div className="relative z-10 flex flex-col items-center px-6 py-10 text-white">
        <h1 className="text-3xl font-bold mb-6">Review Mode</h1>

        {loading && <p className="text-lg">Loading question...</p>}

        {error && <p className="text-red-400">{error}</p>}

        {!loading && currentQuestion && (
          <div className="w-full max-w-xl text-center">
            {/* Image */}
            <img
              src={currentQuestion.imgUrl}
              alt="question"
              className="w-full rounded-lg shadow-lg mb-6"
            />

            {/* Flashcard */}
            <div
              className={`relative w-full h-40 cursor-pointer transition-transform duration-500 ${
                flipped ? "rotate-y-180" : ""
              }`}
              onClick={flipCard}
            >
              <div className="absolute w-full h-full backface-hidden flex items-center justify-center bg-blue-700 rounded-lg text-xl font-bold">
                {currentQuestion.word}
              </div>
              <div className="absolute w-full h-full rotate-y-180 backface-hidden flex items-center justify-center bg-green-700 rounded-lg text-xl font-bold">
                {currentQuestion.meaning || "Meaning"}
              </div>
            </div>

            {/* Next Button */}
            <button
              onClick={nextQuestion}
              className="mt-8 px-6 py-3 bg-yellow-400 text-black rounded-lg font-semibold hover:bg-yellow-300"
            >
              NEXT →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
