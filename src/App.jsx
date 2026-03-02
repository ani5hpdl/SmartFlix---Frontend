import './App.css'
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Test from './pages/Test'
import { Toaster } from 'react-hot-toast'
import Verify from './pages/Verify'
import UserDashboard from './pages/UserDashboard'
import UserManagement from './pages/UserManagement'
import MovieLibrary from './pages/MovieManagement'
import Dashboard from './pages/Dashboard'
import MovieDetails from './pages/MovieDetails'
import Watchlist from './pages/Watchlist'
import Recommendations from './pages/Recommendations'
import ReviewManagement from './pages/ReviewManagement'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import ProtectedRoute from './protected/ProtectedRoute'
import { getUserRole } from './protected/Auth'
import Navbar from './components/NavBar'
import Footer from './components/Footer'

const PublicRoute = ({ element }) => {
  const role = getUserRole()

  if (role === 'admin') {
    return <Navigate to="/admin/users" replace />
  }

  if (role === 'user') {
    return <Navigate to="/dashboard" replace />
  }

  return element
}

const UserLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#0a0e17] text-white flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

const withUserLayout = (element) => <UserLayout>{element}</UserLayout>

function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Public routes */}
        <Route path="/login" element={<PublicRoute element={<Login />} />} />
        <Route path="/signup" element={<PublicRoute element={<Signup />} />} />
        <Route path="/verify/:token" element={<Verify />} />
        <Route path="/test" element={<Test />} />

        {/* User routes */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute allowedRoles={['user', 'admin']} element={<Dashboard />} />}
        />
        <Route
          path="/explore"
          element={<ProtectedRoute allowedRoles={['user', 'admin']} element={withUserLayout(<UserDashboard />)} />}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute allowedRoles={['user', 'admin']} element={withUserLayout(<Profile />)} />}
        />
        <Route
          path="/movie/:id"
          element={<ProtectedRoute allowedRoles={['user', 'admin']} element={withUserLayout(<MovieDetails />)} />}
        />
        <Route
          path="/watchlist"
          element={<ProtectedRoute allowedRoles={['user', 'admin']} element={withUserLayout(<Watchlist />)} />}
        />
        <Route
          path="/recommendations"
          element={<ProtectedRoute allowedRoles={['user', 'admin']} element={withUserLayout(<Recommendations />)} />}
        />

        {/* Admin routes */}
        <Route
          path="/admin/users"
          element={<ProtectedRoute allowedRoles={['admin']} element={<UserManagement />} />}
        />
        <Route
          path="/admin/movies"
          element={<ProtectedRoute allowedRoles={['admin']} element={<MovieLibrary />} />}
        />
        <Route
          path="/admin/reviews"
          element={<ProtectedRoute allowedRoles={['admin']} element={<ReviewManagement />} />}
        />

        {/* Legacy path redirects */}
        <Route path="/dash" element={<Navigate to="/dashboard" replace />} />
        <Route path="/userdash" element={<Navigate to="/explore" replace />} />
        <Route path="/admindash" element={<Navigate to="/admin/users" replace />} />
        <Route path="/moviedash" element={<Navigate to="/admin/movies" replace />} />
        <Route path="/reviewdash" element={<Navigate to="/admin/reviews" replace />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App
