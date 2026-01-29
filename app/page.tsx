"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatInterface from "../components/ChatInterface";
import StudyTools from "../components/StudyTools";
import NoteManager from "../components/NoteManager";
import WeeklyPlanner from "../components/WeeklyPlanner";
import AudioPlayer from "../components/AudioPlayer";
import { Menu, X } from "lucide-react";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="h-[100dvh] w-full bg-background flex flex-col overflow-hidden">

      {/* Main Workspace Area - Added top padding for mobile to clear the menu button */}
      <div className="flex-1 flex overflow-hidden relative gap-6 p-4 pb-4 pt-20 md:pt-4">

        {/* Mobile Menu Button - Positioned to not overlap */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="absolute top-6 left-4 z-50 md:hidden p-2.5 bg-background/80 backdrop-blur-md rounded-xl shadow-sm border border-border text-foreground hover:bg-surface transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-[100] md:hidden animate-in fade-in duration-200"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div className={`
          fixed inset-y-0 left-0 z-[100] transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 md:flex-shrink-0 md:h-full md:block
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          ${isCollapsed ? "w-20" : "w-72"}
        `}>
          <div className="h-full relative">
            {/* Close button for mobile */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="absolute top-4 right-4 z-50 md:hidden text-muted hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar
              activeTab={activeTab}
              onTabChange={(tab) => { setActiveTab(tab); setIsSidebarOpen(false); }}
              collapsed={isCollapsed}
              toggleCollapse={() => setIsCollapsed(!isCollapsed)}
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="flex-1 h-full gap-6 grid grid-cols-1 lg:grid-cols-12 min-h-0">

          {/* Dynamic Center Panel */}
          <div className="h-full lg:col-span-7 xl:col-span-8 2xl:col-span-9 flex flex-col min-h-0">
            {activeTab === "dashboard" ? (
              <ChatInterface className="h-full w-full" />
            ) : activeTab === "notes" ? (
              <NoteManager />
            ) : activeTab === "schedule" ? (
              <WeeklyPlanner />
            ) : activeTab === "tools" ? (
              <StudyTools />
            ) : (
              <div className="flex items-center justify-center h-full text-muted font-serif italic">
                Work in progress...
              </div>
            )}
          </div>

          {/* Right Panel - Tools */}
          <div className="h-full lg:col-span-5 xl:col-span-4 2xl:col-span-3 hidden lg:flex lg:flex-col lg:min-h-0">
            <StudyTools />
          </div>

        </div>
      </div>

      {/* Static Audio Dock Shelf */}
      <div className="flex-shrink-0 z-50 bg-surface/30 border-t border-border backdrop-blur-xl">
        <AudioPlayer />
      </div>

    </div>
  );
}
