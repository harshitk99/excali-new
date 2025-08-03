"use client";

import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 rounded-lg shadow-lg bg-white flex flex-col items-center">
        <h1 className="text-3xl mb-8 font-bold text-center">Welcome!</h1>
        <button
          className="w-full p-3 mb-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={() => router.push("/login")}
        >
          Login
        </button>
        <button
          className="w-full p-3 bg-green-500 text-white rounded hover:bg-green-600 transition"
          onClick={() => router.push("/signup")}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
