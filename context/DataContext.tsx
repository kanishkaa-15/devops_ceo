'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { io } from 'socket.io-client'
import { API_URL, SOCKET_URL } from '@/lib/api-config'

export interface StaffMember {
  id: string
  _id?: string
  name: string
  email: string
  department: string
  position: string
  joinDate: string
  status: 'Active' | 'Inactive' | 'On Leave'
  experience: number
}

export interface AdmissionApplication {
  id: string
  _id?: string
  studentName: string
  parentEmail: string
  appliedFor: string
  applicationDate: string
  status: 'Pending' | 'Approved' | 'Rejected' | 'Under Review'
  marks: number
  phone: string
}

export interface ParentQuery {
  id: string
  _id?: string
  parentName: string
  studentName: string
  email: string
  phone: string
  category: string
  subject: string
  message: string
  status: 'Open' | 'In Progress' | 'Resolved'
  priority: 'Low' | 'Medium' | 'High'
  createdDate?: string
  createdAt?: string
  response?: string
  sentiment?: string
}

interface DataContextType {
  staff: StaffMember[]
  addStaff: (member: Omit<StaffMember, 'id'>) => void
  updateStaff: (id: string, member: Omit<StaffMember, 'id'>) => void
  deleteStaff: (id: string) => void

  admissions: AdmissionApplication[]
  addAdmission: (app: Partial<AdmissionApplication> & Omit<AdmissionApplication, 'id'>) => void
  updateAdmission: (id: string, app: Omit<AdmissionApplication, 'id'>) => void
  deleteAdmission: (id: string) => void

  queries: ParentQuery[]
  addQuery: (query: Partial<ParentQuery> & Omit<ParentQuery, 'id'>) => void
  updateQuery: (id: string, query: Omit<ParentQuery, 'id'>) => void
  deleteQuery: (id: string) => void

  notifications: AppNotification[]
  markNotificationRead: (id: string) => void
  markAllRead: () => void
}

export interface AppNotification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  timestamp: Date
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [admissions, setAdmissions] = useState<AdmissionApplication[]>([])
  const [queries, setQueries] = useState<ParentQuery[]>([])
  const [notifications, setNotifications] = useState<AppNotification[]>([])

  const addLocalNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    setNotifications(prev => [{
      ...notif, 
      id: Date.now().toString() + Math.random().toString(), 
      timestamp: new Date(), 
      read: false 
    }, ...prev].slice(0, 50))
  }

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  useEffect(() => {
    // 1. Initial REST API Fetch
    const fetchInitialData = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};

        const [staffRes, admissionsRes, queriesRes] = await Promise.all([
          fetch(`${API_URL}/staff`, { headers }).catch(e => { console.warn('Staff fetch failed', e); return null }),
          fetch(`${API_URL}/admissions`, { headers }).catch(e => { console.warn('Admissions fetch failed', e); return null }),
          fetch(`${API_URL}/queries`, { headers }).catch(e => { console.warn('Queries fetch failed', e); return null })
        ])

        if (staffRes?.ok) {
          const staffData = await staffRes.json()
          if (Array.isArray(staffData)) {
            const uniqueStaff = staffData.filter((s, idx, self) => 
              idx === self.findIndex(t => (t._id && s._id && t._id === s._id) || (t.id && s.id && t.id === s.id))
            )
            setStaff(uniqueStaff)
          }
        }
        if (admissionsRes?.ok) {
          const admissionsData = await admissionsRes.json()
          if (Array.isArray(admissionsData)) {
            const uniqueAdmissions = admissionsData.filter((a, idx, self) => 
              idx === self.findIndex(t => (t._id && a._id && t._id === a._id) || (t.id && a.id && t.id === a.id))
            )
            setAdmissions(uniqueAdmissions)
          }
        }
        if (queriesRes?.ok) {
          const queriesData = await queriesRes.json()
          if (Array.isArray(queriesData)) {
            const uniqueQueries = queriesData.filter((q, idx, self) => 
              idx === self.findIndex(t => (t._id && q._id && t._id === q._id) || (t.id && q.id && t.id === q.id))
            )
            setQueries(uniqueQueries)
          }
        }
      } catch (err) {
        console.error('Context initialization failed:', err)
      }
    }

    fetchInitialData()

    // 2. Telemetry Real-time Hook (Socket.io)
    const socket = io(SOCKET_URL)

    socket.on('newQuery', (newQuery: ParentQuery) => {
      console.log('Real-Time Context: Received newQuery payload from quantum link')
      setQueries(prev => {
        // Prevent duplicates from race conditions between manual POST and Socket event
        const exists = prev.some(q => q._id === newQuery._id || q.id === newQuery.id)
        if (exists) return prev
        return [newQuery, ...prev]
      })
      addLocalNotification({
        title: 'New Stakeholder Query',
        message: `From: ${newQuery.parentName} - ${newQuery.subject}`,
        type: 'warning'
      })
    })

    socket.on('newAdmission', (newAdmission: AdmissionApplication) => {
      console.log('Real-Time Context: Received newAdmission payload from quantum link')
      setAdmissions(prev => {
        const exists = prev.some(a => a._id === newAdmission._id || a.id === newAdmission.id)
        if (exists) return prev
        return [newAdmission, ...prev]
      })
      addLocalNotification({
        title: 'New Admission Application',
        message: `${newAdmission.studentName} applying for ${newAdmission.appliedFor}`,
        type: 'info'
      })
    })

    socket.on('health_index_updated', (data: any) => {
      addLocalNotification({
        title: 'Health Index Recalculated',
        message: `System health is now ${data.overallScore}% (${data.riskLevel})`,
        type: data.riskLevel === 'HIGH' ? 'error' : data.riskLevel === 'MEDIUM' ? 'warning' : 'success'
      })
    })

    socket.on('updateQuery', (updatedQuery: ParentQuery) => {
      setQueries(prev => prev.map(q => (q._id === updatedQuery._id || q.id === updatedQuery.id) ? updatedQuery : q))
    })

    socket.on('updateAdmission', (updatedAdmission: AdmissionApplication) => {
      setAdmissions(prev => prev.map(a => (a._id === updatedAdmission._id || a.id === updatedAdmission.id) ? updatedAdmission : a))
    })

    socket.on('deleteQuery', (data: { id: string }) => {
      setQueries(prev => prev.filter(q => q._id !== data.id && q.id !== data.id))
    })

    socket.on('deleteAdmission', (data: { id: string }) => {
      setAdmissions(prev => prev.filter(a => a._id !== data.id && a.id !== data.id))
    })

    socket.on('newStaff', (newStaffMember: StaffMember) => {
      console.log('Real-Time Context: Received newStaff payload')
      setStaff(prev => {
        const exists = prev.some(s => s._id === newStaffMember._id || s.id === newStaffMember.id)
        if (exists) return prev
        return [newStaffMember, ...prev]
      })
      addLocalNotification({
        title: 'New Staff Member Onboarded',
        message: `${newStaffMember.name} joined as ${newStaffMember.position}`,
        type: 'success'
      })
    })

    socket.on('updateStaff', (updatedStaff: StaffMember) => {
      setStaff(prev => prev.map(s => (s._id === updatedStaff._id || s.id === updatedStaff.id) ? updatedStaff : s))
    })

    socket.on('deleteStaff', (data: { id: string }) => {
      setStaff(prev => prev.filter(s => s._id !== data.id && s.id !== data.id))
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  // Compatibility Wrappers for Legacy Synchronous local UI Actions (If still used)
  const addStaff = (member: Omit<StaffMember, 'id'>) => setStaff(prev => [...prev, { ...member, id: Date.now().toString() }])
  const updateStaff = (id: string, member: Omit<StaffMember, 'id'>) => setStaff(prev => prev.map(s => (s.id === id || s._id === id ? { ...member, id } : s)))
  const deleteStaff = (id: string) => setStaff(prev => prev.filter(s => s.id !== id && s._id !== id))

  const addAdmission = (app: Partial<AdmissionApplication> & Omit<AdmissionApplication, 'id'>) => setAdmissions(prev => {
    const exists = prev.some(a => (app._id && a._id === app._id) || (app.id && a.id === app.id))
    if (exists) return prev
    return [{ ...app, id: app.id || Date.now().toString() } as AdmissionApplication, ...prev]
  })
  const updateAdmission = (id: string, app: Omit<AdmissionApplication, 'id'>) => setAdmissions(prev => prev.map(a => (a.id === id || a._id === id ? { ...app, id } : a)))
  const deleteAdmission = (id: string) => setAdmissions(prev => prev.filter(a => a.id !== id && a._id !== id))

  const addQuery = (query: Partial<ParentQuery> & Omit<ParentQuery, 'id'>) => setQueries(prev => {
    const exists = prev.some(q => (query._id && q._id === query._id) || (query.id && q.id === query.id))
    if (exists) return prev
    return [{ ...query, id: query.id || Date.now().toString() } as ParentQuery, ...prev]
  })
  const updateQuery = (id: string, query: Omit<ParentQuery, 'id'>) => setQueries(prev => prev.map(q => (q.id === id || q._id === id ? { ...query, id } : q)))
  const deleteQuery = (id: string) => setQueries(prev => prev.filter(q => q.id !== id && q._id !== id))

  return (
    <DataContext.Provider value={{
      staff, addStaff, updateStaff, deleteStaff,
      admissions, addAdmission, updateAdmission, deleteAdmission,
      queries, addQuery, updateQuery, deleteQuery,
      notifications, markNotificationRead, markAllRead
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData must be used within a DataProvider')
  return context
}
