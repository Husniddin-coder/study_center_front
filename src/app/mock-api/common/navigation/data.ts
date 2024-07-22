/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id: 'dashboards',
        title: 'Dashboards',
        type: 'group',
        icon: 'heroicons_outline:home',
        children: [
            {
                id: 'dashboards.students',
                title: 'Students',
                type: 'basic',
                icon: 'heroicons_outline:users',
                link: '/dashboards/students',
                permissions: [1300]
            },
            {
                id: 'dashboards.teachers',
                title: 'Teachers',
                type: 'basic',
                icon: 'heroicons_outline:users',
                link: '/dashboards/teachers',
                permissions: []
            },

        ]
    },
];
export const compactNavigation: FuseNavigationItem[] = defaultNavigation;
export const futuristicNavigation: FuseNavigationItem[] = defaultNavigation;
export const horizontalNavigation: FuseNavigationItem[] = defaultNavigation;
