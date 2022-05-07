import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { LearningPathEditViewModel } from 'src/app/models/learning-path';
import { NotificationService } from 'src/app/services/notification.service';
import { AdminLearningPathsLessonService } from '../services/admin-learning-paths-lesson.service';
import { AdminLearningPathsTopicService } from '../services/admin-learning-paths-topic.service';
import { AdminLearningPathsService } from '../services/admin-learning-paths.service';

@Injectable()
export class AdminLearningPathsTopicLessonsResolver implements Resolve<any>{

    constructor(private adminLearningPathsService: AdminLearningPathsService,
                private adminLearningPathsTopicService: AdminLearningPathsTopicService,
                private adminLearningPathsLessonService: AdminLearningPathsLessonService,
                private notify: NotificationService) { }

    resolve(route: ActivatedRouteSnapshot): Observable<any>{
        // get learning path id
        const pathId = route.params.id;
        const subjectId = route.params.subjectId;
        const topicId = route.params.topicId;
        if (pathId) {
            return forkJoin([
                this.adminLearningPathsService.getLearningPathInfo(Number.parseInt(pathId, 10)),
                this.adminLearningPathsTopicService.getSubject(Number.parseInt(subjectId, 10)),
                this.adminLearningPathsTopicService.getLearningPathTopicInfo(Number.parseInt(pathId, 10), Number.parseInt(subjectId, 10),
                    Number.parseInt(topicId, 10)),
                this.adminLearningPathsLessonService.getLearningPathTopicLessons(Number.parseInt(topicId, 10), null)
            ]).pipe(
                map(result => {
                    return {
                        pathInfo: result[0],
                        pathSubject: result[1],
                        pathTopic: result[2],
                        pathLessons: result[3]
                    };
                }),
                catchError((error) => {
                    this.notify.error('Problem loading lessons!');
                    return of(
                        {
                            pathInfo : null,
                            pathSubject: null,
                            pathTopic: null,
                            pathLessons: null
                        });
                })
            );
        } else {
            this.notify.error('Problem loading info');
            return of(new LearningPathEditViewModel());
        }
    }
}
