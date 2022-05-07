import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LPSubjectTopicsAndSectionsViewModel, LearningPathSubjectTopicListViewModel,
    LearningPathSubjectTopicCreateViewModel, LearningPathSubjectTopicUpdateViewModel,
    LearningPathSubjectTopicEditViewModel } from 'src/app/models/topic';
import { PaginatedResult } from 'src/app/models/pagaination';
import { SubjectEditViewModel } from 'src/app/models/subject';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'any'
})
export class AdminLearningPathsTopicService {
    private adminTopicBase = environment.Url + 'admin/topic';
    private adminSubjectBase = environment.Url + 'admin/subject';

    constructor(private http: HttpClient) { }

    /*========== LEARNING PATH SUBJECT TOPIC ==========*/
    // Get list of learning path subject topics
    getLearningPathSubjectTopics(pathId: number, subjectId: number, status: string | null, searchTerm?: string)
        : Observable<LPSubjectTopicsAndSectionsViewModel> {

        const result = new LPSubjectTopicsAndSectionsViewModel();
        let params = new HttpParams();
        if (searchTerm) {
            params = params.append('searchTerm', '' + searchTerm);
        }
        if (status !== undefined && status !== null) {
            params = params.append('Active', '' + (status === 'Active' ? true : false));
        }

        return this.http.get<LPSubjectTopicsAndSectionsViewModel>
        (this.adminTopicBase + '/' + pathId + '/' + subjectId, { params } )
            .pipe(
                map((response: any) => {
                    result.topics = response.topics;
                    result.section1 = response.section1;
                    result.section2 = response.section2;
                    result.section3 = response.section3;
                    return result;
                })
            );
    }

    // Get subject
    getSubject(subjectId: number): Observable<SubjectEditViewModel> {
        return this.http.get<SubjectEditViewModel>(this.adminSubjectBase + '/' + subjectId);
    }

    // Update learning path subject topics
    updateLearningPathSubjectTopics(pathId: number, subject: SubjectEditViewModel,
                                    lpTopicInfo: LPSubjectTopicsAndSectionsViewModel): Observable<any> {
        return this.http.put(this.adminTopicBase + '/' + pathId + '/' + subject.id + '/update', lpTopicInfo);
    }

    // Delete learning path subject topic
    deleteLearningPathSubjectTopic(pathId: number, subject: SubjectEditViewModel,
                                   topic: LearningPathSubjectTopicListViewModel): Observable<any> {
        return this.http.delete(this.adminTopicBase + '/' + pathId + '/' + subject.id + '/' + topic.id);
    }

    // Create learning path topic
    createLearningPathTopic(pathTopic: LearningPathSubjectTopicCreateViewModel): Observable<any> {
        return this.http.post(this.adminTopicBase + '/create', pathTopic);
    }

    // Get list of topics by subject outside learning path
    getLearningPathTopicsBySubject(pathId: number, subjectId: number, pageNumber?: number, itemsPerPage?: number, searchTerm?: string)
        : Observable<PaginatedResult<LearningPathSubjectTopicUpdateViewModel[]>> {

        const paginatedResult = new PaginatedResult<LearningPathSubjectTopicUpdateViewModel[]>();
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

        return this.http.get<PaginatedResult<LearningPathSubjectTopicUpdateViewModel[]>>
        (this.adminTopicBase + '/' + pathId + '/' + subjectId + '/subject', { params } )
            .pipe(
                map((response: any) => {
                    paginatedResult.pagination = response.pagination;
                    paginatedResult.result = response.topics;
                    return paginatedResult;
                })
            );
    }

    // Add existing learning path topics to a new LPSUbject
    addExistingLearningPathTopic(pathId: number, subjectId: number, section: number | string,
                                 topics: LPSubjectTopicsAndSectionsViewModel): Observable<any> {
        return this.http.put(this.adminTopicBase + '/' + pathId + '/' + subjectId + '/' + section, topics);
    }

    // Get learning path topic
    getLearningPathTopicInfo(pathId: number, subjecId: number, topicId: number): Observable<LearningPathSubjectTopicEditViewModel> {
        return this.http.get<LearningPathSubjectTopicEditViewModel>(this.adminTopicBase + '/' + pathId + '/' + subjecId + '/' + topicId);
    }

    // Edit learning path topic
    editLearningPathTopic(topic: LearningPathSubjectTopicCreateViewModel): Observable<any> {
        return this.http.put(this.adminTopicBase + '/' + topic.id + '/update', topic);
    }

}
