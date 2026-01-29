import { LayoutDashboard, BookOpen, Calendar, FileText, Settings, LogOut, PanelLeftClose, PanelLeft, Bot } from "lucide-react";

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    collapsed: boolean;
    toggleCollapse: () => void;
}

export default function Sidebar({ activeTab, onTabChange, collapsed, toggleCollapse }: SidebarProps) {
    return (
        <div className={`
             md:h-full md:w-full flex-shrink-0 bg-surface border border-border shadow-sm flex flex-col transition-all duration-300 rounded-3xl
             ${collapsed ? "items-center" : ""}
        `}>
            {/* Header */}
            <div className={`p-6 flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
                <div className="p-2 bg-primary/10 rounded-xl flex-shrink-0">
                    <Bot className="w-6 h-6 text-primary flex-shrink-0" />
                </div>
                {!collapsed && <span className="text-xl text-foreground font-medium tracking-tight">Study Buddy</span>}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 mt-2">
                <NavItem icon={LayoutDashboard} label="Dashboard" id="dashboard" activeTab={activeTab} onClick={onTabChange} collapsed={collapsed} />
                <NavItem icon={BookOpen} label="Coursework" id="courses" activeTab={activeTab} onClick={onTabChange} collapsed={collapsed} />
                <NavItem icon={Calendar} label="Schedule" id="schedule" activeTab={activeTab} onClick={onTabChange} collapsed={collapsed} />
                <NavItem icon={FileText} label="Notes" id="notes" activeTab={activeTab} onClick={onTabChange} collapsed={collapsed} />
                <div className="lg:hidden"> {/* Only show Tools tab on mobile/tablet where right panel is hidden */}
                    <NavItem icon={Bot} label="Tools" id="tools" activeTab={activeTab} onClick={onTabChange} collapsed={collapsed} />
                </div>
            </nav>

            {/* Bottom Section */}
            <div className="p-4 mt-auto border-t border-border/50">
                <NavItem icon={Settings} label="Settings" id="settings" activeTab={activeTab} onClick={onTabChange} collapsed={collapsed} />

                <button
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-red-400 hover:bg-red-50 hover:text-red-600 group ${collapsed ? "justify-center" : ""}`}
                >
                    <LogOut className={`w-5 h-5 flex-shrink-0`} />
                    {!collapsed && <span className="text-sm">Log out</span>}
                </button>

                {/* Collapse Toggle */}
                <button
                    onClick={toggleCollapse}
                    className="mt-4 w-full flex items-center justify-center p-2 text-muted hover:text-foreground transition-all"
                    title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {collapsed ? <PanelLeft className="w-5 h-5 flex-shrink-0" /> : <PanelLeftClose className="w-5 h-5 flex-shrink-0" />}
                </button>
            </div>
        </div>
    );
}

function NavItem({ label, id, activeTab, onClick, icon: Icon, collapsed }: { label: string, id: string, activeTab: string, onClick: (id: string) => void, icon: React.ElementType, collapsed: boolean }) {
    const active = activeTab === id;
    return (
        <button
            onClick={() => onClick(id)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group
            ${active
                    ? "bg-surface-hover text-primary shadow-sm ring-1 ring-border/50"
                    : "text-muted hover:text-foreground hover:bg-surface-hover/50"}
            ${collapsed ? "justify-center" : ""}
            `}
            title={collapsed ? label : undefined}
        >
            <Icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-primary" : "text-muted group-hover:text-foreground"}`} />
            {!collapsed && <span className={`text-sm ${active ? "font-medium" : ""}`}>{label}</span>}
        </button>
    )
}
