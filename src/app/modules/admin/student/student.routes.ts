import { Route } from '@angular/router';
import { StudentComponent } from './student.component';
import { StudentListComponent } from './student-list/student-list.component';

export const StudentRoutes: Route[] = [
    {
        path: '',
        component: StudentComponent,
        children: [
            {
                path: '',
                data: {
                    permissions: [1300, 1301]
                },
                component: StudentListComponent
            },
        ]
    },
];
