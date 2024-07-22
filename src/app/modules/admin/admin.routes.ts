import { Routes } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';

export default [
    {
        path: 'account',
        canActivate: [AuthGuard],
        data: { permissions: [1201] },
        loadChildren: () => import('./account/account.routes').then(m => m.AccountRoutes)
    },
    {
        path: 'students',
        canActivate: [AuthGuard],
        data: { permissions: [1300] },
        loadChildren: () => import('./student/student.routes').then((x) => x.StudentRoutes)
    },
] as Routes;
