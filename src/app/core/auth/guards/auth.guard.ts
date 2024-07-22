import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { of, switchMap } from 'rxjs';
import { AuthUtils } from '../auth.utils';

export const AuthGuard: CanActivateFn | CanActivateChildFn = (route, state) => {

    const router: Router = inject(Router);
    const authService: AuthService = inject(AuthService)


    // Check the authentication status
    return authService.check().pipe(
        switchMap((authenticated) => {
            const permissions = route.data['permissions'] as string[]
            // console.log('from router: ', permissions);

            const routeName = route.data['name'] as string
            // console.log('routName: ', routeName);

            // If the user is not authenticated...
            if (!authenticated) {
                // Redirect to the sign-in page with a redirectUrl param
                const redirectURL = state.url === '/sign-out' ? '' : `redirectURL=${state.url}`;
                const urlTree = router.parseUrl(`sign-in?${redirectURL}`);

                return of(urlTree);
            }

            if (!authService.checkPermission(permissions)) {
                // router.navigate(['/sign-in'])
                return of(false);
            }

            // Allow the access
            return of(true);
        }),
    );
};
