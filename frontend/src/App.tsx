import { Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { ProtectedRoute } from './routes/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Goals from './pages/Goals'
import GoalDetail from './pages/GoalDetail'
import Roadmap from './pages/Roadmap'
import Conversations from './pages/Conversations'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppShell>
              <Dashboard />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/goals"
        element={
          <ProtectedRoute>
            <AppShell>
              <Goals />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/goals/:goalId"
        element={
          <ProtectedRoute>
            <AppShell>
              <GoalDetail />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/goals/:goalId/roadmap"
        element={
          <ProtectedRoute>
            <AppShell>
              <Roadmap />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/conversations"
        element={
          <ProtectedRoute>
            <AppShell>
              <Conversations />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/conversations/:conversationId"
        element={
          <ProtectedRoute>
            <AppShell>
              <Conversations />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
