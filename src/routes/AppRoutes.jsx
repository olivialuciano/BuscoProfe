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

import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";

function AppRoutes() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterChoicePage />} />
        <Route path="/register/:type" element={<RegisterPage />} />
        <Route path="/institutions/:id" element={<InstitutionDetailPage />} />
        <Route path="/verify-email-code" element={<VerifyEmailCodePage />} />
        <Route
          path="/institutions/:id/jobs"
          element={<InstitutionJobPostingsPage />}
        />
        <Route path="/professors/:id" element={<ProfessorDetailPage />} />

        <Route element={<ProtectedRoute allowedRoles={[ROLES.PROFESSOR]} />}>
          <Route path="/professor" element={<ProfessorDashboardPage />} />
          <Route path="/professor/profile" element={<ProfessorProfilePage />} />
          <Route
            path="/professor/applications"
            element={<ProfessorApplicationsPage />}
          />

          <Route
            path="/professor/notifications"
            element={<ProfessorNotificationsPage />}
          />
          <Route
            path="/professor/applications/:id"
            element={<ApplicationDetailPage />}
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

        <Route element={<ProtectedRoute allowedRoles={[ROLES.INSTITUTION]} />}>
          <Route path="/institution" element={<InstitutionDashboardPage />} />
          <Route path="/institution/jobs" element={<InstitutionJobsPage />} />
          <Route
            path="/institution/jobs/new"
            element={<InstitutionCreateJobPage />}
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

        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
        </Route>
      </Routes>
    </AppLayout>
  );
}

export default AppRoutes;
