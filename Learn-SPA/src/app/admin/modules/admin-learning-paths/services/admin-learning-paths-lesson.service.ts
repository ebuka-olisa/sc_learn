import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LessonCreateViewModel, LessonListViewModel, LessonViewModel, Photo } from 'src/app/models/lesson';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'any'
})
export class AdminLearningPathsLessonService {
    private adminLessonBase = environment.Url + 'admin/lesson';

    constructor(private http: HttpClient) { }

    /*========== LESSONS ==========*/
    // Get list of learning path subject topics
    getLearningPathTopicLessons(topicId: number, status: string | null, searchTerm?: string)
        : Observable<LessonListViewModel[]> {

        let result: LessonListViewModel[] = [];
        let params = new HttpParams();
        if (searchTerm) {
            params = params.append('searchTerm', '' + searchTerm);
        }
        if (status !== undefined && status !== null) {
            params = params.append('Active', '' + (status === 'Active' ? true : false));
        }

        return this.http.get<LessonListViewModel[]>
        (this.adminLessonBase + '/' + topicId + '/topic', { params } )
            .pipe(
                map((response: any) => {
                    result = response.lessons;
                    return result;
                })
            );
    }

    // Update topic lessons
    updateTopicLessons(topicId: number, lessons: LessonListViewModel[]): Observable<any> {
        return this.http.put(this.adminLessonBase + '/' + topicId + '/updateList', lessons);
    }

    // Get lesson info
    getLessonInfo(lessonId: number): Observable<LessonCreateViewModel> {
        return this.http.get<LessonCreateViewModel>(this.adminLessonBase + '/' + lessonId);
    }

    // Create lesson
    createLesson(topicId: number, lesson: LessonCreateViewModel): Observable<LessonViewModel> {
        return this.http.post<LessonViewModel>(this.adminLessonBase + '/' + topicId + '/createLesson', lesson);
    }

    // Upload lesson picture
    uploadLessonPhoto(lesson: LessonViewModel, image: File): Observable<number> {
        const formData = new FormData();
        formData.append('file', image);

        return this.http.post<number>(this.adminLessonBase + '/' + lesson.id + '/addPhoto', formData);
    }

    // Edit lesson
    editLesson(lesson: LessonCreateViewModel): Observable<any> {
        return this.http.put(this.adminLessonBase + '/' + lesson.id + '/update', lesson);
    }

    // Delete picture
    deleteLessonPicture(lesson: LessonViewModel, photo: Photo): Observable<any> {
        return this.http.delete(this.adminLessonBase + '/' + lesson.id + '/deletephoto/' + photo.id);
    }

    // Delete lesson
    deleteLesson(lesson: LessonListViewModel): Observable<any> {
        return this.http.delete(this.adminLessonBase + '/' + lesson.id + '/delete');
    }

    // Upload lesson thumbnail
    uploadLessonThumbnail(lesson: LessonCreateViewModel, image: File | null): Observable<number> {
        const formData = new FormData();
        if (image != null) {
            formData.append('file', image);
        }

        return this.http.post<number>(this.adminLessonBase + '/' + lesson.id + '/addThumbnail', formData);
    }

}
