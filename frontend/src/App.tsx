import { Navigate, Route, Routes } from "react-router";
import LoginPage from "./features/auth/login-page";
import DashboardPage from "./features/dashboard/dashboard-page";
import RegisterPage from "./features/auth/register-page";
import ProtectedRoute from "./components/protected-routes";
import { MeProvider } from "./components/me-provider";
import HomePage from "./components/home-page";


function App() {
  return (
    <MeProvider>
    <Routes>
      <Route path='/' element={<HomePage/>}/>
      <Route path='/login' element={<LoginPage/>}/>
      <Route path="/register" element={<RegisterPage />} />
      <Route 
          path='/dashboard' 
          element={<ProtectedRoute><DashboardPage/></ProtectedRoute>}
        />
        <Route path="/documents" element={
          <ProtectedRoute requireCompany><Navigate to="/dashboard?tab=documents" replace /></ProtectedRoute>
          } 
        />
        <Route path="/chat" element={
          <ProtectedRoute requireCompany><Navigate to="/dashboard" replace /></ProtectedRoute>
          } 
        />
        <Route path="/companies" element={
          <ProtectedRoute allowedRoles={["superadmin"]}><Navigate to="/dashboard?tab=companies" replace /></ProtectedRoute>
          } 
        />
        <Route path="/promote" element={
          <ProtectedRoute allowedRoles={["superadmin"]}><Navigate to="/dashboard?tab=promote" replace /></ProtectedRoute>
          } 
        />
        <Route
          path="/company-users"
          element={<ProtectedRoute allowedRoles={["company_admin"]}><Navigate to="/dashboard?tab=users" replace /></ProtectedRoute>}
        />  
    </Routes>
    </MeProvider>
  )
}

export default App
