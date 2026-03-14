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
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [admissions, setAdmissions] = useState<AdmissionApplication[]>([])
  const [queries, setQueries] = useState<ParentQuery[]>([])

  useEffect(() => {
    // 1. Initial REST API Fetch
    const fetchInitialData = async () => {
      try {
        const [staffRes, admissionsRes, queriesRes] = await Promise.all([
          fetch(`${API_URL}/staff`).catch(e => { console.warn('Staff fetch failed', e); return null }),
          fetch(`${API_URL}/admissions`).catch(e => { console.warn('Admissions fetch failed', e); return null }),
          fetch(`${API_URL}/queries`).catch(e => { console.warn('Queries fetch failed', e); return null })
        ])

        if (staffRes?.ok) {
          const staffData = await staffRes.json()
          if (Array.isArray(staffData)) setStaff(staffData)
        }
        if (admissionsRes?.ok) {
          const admissionsData = await admissionsRes.json()
          if (Array.isArray(admissionsData)) setAdmissions(admissionsData)
        }
        if (queriesRes?.ok) {
          const queriesData = await queriesRes.json()
          if (Array.isArray(queriesData)) setQueries(queriesData)
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
    })

    socket.on('newAdmission', (newAdmission: AdmissionApplication) => {
      console.log('Real-Time Context: Received newAdmission payload from quantum link')
      setAdmissions(prev => {
        const exists = prev.some(a => a._id === newAdmission._id || a.id === newAdmission.id)
        if (exists) return prev
        return [newAdmission, ...prev]
      })
    })

    socket.on('updateQuery', (updatedQuery: ParentQuery) => {
      setQueries(prev => prev.map(q => (q._id === updatedQuery._id || q.id === updatedQuery.id) ? updatedQuery : q))
    })

    socket.on('updateAdmission', (updatedAdmission: AdmissionApplication) => {
      setAdmissions(prev => prev.map(a => (a._id === updatedAdmission._id || a.id === updatedAdmission.id) ? updatedAdmission : a))
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
