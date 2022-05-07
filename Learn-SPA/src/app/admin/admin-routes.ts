import { Routes } from '@angular/router';
import { AdminAuthGuard } from '../guards/admin-auth.guard';
import { AdminLoginGuard } from '../guards/admin-login.guard';

export const AdminRoutes: Routes = [
    {
        path: 'scl-admin/login',
        canActivate: [AdminLoginGuard],
        loadChildren: () => import('./modules/admin-login/admin-login.module')
            .then(mod => mod.AdminLoginModule)
    },
    {
        path: 'scl-admin/avatars',
        canActivate: [AdminAuthGuard],
        loadChildren: () => import('./modules/admin-avatars/admin-avatars.module')
            .then(mod => mod.AdminAvatarsModule)
    },
    {
        path: 'scl-admin/subjects',
        canActivate: [AdminAuthGuard],
        loadChildren: () => import('./modules/admin-subjects/admin-subjects.module')
            .then(mod => mod.AdminSubjectsModule)
    },
    {
        path: 'scl-admin/learning-paths',
        canActivate: [AdminAuthGuard],
        loadChildren: () => import('./modules/admin-learning-paths/admin-learning-paths.module')
            .then(mod => mod.AdminLearningPathsModule)
    },
    {
        path: 'scl-admin',
        canActivate: [AdminAuthGuard],
        loadChildren: () => import('./modules/admin-dashboard/admin-dashboard.module')
            .then(mod => mod.AdminDashboardModule)
    }
];
