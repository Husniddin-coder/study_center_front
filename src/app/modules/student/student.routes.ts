import { Routes } from '@angular/router';
import { StudentComponent } from '../admin/student/student.component';

export default [
    {
        path: '',
        component: StudentComponent,
        children: [],
    },
] as Routes;