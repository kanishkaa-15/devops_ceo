'use client'

import { useState, useEffect } from 'react'
import SignupPage from '@/components/pages/SignupPage'
import LoginPage from '@/components/pages/LoginPage'
import DashboardPage from '@/components/pages/DashboardPage'
import StaffManagementPage from '@/components/pages/StaffManagementPage'
import AdmissionsManagementPage from '@/components/pages/AdmissionsManagementPage'
import ParentQueriesManagementPage from '@/components/pages/ParentQueriesManagementPage'
import AdminDashboardPage from '@/components/pages/AdminDashboardPage'
import AdminStaffPage from '@/components/pages/AdminStaffPage'
import AdminAdmissionsPage from '@/components/pages/AdminAdmissionsPage'
import AdminQueriesPage from '@/components/pages/AdminQueriesPage'
import AdminStaffManagementPage from '@/components/pages/AdminStaffManagementPage'
import StaffDashboardPage from '@/components/pages/StaffDashboardPage'
import StudentPerformancePage from '@/components/pages/StudentPerformancePage'
import ClassDetailsPage from '@/components/pages/ClassDetailsPage'
import ParentDashboardPage from '@/components/pages/ParentDashboardPage'
import { API_URL } from '@/lib/api-config'

type PageType = 'signup' | 'login' | 'dashboard' | 'staff' | 'admissions' | 'queries' | 'admin' | 'admin-staff' | 'admin-admissions' | 'admin-queries' | 'admin-staff-management' | 'staff-dashboard' | 'student-performance' | 'class-details' | 'parent-dashboard'

export default function Home() {
  const [currentPage, setCurrentPage] = useState<PageType>('login')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState({ className: 'Class 9', section: 'A' })

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const apiUrl = API_URL
      const response = await fetch(`${apiUrl}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setIsLoggedIn(true)
        // Route based on user role
        switch(userData.user.role) {
          case 'ceo':
            setCurrentPage('dashboard')
            break
          case 'admin':
            setCurrentPage('admin')
            break
          case 'staff':
            setCurrentPage('staff-dashboard')
            break
          case 'parent':
            setCurrentPage('parent-dashboard')
            break
          default:
            setCurrentPage('dashboard')
        }
      } else {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    } catch (error) {
      console.error('Authentication check failed:', error)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (user: any) => {
    setIsLoggedIn(true)
    // Route based on user role
    switch(user.role) {
      case 'ceo':
        setCurrentPage('dashboard')
        break
      case 'admin':
        setCurrentPage('admin')
        break
      case 'staff':
        setCurrentPage('staff-dashboard')
        break
      case 'parent':
        setCurrentPage('parent-dashboard')
        break
      default:
        setCurrentPage('dashboard')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    setCurrentPage('login')
  }

  const handleNavigate = (page: PageType) => {
    setCurrentPage(page)
  }

  const handleClassSelect = (className: string, section: string) => {
    setSelectedClass({ className, section })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Loading...</div>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return currentPage === 'signup' ? (
      <SignupPage onNavigateToLogin={() => setCurrentPage('login')} />
    ) : (
      <LoginPage onNavigateToSignup={() => setCurrentPage('signup')} onLogin={handleLogin} />
    )
  }

  return (
    <>
      {currentPage === 'dashboard' && <DashboardPage onLogout={handleLogout} onNavigate={handleNavigate} />}
      {currentPage === 'staff' && <StaffManagementPage onNavigate={handleNavigate} />}
      {currentPage === 'admissions' && <AdmissionsManagementPage onNavigate={handleNavigate} />}
      {currentPage === 'queries' && <ParentQueriesManagementPage onNavigate={handleNavigate} />}
      {currentPage === 'admin' && <AdminDashboardPage onNavigate={handleNavigate} onLogout={handleLogout} />}
      {currentPage === 'admin-staff' && <AdminStaffPage onNavigate={handleNavigate} />}
      {currentPage === 'admin-admissions' && <AdminAdmissionsPage onNavigate={handleNavigate} />}
      {currentPage === 'admin-queries' && <AdminQueriesPage onNavigate={handleNavigate} />}
      {currentPage === 'admin-staff-management' && <AdminStaffManagementPage onNavigate={handleNavigate} />}
      {currentPage === 'staff-dashboard' && <StaffDashboardPage onLogout={handleLogout} />}
      {currentPage === 'parent-dashboard' && <ParentDashboardPage onLogout={handleLogout} />}
      {currentPage === 'student-performance' && <StudentPerformancePage onNavigate={handleNavigate} onClassSelect={handleClassSelect} />}
      {currentPage === 'class-details' && <ClassDetailsPage onNavigate={handleNavigate} className={selectedClass.className} section={selectedClass.section} />}
    </>
  )
}
