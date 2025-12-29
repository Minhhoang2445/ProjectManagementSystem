import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { Toaster } from "sonner";

import SignInPage from "./pages/auth/SignInPage";
import { ProtectedRoute } from "./pages/Route.tsx/ProtectedRoute.tsx";
import { RoleRoute } from "./pages/Route.tsx/RoleRoute.tsx";

import AdminLayout from "./layout/AdminLayout";
import StaffLayout from "./layout/StaffLayout";

import DashboardPage from "./pages/admin/DashboardPage.tsx";
import UsersPage from "./pages/admin/Admin_UsersPage.tsx";
import ProjectPage from "./pages/admin/ProjectPage.tsx";

import StaffHomePage from "./pages/staff/StaffHomePage.tsx";
import MyTasksPage from "./pages/staff/MyTasksPage.tsx";
import SignUpPage from "./pages/auth/SignUpPage.tsx";
import StaffProfilePage from "./pages/staff/StaffProfilePage.tsx";
import ProjectListPage from "./pages/admin/ProjectListPage.tsx";
import CreateProjectPage from "./pages/admin/CreateProjectPage.tsx";
import ProjectDetailPage from "./pages/admin/ProjectDetailPage.tsx";
import ProjectKanban from "./components/project/ProjectKanban.tsx";
import ProjectMembers from "./components/project/ProjectMembers.tsx";
import ProjectOverview from "./components/project/ProjectOverview.tsx";
import AdminProfilePage from "./pages/admin/AdminProfilePage.tsx";
import TaskSummary from "./components/task/TaskSummary.tsx";
import TaskList from "./components/task/TaskList.tsx";
import ProjectTasksLayout from "./components/task/ProjectTasksLayout.tsx";
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
                  <Route path="profile" element={<AdminProfilePage />} />
                  <Route path="users" element={<UsersPage />} />
                  <Route path="projects">
                    <Route index element={<ProjectPage />} />
                    <Route path="list" element={<ProjectListPage />} />
                    <Route path="create" element={<CreateProjectPage />} />
                    {/* PROJECT DETAIL */}
                    <Route path=":projectId" element={<ProjectDetailPage />}>
                      <Route
                        index
                        element={<Navigate to="overview" replace />}
                      />

                      <Route path="overview" element={<ProjectOverview />} />
                      <Route path="tasks" element={<ProjectTasksLayout />}>
                        <Route
                          index
                          element={<Navigate to="summary" replace />}
                        />
                        <Route path="summary" element={<TaskSummary />} />
                        <Route path="board" element={<ProjectKanban />} />
                        <Route path="list" element={<TaskList />} />
                      </Route>
                      <Route path="members" element={<ProjectMembers />} />
                      {/* CÁC TAB KHÁC */}
                      {/* <Route path="tasks" element={<ProjectKanban />} />
                    <Route path="members" element={<ProjectMembers />} /> */}
                      {/* <Route path="settings" element={<ProjectSettings />} /> */}
                    </Route>
                  </Route>
                </Route>
              </Route>

              {/* USER */}
              <Route element={<RoleRoute role="user" />}>
                <Route path="/user" element={<StaffLayout />}>
                  <Route index element={<StaffHomePage />} />

                  <Route path="spaces" >
                    <Route path=":projectId" element={<MyTasksPage />}>
                    <Route
                      index
                      element={<Navigate to="summary" replace />}
                    />
                    
                    <Route path="summary" element={<TaskSummary />} />
                    <Route path="board" element={<ProjectKanban />} />
                    <Route path="list" element={<TaskList />} />
                  </Route>
                  </Route>

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