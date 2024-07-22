import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { UserService } from 'app/core/user/user.service';
import { UserResponse } from '../models/user.model';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class AccountService implements OnDestroy {
    private destroyer: Subject<void> = new Subject<void>()
    private url: string = environment.API_BASE_URL;
    private readonly _header = new HttpHeaders().set(
        'Authorization',
        'Bearer ' + this.authService.accessToken
    );
    user$: UserResponse;
    constructor(private http: HttpClient, private userService: UserService, private authService: AuthService) {

    }

    makeUrl(url: string) {
        return `${this.url}${url}`
    }

    getUser(): UserResponse {
        // this.userService.get()
        this.userService.user$.pipe(takeUntil(this.destroyer)).subscribe((response) => {
            this.user$ = response
        })
        return this.user$
    }

    updateUser(model: any): UserResponse {
        this.http.put<UserResponse>(this.makeUrl(`User/UpdateUser`), model, { headers: this._header }).subscribe((response) => {
            // response.avatar = `${this.baseUrl}${response.avatar}`
            this.user$ = response
            console.log('updateUser ', response.avatar);
        });
        return this.user$;
    }

    ngOnDestroy(): void {
        this.destroyer.next(null);
        this.destroyer.complete();
    }

}