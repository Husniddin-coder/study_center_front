import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Navigation } from 'app/core/navigation/navigation.types';
import { Observable, ReplaySubject, tap } from 'rxjs';
import { AuthUtils } from '../auth/auth.utils';
import { AuthService } from '../auth/auth.service';
import { FuseNavigationItem } from '@fuse/components/navigation';

@Injectable({ providedIn: 'root' })
export class NavigationService {
    private _navigation: ReplaySubject<Navigation> = new ReplaySubject<Navigation>(1);
    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private authService: AuthService) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for navigation
     */
    get navigation$(): Observable<Navigation> {
        return this._navigation.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get all navigation data
     */
    get(): Observable<Navigation> {
        return this._httpClient.get<Navigation>('api/common/navigation').pipe(
            tap((navigation) => {
                navigation.default = this.filterNavigationItems(navigation.default);
                navigation.compact = this.filterNavigationItems(navigation.compact);
                navigation.futuristic = this.filterNavigationItems(navigation.futuristic);
                navigation.horizontal = this.filterNavigationItems(navigation.horizontal)
                this._navigation.next(navigation);
            }),
        );
    }

    private filterNavigationItems(items: FuseNavigationItem[]): FuseNavigationItem[] {
        return items.filter(item => {
            const hasPermission = !item.permissions?.length || (item.permissions && this.authService.checkPermission(item.permissions));

            if (item.children)
                item.children = this.filterNavigationItems(item.children);

            return (hasPermission && item.link) || (item.children?.length && !item.link);
        });
    }
}
