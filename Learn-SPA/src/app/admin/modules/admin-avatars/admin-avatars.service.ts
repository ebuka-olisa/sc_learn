import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AvatarViewModel } from 'src/app/models/avatar';
import { PaginatedResult } from 'src/app/models/pagaination';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'any'
})
export class AdminAvatarsService {

    private adminAvatarBase = environment.Url + 'admin/avatar';

    constructor(private http: HttpClient) { }

    // Get list of avatars
    getAvatarList(pageNumber?: number, itemsPerPage?: number, searchTerm?: string)
    : Observable<PaginatedResult<AvatarViewModel[]>> {
        const paginatedResult = new PaginatedResult<AvatarViewModel[]>();
        let params = new HttpParams();
        if (pageNumber) {
            params = params.append('pageNumber', '' + pageNumber);
        }
        if (itemsPerPage) {
            params = params.append('pageSize', '' + itemsPerPage);
        }
        if (searchTerm) {
            params = params.append('searchTerm', '' + searchTerm);
        }

        return this.http.get<PaginatedResult<AvatarViewModel[]>>(this.adminAvatarBase + '/all', { params })
            .pipe(
                map((response: any) => {
                    paginatedResult.pagination = response.pagination;
                    paginatedResult.result = response.avatars;
                    return paginatedResult;
                })
            );
    }

    // Create avatar
    createAvatar(avatar: AvatarViewModel): Observable<AvatarViewModel> {
        return this.http.post<AvatarViewModel>(this.adminAvatarBase + '/create', avatar);
    }

    // Upload avatar picture
    uploadAvatarPhoto(avatar: AvatarViewModel, image: File | null): Observable<number> {
        const formData = new FormData();
        if (image != null) {
            formData.append('file', image);
        }

        return this.http.post<number>(this.adminAvatarBase + '/' + avatar.id + '/addPhoto', formData);
    }

    // Get avatar
    getAvatar(avatar: AvatarViewModel): Observable<AvatarViewModel> {
        return this.http.get<AvatarViewModel>(this.adminAvatarBase + '/' + avatar.id);
    }

    // Edit avatar
    editAvatar(avatar: AvatarViewModel): Observable<any> {
        return this.http.put(this.adminAvatarBase + '/' + avatar.id, avatar);
    }

    // Delete Avatar
    deleteAvatar(avatar: AvatarViewModel, name: string): Observable<any> {
        return this.http.delete(this.adminAvatarBase + '/' + avatar.id + '/' + name);
    }

}
