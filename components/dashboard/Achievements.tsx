'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Star, Award, Target, TrendingUp, Users, ChevronRight, Calendar } from 'lucide-react'
import { useState, useEffect } from 'react'

const achievementIcons = {
  trophy: Trophy,
  star: Star,
  award: Award,
  target: Target,
  trending: TrendingUp,
  users: Users,
}

export default function Achievements() {
  const [achievements, setAchievements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAchievements()
  }, [])

  const fetchAchievements = async () => {
    try {
      const staticAchievements = [
        {
          id: '1',
          title: 'Excellence in Education',
          description: 'Awarded Best School of the Year 2024',
          category: 'Academic',
          date: '2024-01-15',
          icon: 'trophy',
          status: 'achieved'
        },
        {
          id: '2',
          title: '95% Pass Rate',
          description: 'Achieved 95% student pass rate this semester',
          category: 'Performance',
          date: '2024-01-10',
          icon: 'star',
          status: 'achieved'
        },
        {
          id: '3',
          title: 'Staff Excellence',
          description: '100% staff retention rate for 2024',
          category: 'HR',
          date: '2024-01-05',
          icon: 'users',
          status: 'achieved'
        },
        {
          id: '4',
          title: 'Parent Satisfaction',
          description: '98% parent satisfaction rating',
          category: 'Community',
          date: '2024-01-01',
          icon: 'award',
          status: 'achieved'
        },
        {
          id: '5',
          title: 'Growth Target',
          description: 'Reached 500+ student enrollment milestone',
          category: 'Growth',
          date: '2023-12-20',
          icon: 'trending',
          status: 'achieved'
        },
        {
          id: '6',
          title: 'Digital Excellence',
          description: 'Successfully implemented digital learning platform',
          category: 'Technology',
          date: '2023-12-15',
          icon: 'target',
          status: 'achieved'
        }
      ]
      setAchievements(staticAchievements)
    } catch (error) {
      console.error('Error fetching achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryConfig = (category: string) => {
    switch (category) {
      case 'Academic': return { color: 'text-blue-500', bg: 'bg-blue-500/10' }
      case 'Performance': return { color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
      case 'HR': return { color: 'text-purple-500', bg: 'bg-purple-500/10' }
      case 'Community': return { color: 'text-orange-500', bg: 'bg-orange-500/10' }
      case 'Growth': return { color: 'text-amber-500', bg: 'bg-amber-500/10' }
      case 'Technology': return { color: 'text-indigo-500', bg: 'bg-indigo-500/10' }
      default: return { color: 'text-muted-foreground', bg: 'bg-secondary/50' }
    }
  }

  if (loading) {
    return (
      <Card className="bg-card border-border/50 animate-pulse">
        <CardHeader className="pb-2">
          <div className="h-6 w-32 bg-secondary rounded mb-2" />
          <div className="h-4 w-48 bg-secondary rounded" />
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-secondary/50 rounded-xl" />)}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">Institutional Awards</CardTitle>
            <CardDescription>Major milestones & global recognition</CardDescription>
          </div>
          <div className="p-2 bg-yellow-500/10 rounded-lg">
            <Trophy className="w-5 h-5 text-yellow-500" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {achievements.map((achievement) => {
            const IconComponent = achievementIcons[achievement.icon as keyof typeof achievementIcons] || Trophy
            const config = getCategoryConfig(achievement.category)
            return (
              <div key={achievement.id} className="group relative overflow-hidden flex flex-col p-4 bg-secondary/30 hover:bg-secondary/50 rounded-2xl transition-all duration-300 border border-transparent hover:border-border/50">
                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className={`p-2.5 rounded-xl ${config.bg} ${config.color} group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <Badge className={`${config.bg} ${config.color} border-none font-bold text-[9px] px-2 py-0.5 uppercase tracking-tighter`}>
                    {achievement.category}
                  </Badge>
                </div>

                <div className="space-y-1 relative z-10 flex-1">
                  <h4 className="font-bold text-foreground text-sm leading-tight flex items-center gap-1.5">
                    {achievement.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                    {achievement.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span className="text-[9px] font-black uppercase">{new Date(achievement.date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                </div>

                {/* Decorative background element */}
                <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )
          })}
        </div>

        {achievements.length === 0 && (
          <div className="text-center py-12 bg-secondary/20 rounded-2xl border border-dashed border-border/50">
            <Trophy className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Awaiting milestones</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}