import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { CreatorSignUpPage } from "./pages/CreatorSignUpPage";
import { ProtectedRoute, SuperAdminRoute } from "./components/ProtectedRoute";
import { AdminLayout } from "./layouts/AdminLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { CategoriesPage } from "./pages/CategoriesPage";
import { SubcategoriesPage } from "./pages/SubcategoriesPage";
import { UsersPage } from "./pages/UsersPage";
import { ServicesPage } from "./pages/ServicesPage";
import { PendingServicesPage } from "./pages/PendingServicesPage";
import { SettingsPage } from "./pages/SettingsPage";
import { NotificationsPage } from "./pages/NotificationsPage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login & Creator Sign-Up Pages */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/creator-sign-up" element={<CreatorSignUpPage />} />
        <Route path="/creator-signup" element={<Navigate to="/creator-sign-up" replace />} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* Exclusive Super Admin Routes (Hidden & Blocked for Creator) */}
            <Route element={<SuperAdminRoute />}>
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/subcategories" element={<SubcategoriesPage />} />
              <Route path="/pending-services" element={<PendingServicesPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
