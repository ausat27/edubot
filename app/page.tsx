"use client";

import { useState } from "react";
import { LayoutGroup, motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

import Sidebar from "../components/Sidebar";
import ChatInterface from "../components/ChatInterface";
import StudyTools from "../components/StudyTools";
import NoteManager from "../components/NoteManager";
import WeeklyPlanner from "../components/WeeklyPlanner";
import AudioPlayer from "../components/AudioPlayer";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="h-full w-full bg-background text-foreground flex flex-col overflow-hidden">

      {/* --- Main Content Area (Everything except Audio Docker) --- */}
      <LayoutGroup>
        <div className="flex-1 flex overflow-hidden relative">

          {/* 1. Mobile Sidebar Toggle */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden absolute top-4 left-4 z-50 p-2 bg-background/80 backdrop-blur rounded-lg border border-border shadow-sm"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>

          {/* 2. Sidebar (Mobile Overlay + Desktop Static) */}
          <AnimatePresence mode="wait">
            {(isSidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 768)) && (
              <motion.div
                layout
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={`
                   fixed inset-y-0 left-0 z-40 bg-background md:relative md:inset-auto md:bg-transparent
                   border-r border-border md:border-none
                   ${isSidebarCollapsed ? "w-[80px]" : "w-[280px]"}
                   transition-all duration-300 ease-in-out
                   ${!isSidebarOpen && "hidden md:flex"}
                 `}
              >
                <div className="w-full h-full p-3 md:p-4 flex flex-col">
                  {/* Mobile Close Button */}
                  <div className="md:hidden flex justify-end mb-4">
                    <button onClick={() => setIsSidebarOpen(false)}>
                      <X className="w-6 h-6 text-muted" />
                    </button>
                  </div>

                  <Sidebar
                    activeTab={activeTab}
                    onTabChange={(tab) => { setActiveTab(tab); setIsSidebarOpen(false); }}
                    collapsed={isSidebarCollapsed}
                    toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Backdrop */}
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
            />
          )}


          {/* 3. Center Workspace (Chat + Dynamic Tools) */}
          <motion.main layout className="flex-1 min-w-0 h-full p-2 md:p-3 flex gap-4">

            {/* Center Panel (Usage depends on activeTab) */}
            <div className="flex-1 flex flex-col min-w-0 h-full bg-surface/30 rounded-2xl border border-border/50 overflow-hidden relative">
              {activeTab === "dashboard" && <ChatInterface className="w-full h-full" />}
              {activeTab === "notes" && <NoteManager />}
              {activeTab === "schedule" && <WeeklyPlanner />}
              {activeTab === "tools" && <StudyTools />}
            </div>

            {/* Right Panel (Desktop Only Tools) */}
            <div className={`
              hidden xl:flex flex-col w-[350px] 2xl:w-[400px] gap-4 h-full
            `}>
              <StudyTools />
            </div>

          </motion.main>

        </div>
      </LayoutGroup>

      {/* --- Footer Audio Player --- */}
      <div className="flex-shrink-0 z-50 bg-surface border-t border-border">
        <AudioPlayer />
      </div>

    </div>
  );
}
