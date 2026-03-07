'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Edit2, Trash2, Trophy, Medal, Award, Loader2, Star, Calendar, Globe, MapPin, Building, GraduationCap, ChevronRight } from 'lucide-react'
import { apiService } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

interface Achievement {
  _id: string
  studentName: string
  competition: string
  category: string
  position: string
  date: string
  level: 'School' | 'District' | 'State' | 'National' | 'International'
  description?: string
}

interface StudentAchievementsProps {
  isEditable?: boolean
}

const COMPETITIONS = [
  'Science Fair', 'Math Olympiad', 'Debate Competition', 'Art Contest',
  'Sports Meet', 'Quiz Competition', 'Essay Writing', 'Spelling Bee',
  'Robotics Competition', 'Music Competition', 'Drama Festival', 'Poetry Recitation'
]

const CATEGORIES = [
  'Individual', 'Team', 'Group Project', 'Solo Performance', 'Pair Competition'
]

const POSITIONS = ['1st', '2nd', '3rd', 'Participation', 'Special Recognition', 'Best Performance']

const LEVELS = ['School', 'District', 'State', 'National', 'International'] as const

export default function StudentAchievements({ isEditable = false }: StudentAchievementsProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Achievement>>({
    level: 'School'
  })

  useEffect(() => {
    fetchAchievements()
  }, [])

  const fetchAchievements = async () => {
    try {
      setLoading(true)
      const data = await apiService.getAchievements()
      setAchievements(data)
    } catch (error) {
      console.error('Error fetching achievements:', error)
      toast({
        title: 'Error',
        description: 'Failed to load achievements',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddClick = () => {
    setEditingId(null)
    setFormData({
      studentName: '',
      competition: '',
      category: '',
      position: '',
      date: '',
      level: 'School',
      description: ''
    })
    setOpenDialog(true)
  }

  const handleEditClick = (achievement: Achievement) => {
    setEditingId(achievement._id)
    const formattedDate = achievement.date ? new Date(achievement.date).toISOString().split('T')[0] : ''
    setFormData({
      ...achievement,
      date: formattedDate
    })
    setOpenDialog(true)
  }

  const handleSave = async () => {
    if (!formData.studentName || !formData.competition || !formData.position || !formData.date || !formData.category) {
      toast({
        title: 'Required Fields',
        description: 'Please fill all required fields',
        variant: 'destructive',
      })
      return
    }

    try {
      if (editingId) {
        await apiService.updateAchievement(editingId, formData)
        toast({
          title: 'Success',
          description: 'Achievement updated successfully',
        })
      } else {
        await apiService.createAchievement(formData)
        toast({
          title: 'Success',
          description: 'Achievement added successfully',
        })
      }
      setOpenDialog(false)
      fetchAchievements()
    } catch (error) {
      console.error('Error saving achievement:', error)
      toast({
        title: 'Error',
        description: 'Failed to save achievement',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this achievement?')) {
      try {
        await apiService.deleteAchievement(id)
        toast({
          title: 'Success',
          description: 'Achievement deleted successfully',
        })
        fetchAchievements()
      } catch (error) {
        console.error('Error deleting achievement:', error)
        toast({
          title: 'Error',
          description: 'Failed to delete achievement',
          variant: 'destructive',
        })
      }
    }
  }

  const getPositionStyle = (position: string) => {
    switch (position) {
      case '1st': return { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10' }
      case '2nd': return { icon: Medal, color: 'text-gray-400', bg: 'bg-gray-400/10' }
      case '3rd': return { icon: Award, color: 'text-amber-600', bg: 'bg-amber-600/10' }
      default: return { icon: Star, color: 'text-primary', bg: 'bg-primary/10' }
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'International': return Globe
      case 'National': return Building
      case 'State': return MapPin
      case 'District': return MapPin
      default: return GraduationCap
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'International': return 'bg-purple-500/10 text-purple-600 border-purple-500/20'
      case 'National': return 'bg-red-500/10 text-red-600 border-red-500/20'
      case 'State': return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
      case 'District': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
      default: return 'bg-secondary/50 text-muted-foreground border-border/50'
    }
  }

  return (
    <Card className="bg-card border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">Global Student Talent</CardTitle>
            <CardDescription>Extra-curricular excellence & competitions</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Star className="w-5 h-5 text-primary" />
            </div>
            {isEditable && (
              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={handleAddClick} className="gap-2 font-black uppercase text-[10px] tracking-widest px-4">
                    <Plus className="h-3 w-3" /> Add Milestone
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md bg-card border-border shadow-2xl rounded-3xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-black text-foreground">
                      {editingId ? 'Refine Achievement' : 'Record New Triumph'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Student Identity</label>
                      <Input
                        placeholder="Full Name"
                        className="rounded-xl bg-secondary/50 border-none h-11"
                        value={formData.studentName || ''}
                        onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Competition</label>
                        <Select value={formData.competition || ''} onValueChange={(value) => setFormData({ ...formData, competition: value })}>
                          <SelectTrigger className="rounded-xl bg-secondary/50 border-none h-11">
                            <SelectValue placeholder="Domain" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-border bg-card">
                            {COMPETITIONS.map(comp => (
                              <SelectItem key={comp} value={comp} className="rounded-lg">{comp}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Category</label>
                        <Select value={formData.category || ''} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                          <SelectTrigger className="rounded-xl bg-secondary/50 border-none h-11">
                            <SelectValue placeholder="Format" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-border bg-card">
                            {CATEGORIES.map(cat => (
                              <SelectItem key={cat} value={cat} className="rounded-lg">{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Outcome</label>
                        <Select value={formData.position || ''} onValueChange={(value) => setFormData({ ...formData, position: value })}>
                          <SelectTrigger className="rounded-xl bg-secondary/50 border-none h-11 font-bold">
                            <SelectValue placeholder="Rank" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-border bg-card">
                            {POSITIONS.map(pos => (
                              <SelectItem key={pos} value={pos} className="rounded-lg font-bold">{pos}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Scope</label>
                        <Select value={formData.level || 'School'} onValueChange={(value) => setFormData({ ...formData, level: value as any })}>
                          <SelectTrigger className="rounded-xl bg-secondary/50 border-none h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-border bg-card">
                            {LEVELS.map(level => (
                              <SelectItem key={level} value={level} className="rounded-lg">{level}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Event Date</label>
                      <Input
                        type="date"
                        className="rounded-xl bg-secondary/50 border-none h-11"
                        value={formData.date || ''}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                    <Button onClick={handleSave} className="w-full h-12 rounded-xl font-black uppercase tracking-widest mt-2 shadow-lg shadow-primary/20 transition-all active:scale-95">
                      {editingId ? 'Update Record' : 'Log Achievement'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest animate-pulse">Synchronizing Merit database</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {achievements.length === 0 ? (
              <div className="text-center py-20 bg-secondary/20 rounded-2xl border border-dashed border-border/50">
                <Medal className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest opacity-50">Competitive pipeline initializing</p>
              </div>
            ) : (
              achievements.map((achievement) => {
                const style = getPositionStyle(achievement.position)
                const LevelIcon = getLevelIcon(achievement.level)
                return (
                  <div key={achievement._id} className="group relative overflow-hidden bg-secondary/20 hover:bg-secondary/40 rounded-2xl p-4 transition-all duration-300 border border-transparent hover:border-border/50 shadow-sm">
                    <div className="flex items-start justify-between relative z-10">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`p-1.5 rounded-lg ${style.bg} ${style.color}`}>
                            <style.icon className="h-4 w-4" />
                          </div>
                          <h4 className="font-bold text-foreground text-sm truncate">{achievement.studentName}</h4>
                          <Badge variant="outline" className={`text-[8px] font-black uppercase flex items-center gap-1 ${getLevelColor(achievement.level)}`}>
                            <LevelIcon className="h-2 w-2" />
                            {achievement.level}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2">
                          <p className="text-[11px] font-bold text-foreground">
                            {achievement.competition}
                          </p>
                          <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" /> {achievement.category}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 bg-background/50 rounded-md px-2 py-0.5 border border-border/30">
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Rank</span>
                            <span className={`text-[11px] font-black ${style.color}`}>{achievement.position}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span className="text-[9px] font-black uppercase">{new Date(achievement.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4 self-center">
                        {isEditable && (
                          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-lg shadow-sm" onClick={() => handleEditClick(achievement)}>
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" variant="destructive" className="h-8 w-8 rounded-lg shadow-sm bg-red-500/10 text-red-600 border-none hover:bg-red-500/20" onClick={() => handleDelete(achievement._id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                        <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                    {/* Background accent */}
                    <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-none opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )
              })
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
