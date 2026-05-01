import { Route, Routes } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import ProtectedRoute from "./ProtectedRoute";
import { ROLES } from "../utils/constants";

import HomePage from "../pages/public/HomePage";
import JobsPage from "../pages/public/JobsPage";
import JobDetailPage from "../pages/public/JobDetailPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterChoicePage from "../pages/auth/RegisterChoicePage";
import RegisterPage from "../pages/auth/RegisterPage";
import InstitutionDetailPage from "../pages/public/InstitutionDetailPage";
import InstitutionJobPostingsPage from "../pages/public/InstitutionJobPostingsPage";
import ProfessorDetailPage from "../pages/public/ProfessorDetailPage";
import VerifyEmailCodePage from "../pages/auth/VerifyEmailCodePage";
import NotFoundPage from "../pages/notFound/NotFoundPage";
import SuggestionsPage from "../pages/suggestions/SuggestionsPage";

import ProfessorDashboardPage from "../pages/professor/ProfessorDashboardPage";
import ProfessorProfilePage from "../pages/professor/ProfessorProfilePage";
import ProfessorApplicationsPage from "../pages/professor/ProfessorApplicationsPage";
import ProfessorNotificationsPage from "../pages/professor/ProfessorNotificationsPage";
import ApplicationDetailPage from "../pages/professor/ApplicationDetailPage";
import SavedJobPostingsPage from "../pages/professor/SavedJobPostingsPage";
import InstitutionsPage from "../pages/professor/InstitutionsPage";
import ProfessorFavoriteInstitutionsPage from "../pages/professor/ProfessorFavoriteInstitutionsPage";

import InstitutionDashboardPage from "../pages/institution/InstitutionDashboardPage";
import InstitutionJobsPage from "../pages/institution/InstitutionJobsPage";
import InstitutionCreateJobPage from "../pages/institution/InstitutionCreateJobPage";
import InstitutionProfilePage from "../pages/institution/InstitutionProfilePage";
import InstitutionNotificationsPage from "../pages/institution/InstitutionNotificationsPage";
import JobPostingApplicationsPage from "../pages/institution/JobPostingApplicationsPage";
import InstitutionProfessorsPage from "../pages/institution/InstitutionProfessorsPage";
import InstitutionApplicationsPage from "../pages/institution/InstitutionApplicationsPage";

import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";

function AppRoutes() {
  const authenticatedRoles = [ROLES.PROFESSOR, ROLES.INSTITUTION, ROLES.ADMIN];

  return (
    <AppLayout>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterChoicePage />} />
        <Route path="/register/:type" element={<RegisterPage />} />
        <Route path="/verify-email-code" element={<VerifyEmailCodePage />} />
        <Route path="/sugerencias" element={<SuggestionsPage />} />

        {/* 
          Rutas privadas compartidas.
          Solo usuarios logueados pueden ver:
          - vacantes
          - detalle de vacante
          - perfiles de profesores
          - perfiles de instituciones
          - vacantes de una institución
        */}
        <Route element={<ProtectedRoute allowedRoles={authenticatedRoles} />}>
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/professors/:id" element={<ProfessorDetailPage />} />
          <Route path="/institutions/:id" element={<InstitutionDetailPage />} />
          <Route
            path="/institutions/:id/jobs"
            element={<InstitutionJobPostingsPage />}
          />
        </Route>

        {/* Rutas privadas del profesor */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.PROFESSOR]} />}>
          <Route path="/professor" element={<ProfessorDashboardPage />} />
          <Route path="/professor/profile" element={<ProfessorProfilePage />} />
          <Route path="/jobs" element={<JobsPage />} />

          <Route
            path="/professor/applications"
            element={<ProfessorApplicationsPage />}
          />

          <Route
            path="/professor/applications/:id"
            element={<ApplicationDetailPage />}
          />

          <Route
            path="/professor/notifications"
            element={<ProfessorNotificationsPage />}
          />

          <Route
            path="/professor/saved-jobs"
            element={<SavedJobPostingsPage />}
          />

          <Route
            path="/professor/institutions"
            element={<InstitutionsPage />}
          />

          <Route
            path="/professor/favorite-institutions"
            element={<ProfessorFavoriteInstitutionsPage />}
          />
        </Route>

        {/* Rutas privadas de la institución */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.INSTITUTION]} />}>
          <Route path="/institution" element={<InstitutionDashboardPage />} />

          <Route path="/institution/jobs" element={<InstitutionJobsPage />} />

          <Route
            path="/institution/jobs/new"
            element={<InstitutionCreateJobPage />}
          />
          <Route
            path="/institution/applications"
            element={<InstitutionApplicationsPage />}
          />

          <Route
            path="/institution/profile"
            element={<InstitutionProfilePage />}
          />

          <Route
            path="/institution/notifications"
            element={<InstitutionNotificationsPage />}
          />

          <Route
            path="/institution/job-postings/:id/applications"
            element={<JobPostingApplicationsPage />}
          />

          <Route
            path="/institution/professors"
            element={<InstitutionProfessorsPage />}
          />

          <Route
            path="/institution/job-postings/:jobPostingId/applications/:applicationId"
            element={<ApplicationDetailPage />}
          />
        </Route>

        {/* Rutas privadas del administrador */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/jobs" element={<JobsPage />} />
        </Route>

        {/* Ruta no encontrada */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppLayout>
  );
}

export default AppRoutes;
