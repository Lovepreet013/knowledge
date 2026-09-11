import DashboardPage from "../dashboard/dashboard-page";

// /chat renders the same chat workspace as /dashboard so existing links keep
// working. The route guard in App.tsx (requireCompany) still applies here.
export default function ChatPage() {
  return <DashboardPage />;
}
