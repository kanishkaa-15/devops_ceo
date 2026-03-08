'use client'

import React from "react"
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { GraduationCap } from 'lucide-react'
import { GoogleLogin } from '@react-oauth/google'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { API_URL } from '@/lib/api-config'

interface LoginPageProps {
  onNavigateToSignup: () => void
  onLogin: (user: any) => void
}

const CLASSES = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']
const SECTIONS = ['A', 'B', 'C', 'D']

export default function LoginPage({ onNavigateToSignup, onLogin }: LoginPageProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loginStep, setLoginStep] = useState<'auth' | 'context'>('auth')
  const [tempUser, setTempUser] = useState<any>(null)
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [parentStudents, setParentStudents] = useState<any[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [loading, setLoading] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        })

        const data = await response.json()

        if (response.ok) {
          if (data.user.role === 'staff') {
            setTempUser(data)
            setLoginStep('context')
            // Pre-fill if assigned
            if (data.user.assignedClass) setSelectedClass(data.user.assignedClass)
            if (data.user.assignedSection) setSelectedSection(data.user.assignedSection)
          } else if (data.user.role === 'parent') {
            setTempUser(data)
            fetchParentStudents(data)
          } else {
            completeLogin(data)
          }
        } else {
          toast({
            title: 'Error',
            description: data.message || 'Invalid credentials',
            variant: 'destructive',
          })
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Network error. Please check if the server is running.',
          variant: 'destructive',
        })
      }
    }
  }

  const completeLogin = (authData: any, classContext?: { class: string, section: string }) => {
    localStorage.setItem('token', authData.token)

    const userToStore = { ...authData.user }
    if (classContext) {
      userToStore.activeClass = classContext.class
      userToStore.activeSection = classContext.section
    }
    if (userToStore.role === 'parent' && parentStudents.length > 0) {
      const selected = parentStudents.find(s => s.studentId === selectedStudentId)
      if (selected) {
        userToStore.activeStudentId = selected.studentId
        userToStore.activeStudentName = selected.studentName
      }
    }

    localStorage.setItem('user', JSON.stringify(userToStore))

    toast({
      title: 'Welcome',
      description: `Welcome back, ${authData.user.name}!`,
    })

    setFormData({ email: '', password: '' })
    onLogin(userToStore)
  }

  const handleContextSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClass || !selectedSection) {
      toast({
        title: 'Selection Required',
        description: 'Please select both a class and a section.',
        variant: 'destructive',
      })
      return
    }
    completeLogin(tempUser, { class: selectedClass, section: selectedSection })
  }

  const handleParentContextSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudentId) {
      toast({
        title: 'Selection Required',
        description: 'Please select a student to continue.',
        variant: 'destructive',
      })
      return
    }
    completeLogin(tempUser)
  }

  const fetchParentStudents = async (authData: any) => {
    try {
      setLoading(true)
      const user = authData.user
      const identifier = user.name || user.email
      const response = await fetch(`${API_URL}/admissions/parent/${encodeURIComponent(identifier)}`, {
        headers: {
          'Authorization': `Bearer ${authData.token}`
        }
      })
      const data = await response.json()

      if (response.ok) {
        setParentStudents(data)
        if (data.length > 1) {
          setLoginStep('context')
        } else if (data.length === 1) {
          // Auto-select if only one student
          const student = data[0]
          localStorage.setItem('token', authData.token)
          const userToStore = { ...user, activeStudentId: student.studentId, activeStudentName: student.studentName }
          localStorage.setItem('user', JSON.stringify(userToStore))
          onLogin(userToStore)
        } else {
          // No students found, still login but dashboard will show empty state
          completeLogin(authData)
        }
      }
    } catch (error) {
      console.error('Error fetching parent students:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (response: any) => {
    try {
      const res = await fetch(`${API_URL}/auth/google-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: response.credential,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        if (data.user.role === 'staff') {
          setTempUser(data)
          setLoginStep('context')
          if (data.user.assignedClass) setSelectedClass(data.user.assignedClass)
          if (data.user.assignedSection) setSelectedSection(data.user.assignedSection)
        } else {
          completeLogin(data)
        }
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Google login failed',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Network error. Please check if the server is running.',
        variant: 'destructive',
      })
    }
  }

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const isGoogleConfigured = googleClientId && googleClientId !== 'your_google_client_id_here'

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md shadow-lg border-border/50">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-primary/10 rounded-lg">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-foreground">Login</CardTitle>
          <CardDescription>School CEO Dashboard Platform</CardDescription>
        </CardHeader>
        <CardContent>
          {loginStep === 'auth' ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@school.edu"
                    value={formData.email}
                    onChange={handleChange}
                    className={`border-border/50 focus:border-primary ${errors.email ? 'border-destructive' : ''}`}
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className={`border-border/50 focus:border-primary ${errors.password ? 'border-destructive' : ''}`}
                  />
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                >
                  Login to Dashboard
                </Button>
              </form>

              {isGoogleConfigured && (
                <div className="mt-4 flex flex-col items-center space-y-4">
                  <div className="relative w-full">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground font-medium">Or continue with</span>
                    </div>
                  </div>

                  <div className="w-full flex justify-center mt-2">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => {
                        toast({
                          title: 'Error',
                          description: 'Google login failed',
                          variant: 'destructive',
                        })
                      }}
                      useOneTap
                    />
                  </div>
                </div>
              )}

              <div className="mt-8 space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-center text-slate-400 uppercase tracking-[0.2em]">Quick Role Access (Demo)</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { role: 'CEO', email: 'ceo@school.edu' },
                    { role: 'Staff', email: 'staff@school.edu' },
                    { role: 'Parent', email: 'parent@school.edu' },
                    { role: 'Admin', email: 'admin@school.edu' },
                  ].map((btn) => (
                    <Button
                      key={btn.role}
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData({ email: btn.email, password: btn.role.toLowerCase() === 'admin' ? 'admin123' : btn.role.toLowerCase() === 'ceo' ? 'ceo123' : btn.role.toLowerCase() === 'staff' ? 'staff123' : 'parent123' })}
                      className="h-9 text-[10px] font-black uppercase tracking-widest border-slate-200 hover:bg-primary/5 hover:text-primary transition-all rounded-xl"
                    >
                      {btn.role}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="mt-6 text-center text-sm">
                <p className="text-muted-foreground">
                  Don't have an account?{' '}
                  <button
                    onClick={onNavigateToSignup}
                    className="text-primary hover:underline font-medium transition-colors"
                  >
                    Sign up here
                  </button>
                </p>
              </div>
            </>
          ) : (
            <form
              onSubmit={tempUser?.user?.role === 'parent' ? handleParentContextSubmit : handleContextSubmit}
              className="space-y-6 py-4"
            >
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-foreground mb-1">
                  {tempUser?.user?.role === 'parent'
                    ? `Welcome, ${tempUser.user.name}`
                    : "Session Setup"
                  }
                </h3>
                <p className="text-sm text-muted-foreground">
                  {tempUser?.user?.role === 'parent'
                    ? "Select which student dashboard you wish to access today."
                    : "Select the class and section you want to manage for this session."
                  }
                </p>
              </div>

              <div className="space-y-4">
                {tempUser?.user?.role === 'parent' ? (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Select Student</Label>
                    <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a student" />
                      </SelectTrigger>
                      <SelectContent>
                        {parentStudents.map(student => (
                          <SelectItem key={student.studentId} value={student.studentId}>
                            {student.studentName} ({student.studentId})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Select Class</Label>
                      <Select value={selectedClass} onValueChange={setSelectedClass}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose a class" />
                        </SelectTrigger>
                        <SelectContent>
                          {CLASSES.map(cls => (
                            <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Select Section</Label>
                      <Select value={selectedSection} onValueChange={setSelectedSection}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose a section" />
                        </SelectTrigger>
                        <SelectContent>
                          {SECTIONS.map(sec => (
                            <SelectItem key={sec} value={sec}>Section {sec}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Button type="submit" className="w-full h-11 bg-primary font-bold">
                  Enter Dashboard
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-xs"
                  onClick={() => setLoginStep('auth')}
                >
                  Back to Authentication
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
