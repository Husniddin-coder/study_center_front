import { useAnimation } from '@angular/animations';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ChangeDetectorRef, Injectable, inject } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { tags } from 'app/mock-api/apps/contacts/data';
import { user } from 'app/mock-api/common/user/data';
import { BaseService } from 'app/modules/admin/shared/services/base.service';
import { catchError, Observable, of, switchMap, throwError, take } from 'rxjs';

export interface RefreshAndExpiredDate {
    refreshToken: string
    expiredDate: string
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private _authenticated: boolean = false;
    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService,
        private base$: BaseService

    ) {
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */

    set rememberMe(rememberMe: boolean) {
        localStorage.setItem('rememberMe', rememberMe.toString())
    }

    get rememberMe(): boolean {
        return localStorage.getItem('rememberMe') === 'true'
    }

    set accessToken(token: string) {
        this.rememberMe == true ? localStorage.setItem('accessToken', token) :
            sessionStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        if (this.rememberMe)
            return localStorage.getItem('accessToken')

        return sessionStorage.getItem('accessToken');
    }

    set refreshTokenAndExpiredDate(refresh: RefreshAndExpiredDate) {
        this.rememberMe == true ? localStorage.setItem('refreshToken', JSON.stringify(refresh))
            : sessionStorage.setItem('refreshToken', JSON.stringify(refresh))
    }

    get refreshTokenAndExpiredDate(): RefreshAndExpiredDate {
        if (this.rememberMe)
            return JSON.parse(localStorage.getItem('refreshToken'));

        return JSON.parse(sessionStorage.getItem('refreshToken'));
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any> {
        return this._httpClient.post(`https://localhost:7298/api/Account/ForgotPassword?email=${email}`, "");
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: any, header: any): Observable<boolean> {
        return this._httpClient.post<boolean>(`https://localhost:7298/api/Account/ResetPassword?password=${password}`, '', { headers: header });
    }

    /**
     * Email Confirmation
     */
    verifyEamil(email: string, code: string) {
        return this._httpClient.post<boolean>('https://localhost:7298/api/Email/VerifyEmail', { email, code });
    }

    /**
     * Resend Email Code
     */
    resendCode(email: string) {
        return this._httpClient.post<boolean>(`https://localhost:7298/api/Email/SendCode?email=${email}`, "");
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { email: string; password: string; rememberMe: boolean }): Observable<any> {
        // Throw error, if the user is already logged in
        if (this._authenticated) {
            return throwError('User is already logged in.');
        }

        return this._httpClient.post('https://localhost:7298/api/Account/SignIn', credentials).pipe(
            take(1),
            switchMap((response: any) => {
                // Store the access token in the local storage

                this.rememberMe = response.rememberMe;
                this.accessToken = response.accessToken;
                this.refreshTokenAndExpiredDate = { refreshToken: response.refreshToken, expiredDate: response.expiredDate }

                // Set the authenticated flag to true
                this._authenticated = true;

                // Store the user on the user service
                this._userService.user = response.user;

                // Return a new observable with the response
                return of(response);
            }),
        );
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any> {
        // Sign in using the token
        return this._httpClient.post('https://localhost:7298/api/Account/RefreshToken', {
            accessToken: this.accessToken,
            refreshToken: this.refreshTokenAndExpiredDate.refreshToken,
            expiredDate: this.refreshTokenAndExpiredDate.expiredDate
        }).pipe(
            take(1),
            catchError(() =>
                // Return false
                of(false),
            ),
            switchMap((response: any) => {
                // Replace the access token with the new one if it's available on
                // the response object.
                //
                // This is an added optional step for better security. Once you sign
                // in using the token, you should generate a new one on the server
                // side and attach it to the response object. Then the following
                // piece of code can replace the token with the refreshed one.
                if (response.accessToken) {
                    this.accessToken = response.accessToken;
                    this.refreshTokenAndExpiredDate = { refreshToken: response.refreshToken, expiredDate: response.expiredDate }
                }

                // Set the authenticated flag to true
                this._authenticated = true;

                // Store the user on the user service
                this._userService.user = response.user;

                // Return true
                return of(true);
            }),
        );
    }

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        // Remove the access token from the local storage
        if (localStorage.getItem('rememberMe') !== 'true') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('rememberMe');
        }
        sessionStorage.removeItem('accessToken')
        sessionStorage.removeItem('refreshToken')


        console.log('signout is working...');


        // Set the authenticated flag to false
        this._authenticated = false;
        // Return the observable
        return of(true);
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: { userName: string; email: string; password: string; company: string }): Observable<any> {

        return this._httpClient.post<boolean>('https://localhost:7298/api/Account/Register', user);
    }

    /**
     * pre-check new user
     */
    IsUserExist(email: string) {
        return this._httpClient.post<boolean>(`https://localhost:7298/api/User/IsUserExist?email=${email}`, "")
    }
    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: { email: string; password: string }): Observable<any> {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean> {
        // Check if the user is logged in
        const expiredDate = new Date(this.refreshTokenAndExpiredDate?.expiredDate);
        const now = Date.now();

        if (expiredDate.getTime() < now) {
            this.signInUsingToken()
            return of(false);
        }

        // Check the access token availability
        if (!this.accessToken) {
            return of(false);
        }

        // Check the access token expire date
        if (!AuthUtils.isTokenExpired(this.accessToken)) {
            this._authenticated = true;
            this._userService.get().subscribe()
            return of(true);
        }

        if (!this._authenticated) {
            return of(false);
        }

        return of(true)
        // If the access token exists, and it didn't expire, sign in using it
        //return this.signInUsingToken();
    }

    checkPermission(permissionsList: any) {
        let result = false
        if (permissionsList && Array.isArray(permissionsList) && permissionsList.length) {
            let userPermissions = AuthUtils.permissions

            userPermissions.forEach(p => {
                if (result) return;
                if (permissionsList.includes(p)) result = true
            })
        }
        // console.log(result);

        return result;
    }
}
