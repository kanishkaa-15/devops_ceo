'use client'

import { BarChart3, X, Eye, Users, BookOpen, MessageSquare, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CEOSidebarProps {
  isOpen: boolean
  onClose: () => void
  onNavigate: (page: 'dashboard' | 'staff' | 'admissions' | 'queries' | 'student-performance') => void
}

const viewOnlyItems = [
  { icon: BarChart3, label: 'Analytics Dashboard', page: 'dashboard' as const },
  { icon: Users, label: 'View Staff', page: 'staff' as const },
  { icon: BookOpen, label: 'View Admissions', page: 'admissions' as const },
  { icon: MessageSquare, label: 'View Queries', page: 'queries' as const },
  { icon: GraduationCap, label: 'Student Performance', page: 'student-performance' as const },
]

export default function CEOSidebar({ isOpen, onClose, onNavigate }: CEOSidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-72 bg-white/5 dark:bg-slate-950/40 backdrop-blur-2xl border-r border-white/10 dark:border-slate-800/50 transform transition-all duration-500 ease-in-out z-40 ${isOpen ? 'translate-x-0 shadow-[20px_0_50px_rgba(0,0,0,0.3)]' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-8 border-b border-white/5 dark:border-slate-800/30 flex items-center justify-between bg-gradient-to-b from-white/5 to-transparent">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Executive</h2>
              <p className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase opacity-80">Command Suite</p>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-all hover:rotate-90"
            >
              <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>
          </div>

          {/* Menu items */}
          <nav className="flex-1 p-6 space-y-3 overflow-y-auto custom-scrollbar">
            <div className="space-y-1.5 font-sans">
              {viewOnlyItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.label}
                    variant="ghost"
                    className="w-full justify-start h-12 text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary dark:hover:text-primary group relative overflow-hidden rounded-xl border border-transparent hover:border-primary/20 transition-all duration-300"
                    onClick={() => {
                      onNavigate(item.page)
                      onClose()
                    }}
                  >
                    <div className="absolute inset-y-0 left-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-center rounded-r-full" />
                    <Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                  </Button>
                )
              })}
            </div>

            {/* Read-only notice */}
            <div className="pt-6 mt-6 border-t border-white/5 dark:border-slate-800/30">
              <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-4 border border-primary/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-colors" />
                <div className="flex items-center gap-2 mb-1.5">
                  <Eye className="w-3.5 h-3.5 text-primary" />
                  <p className="text-[10px] text-primary font-black uppercase tracking-widest">Read-Only</p>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed">Executive oversight enabled. Internal data modification restricted.</p>
              </div>
            </div>
          </nav>

          {/* Footer info */}
          <div className="p-6 border-t border-white/5 dark:border-slate-800/30 bg-gradient-to-t from-white/5 to-transparent">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 dark:bg-slate-900/50 border border-white/5 dark:border-slate-800/50">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-black text-sm shadow-lg shadow-primary/20">
                AD
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] text-slate-900 dark:text-white font-black uppercase truncate">Administrator</p>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold truncate tracking-tight uppercase opacity-60">Executive Hub</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}