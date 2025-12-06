import { BrowserRouter, Route, Routes } from "react-router";
import { Toaster } from "sonner";

import SignInPage from "./pages/auth/SignInPage";
import { ProtectedRoute } from "./pages/ProtectedRoute";
import { RoleRoute } from "./pages/RoleRoute";

import AdminLayout from "./layout/AdminLayout";
import StaffLayout from "./layout/StaffLayout";

import DashboardPage from "./pages/admin/DashboardPage.tsx";
import UsersPage from "./pages/admin/Admin_UsersPage.tsx";

import StaffHomePage from "./pages/staff/StaffHomePage.tsx";
import MyTasksPage from "./pages/staff/MyTasksPage.tsx";
import SignUpPage from "./pages/auth/SignUpPage.tsx";
import StaffProfilePage from "./pages/staff/StaffProfilePage.tsx";
function App() {
  return (
    <>
      <Toaster richColors />
      <BrowserRouter>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          {/* PROTECTED ROUTES */}
          <Route element={<ProtectedRoute />}>
            {/* ADMIN */}
            
            <Route element={<RoleRoute role="admin" />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="users" element={<UsersPage />} />
              </Route>
            </Route>

            {/* USER */}
            <Route element={<RoleRoute role="user" />}>
              <Route path="/user" element={<StaffLayout />}>
                <Route index element={<StaffHomePage />} />
                <Route path="tasks" element={<MyTasksPage />} />
                <Route path="profile" element={<StaffProfilePage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
