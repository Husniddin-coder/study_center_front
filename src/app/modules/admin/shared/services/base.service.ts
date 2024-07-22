import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root',
})
export class BaseService {

    private apiUrl = environment.API_BASE_URL
    /**
     *
     */
    constructor(protected http: HttpClient) { }
    /**
     *
     * @param url
     * @returns
     */
    MakeUrl(url: string) {
        return this.apiUrl + url;
    }

    get = <T>(url: string, page: number, size: number, sort: string, order: string, search: string) =>
        this.http.get<T>(this.MakeUrl(url), {
            params: {
                page: '' + page,
                size: '' + size,
                sort,
                order,
                search,
            }
        });

    post = <T>(url: string, model: any) =>
        this.http.post<T>(this.MakeUrl(url), model);

    put = <T>(url: string, id: number, model: any) =>
        this.http.put<T>(this.MakeUrl(`${url}/${id}`), model);

    delete = <T>(url: string, id: number) =>
        this.http.delete<T>(this.MakeUrl(`${url}/${id}`));

    extractFilenameFromUrl(url: string): string {
        const parts = url?.split('/');

        const lastPart = parts[parts?.length - 1];

        // Replace double backslashes (\\) with single backslash (/)
        const filenameWithBackslashes = lastPart.replace(/\\\\/g, '\\');

        return filenameWithBackslashes;
    }

}
