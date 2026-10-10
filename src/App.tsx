import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { ProtectedRoute, SuperAdminRoute } from "./components/ProtectedRoute";
import { AdminLayout } from "./layouts/AdminLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { CategoriesPage } from "./pages/CategoriesPage";
import { SubcategoriesPage } from "./pages/SubcategoriesPage";
import { UsersPage } from "./pages/UsersPage";
import { ServicesPage } from "./pages/ServicesPage";
import { SettingsPage } from "./pages/SettingsPage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Page at / */}
        <Route path="/" element={<LoginPage />} />

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
