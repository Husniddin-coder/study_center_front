import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User, UserUpdateDto } from 'app/core/user/user.types';
import { UserResponse } from 'app/modules/admin/account/models/user.model';
import { BaseService } from 'app/modules/admin/shared/services/base.service';
import { map, Observable, ReplaySubject, tap } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
    private _user: ReplaySubject<User> = new ReplaySubject<User>(1);

    private readonly _header = new HttpHeaders().set(
        'Authorization',
        'Bearer ' + sessionStorage.getItem('accessToken') ?? localStorage.getItem("accessToken")
    );
    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private base$: BaseService) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for user
     *
     * @param value
     */
    set user(value: User) {
        // Store the value
        value.avatar = environment.BASE_URL + value?.avatar ?? ''
        this._user.next(value);
    }

    get user$(): Observable<User> {
        return this._user.asObservable();
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the current logged in user data
     */
    get(): Observable<User> {
        return this._httpClient.get<UserResponse>('https://localhost:7298/api/User/GetUser', { headers: this._header }).pipe(
            map((user) => {
                this.user = user;
                return user
            }),
        );
    }

    /**
     * Update the user
    /**
     *
     */
    update(user: UserUpdateDto): Observable<any> {

        const formData: FormData = new FormData();

        // Append user properties to FormData
        formData.append('name', user.name);
        formData.append('userName', user.userName);
        formData.append('email', user.email);
        formData.append('phoneNumber', user.phoneNumber);
        formData.append('status', user.status.toString());
        formData.append('oldAvatar', this.base$.extractFilenameFromUrl(user.oldAvatar));

        if (user.newAvatar) {
            formData.append('newAvatar', user.newAvatar, user.newAvatar.name);
        }

        return this._httpClient.put<User>('https://localhost:7298/api/User/UpdateUser', formData, { headers: this._header }).pipe(
            map((response) => {
                this._user.next(response);
                return response
            }),
        );
    }
}
