import { Route, Routes } from "react-router";
import LoginPage from "./features/auth/login-page";
import DashboardPage from "./features/dashboard/dashboard-page";
import RegisterPage from "./features/auth/register-page";
import ProtectedRoute from "./components/protected-routes";
import PromotePage from "./features/companies/promote-page";
import CompaniesPage from "./features/companies/companies-page";
import DocumentsPage from "./features/documents/document-page";
import ChatPage from "./features/chat/chat-page";
import CompanyUsersPage from "./features/companies/company-user-page";
import HomePage from "./components/home-page";


function App() {
  return (
    <Routes>
      <Route path='/' element={<HomePage/>}/>
      <Route path='/login' element={<LoginPage/>}/>
      <Route path="/register" element={<RegisterPage />} />
      <Route 
          path='/dashboard' 
          element={<ProtectedRoute><DashboardPage/></ProtectedRoute>}
        />
        <Route path="/documents" element={
          <ProtectedRoute requireCompany><DocumentsPage /></ProtectedRoute>
          } 
        />
        <Route path="/chat" element={
          <ProtectedRoute requireCompany><ChatPage /></ProtectedRoute>
          } 
        />
        <Route path="/companies" element={
          <ProtectedRoute allowedRoles={["superadmin"]}><CompaniesPage /></ProtectedRoute>
          } 
        />
        <Route path="/promote" element={
          <ProtectedRoute allowedRoles={["superadmin"]}><PromotePage /></ProtectedRoute>
          } 
        />
        <Route
          path="/company-users"
          element={<ProtectedRoute allowedRoles={["company_admin"]}><CompanyUsersPage /></ProtectedRoute>}
        />  
    </Routes>
  )
}

export default App