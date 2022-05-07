import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LearningPathEditViewModel, LearningPathListViewModel, LearningPathSubjectListViewModel, LearningPathSubjectUpdateViewModel } from 'src/app/models/learning-path';
import { PaginatedResult } from 'src/app/models/pagaination';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'any'
})
export class AdminLearningPathsService {

    private adminLearningPathsBase = environment.Url + 'admin/learningpath';

    ParentPathsList!: LearningPathListViewModel[];

    constructor(private http: HttpClient) { }

    /*========== LEARNING PATH ==========*/
    // Get list of learning paths
    getLearnigPathsList(status: string | null, pageNumber?: number, itemsPerPage?: number, searchTerm?: string)
    : Observable<PaginatedResult<LearningPathListViewModel[]>> {
        const paginatedResult = new PaginatedResult<LearningPathListViewModel[]>();
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

        return this.http.get<PaginatedResult<LearningPathListViewModel[]>>(this.adminLearningPathsBase + api, { params })
            .pipe(
                map((response: any) => {
                    paginatedResult.pagination = response.pagination;
                    paginatedResult.result = response.paths;
                    return paginatedResult;
                })
            );
    }

    // Get list of learning paths that can be parents
    getPotentialParentLearningPathsList(): Observable<LearningPathListViewModel[]> {
        return this.http.get<LearningPathListViewModel[]>(this.adminLearningPathsBase + '/all/noparent');
    }

    // Create learning path
    createLearningPath(path: LearningPathEditViewModel): Observable<any> {
        return this.http.post(this.adminLearningPathsBase + '/create', path);
    }

    // Get learning path
    getLearningPathInfo(pathId: number): Observable<LearningPathEditViewModel> {
        return this.http.get<LearningPathEditViewModel>(this.adminLearningPathsBase + '/' + pathId);
    }

    // Edit learning path
    editLearningPath(path: LearningPathEditViewModel): Observable<any> {
        return this.http.put(this.adminLearningPathsBase + '/' + path.id + '/update', path);
    }

    // Delete learning path
    deleteLearningPath(path: LearningPathEditViewModel, name: string, parentName: string | null): Observable<any> {
        return this.http.delete(this.adminLearningPathsBase + '/' + path.id
            + '?name=' + name + (parentName ? '&parentName=' + parentName : ''));
    }



    /*========== LEARNING PATH SUBJECT ==========*/
    // Get list of learning path subjects
    getLearningPathSubjects(pathId: number, status: string | null, pageNumber?: number, itemsPerPage?: number, searchTerm?: string)
        : Observable<PaginatedResult<LearningPathSubjectListViewModel[]>> {

        const paginatedResult = new PaginatedResult<LearningPathSubjectListViewModel[]>();
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
        if (status !== undefined && status !== null) {
            params = params.append('Active', '' + (status === 'Active' ? true : false));
        }

        return this.http.get<PaginatedResult<LearningPathSubjectListViewModel[]>>(this.adminLearningPathsBase + '/' + pathId + '/subject/all', { params } )
            .pipe(
                map((response: any) => {
                    paginatedResult.pagination = response.pagination;
                    paginatedResult.result = response.subjects;
                    return paginatedResult;
                })
            );
    }

    // Get list of subjects not in the learning path
    getSubjectsNotInLearningPath(pathId: number): Observable<LearningPathSubjectListViewModel[]> {
        return this.http.get<LearningPathSubjectListViewModel[]>(this.adminLearningPathsBase + '/' + pathId + '/subject/notIn' );
    }

    // Update learning path subjects
    updateLearningPathSubjects(pathId: number, pathSubjects: LearningPathSubjectUpdateViewModel[]): Observable<any> {
        return this.http.put(this.adminLearningPathsBase + '/' + pathId + '/updateSubjects', pathSubjects);
    }

}
