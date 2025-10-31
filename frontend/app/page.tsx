"use client";
import Sidebar from "@/components/Sidebar";
import { useAuthStore } from "@/store/userStore";
import { useEffect } from "react";
import Chat from "./chat/page";
import { useRouter } from "next/navigation";

export default function Home() {
  const { getProfile, user, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    getProfile();
  }, []);

  useEffect(() => {
    // redirect only after loading is finished
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center w-full h-screen">
        Loading...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex">
      <Sidebar />
      <Chat />
    </div>
  );
}
