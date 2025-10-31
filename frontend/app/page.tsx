"use client"
import Sidebar from "@/components/Sidebar";
import { useAuthStore } from "@/store/userStore";
import { useEffect } from "react";
import Chat from "./chat/page";

export default function Home() {
  const { getProfile } = useAuthStore();

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <div className="flex">
        <Sidebar />
        <Chat />
    </div>
  );
}
