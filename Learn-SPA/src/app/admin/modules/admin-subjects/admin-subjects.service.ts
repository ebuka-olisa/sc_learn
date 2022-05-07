import { SubjectEditViewModel } from './../../../models/subject';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaginatedResult } from 'src/app/models/pagaination';
import { SubjectListViewModel } from 'src/app/models/subject';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'any'
})
export class AdminSubjectsService {

    // private staffServiceBase = environment.Url + 'qm_475/admin/subject';
    private adminSubjectBase = environment.Url + 'admin/subject';

    constructor(private http: HttpClient) { }

    // Get list of subjects
    getSubjectsList(status: string | null, pageNumber?: number, itemsPerPage?: number, searchTerm?: string)
    : Observable<PaginatedResult<SubjectListViewModel[]>> {
        const paginatedResult = new PaginatedResult<SubjectListViewModel[]>();
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

        // get correct api
        let api = '/all';
        if (status) {
            api = '/all/' + status;
        }

        return this.http.get<PaginatedResult<SubjectListViewModel[]>>(this.adminSubjectBase + api, { params })
            .pipe(
                map((response: any) => {
                    paginatedResult.pagination = response.pagination;
                    paginatedResult.result = response.subjects;
                    return paginatedResult;
                })
            );
    }

    // Get subject
    getSubject(subject: SubjectEditViewModel): Observable<SubjectEditViewModel> {
        return this.http.get<SubjectEditViewModel>(this.adminSubjectBase + '/' + subject.id);
    }

    // Create subject
    createSubject(subject: SubjectEditViewModel): Observable<any> {
        return this.http.post(this.adminSubjectBase + '/create', subject);
    }

    // Edit subject
    editSubject(subject: SubjectEditViewModel): Observable<any> {
        return this.http.put(this.adminSubjectBase + '/' + subject.id + '/update', subject);
    }

    // Upload subject picture
    uploadSubjectPhoto(subject: SubjectEditViewModel, version: SubjectPictureType, image: File | null): Observable<number> {
        const formData = new FormData();
        let urlSuffix = '';
        if (image != null) {
            formData.append('file', image);
        }
        switch (version) {
            case SubjectPictureType.Long:
                urlSuffix = 'addIcon_long';
                break;
            case SubjectPictureType.Short:
                urlSuffix = 'addIcon_short';
                break;
            case SubjectPictureType.Banner:
                urlSuffix = 'addIcon_banner';
                break;
        }

        return this.http.post<number>(this.adminSubjectBase + '/' + subject.id + '/' + urlSuffix, formData);
    }

    // Delete Subject
    deleteSubject(subject: SubjectEditViewModel, name: string): Observable<any> {
        return this.http.delete(this.adminSubjectBase + '/' + subject.id + '/' + name);
    }

}

export enum SubjectPictureType{
    Long = 1,
    Short = 2,
    Banner = 3
}
