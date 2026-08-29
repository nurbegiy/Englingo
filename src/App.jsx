import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './routes/ProtectedRoute.jsx'

import AuthPage from './pages/auth/AuthPage.jsx'
import PlacementTestPage from './pages/PlacementTestPage.jsx'

import HomePage from './pages/student/HomePage.jsx'
import LearnHomePage from './pages/student/LearnHomePage.jsx'
import ActivityRunnerPage from './pages/student/ActivityRunnerPage.jsx'
import LeaderboardPage from './pages/student/LeaderboardPage.jsx'
import ShopPage from './pages/student/ShopPage.jsx'
import ProfilePage from './pages/student/ProfilePage.jsx'
import UserProfilePage from './pages/student/UserProfilePage.jsx'

import TeacherDashboardPage from './pages/teacher/TeacherDashboardPage.jsx'
import GroupDetailPage from './pages/teacher/GroupDetailPage.jsx'
import TeacherProfilePage from './pages/teacher/TeacherProfilePage.jsx'

import AdminLayout from './pages/admin/AdminLayout.jsx'
import DashboardPage from './pages/admin/DashboardPage.jsx'
import BranchesPage from './pages/admin/BranchesPage.jsx'
import StudentsPage from './pages/admin/StudentsPage.jsx'
import TeachersPage from './pages/admin/TeachersPage.jsx'
import GroupsPage from './pages/admin/GroupsPage.jsx'
import ShopAdminPage from './pages/admin/ShopAdminPage.jsx'
import StatisticsPage from './pages/admin/StatisticsPage.jsx'
import SettingsPage from './pages/admin/SettingsPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth" replace />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/placement-test" element={<ProtectedRoute><PlacementTestPage /></ProtectedRoute>} />

      <Route path="/app/home" element={<ProtectedRoute role="student"><HomePage /></ProtectedRoute>} />
      <Route path="/app/learn" element={<ProtectedRoute role="student"><LearnHomePage /></ProtectedRoute>} />
      <Route path="/app/learn/:category" element={<ProtectedRoute role="student"><ActivityRunnerPage /></ProtectedRoute>} />
      <Route path="/app/leaderboard" element={<ProtectedRoute role="student"><LeaderboardPage /></ProtectedRoute>} />
      <Route path="/app/shop" element={<ProtectedRoute role="student"><ShopPage /></ProtectedRoute>} />
      <Route path="/app/profile" element={<ProtectedRoute role="student"><ProfilePage /></ProtectedRoute>} />
      <Route path="/app/users/:username" element={<ProtectedRoute role="student"><UserProfilePage /></ProtectedRoute>} />

      <Route path="/teacher/dashboard" element={<ProtectedRoute role="teacher"><TeacherDashboardPage /></ProtectedRoute>} />
      <Route path="/teacher/groups" element={<Navigate to="/teacher/dashboard" replace />} />
      <Route path="/teacher/groups/:id" element={<ProtectedRoute role="teacher"><GroupDetailPage /></ProtectedRoute>} />
      <Route path="/teacher/profile" element={<ProtectedRoute role="teacher"><TeacherProfilePage /></ProtectedRoute>} />

      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="branches" element={<BranchesPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="teachers" element={<TeachersPage />} />
        <Route path="groups" element={<GroupsPage />} />
        <Route path="shop" element={<ShopAdminPage />} />
        <Route path="statistics" element={<StatisticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  )
}
