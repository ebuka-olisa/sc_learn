import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { LearningPathEditViewModel } from 'src/app/models/learning-path';
import { NotificationService } from 'src/app/services/notification.service';
import { AdminLearningPathsTopicService } from '../services/admin-learning-paths-topic.service';
import { AdminLearningPathsService } from '../services/admin-learning-paths.service';

@Injectable()
export class AdminLearningPathsTopicsResolver implements Resolve<any>{

    constructor(private adminLearningPathsService: AdminLearningPathsService,
                private adminLearningPathsTopicService: AdminLearningPathsTopicService,
                private notify: NotificationService) { }

    resolve(route: ActivatedRouteSnapshot): Observable<any>{
        // get learning path id
        const pathId = route.params.id;
        const subjectId = route.params.subjectId;
        if (pathId) {
            return forkJoin([
                this.adminLearningPathsService.getLearningPathInfo(Number.parseInt(pathId, 10)),
                this.adminLearningPathsTopicService.getSubject(Number.parseInt(subjectId, 10)),
                this.adminLearningPathsTopicService.getLearningPathSubjectTopics(Number.parseInt(pathId, 10),
                    Number.parseInt(subjectId, 10), null)
            ]).pipe(
                map(result => {
                    return {
                        pathInfo: result[0],
                        pathSubject: result[1],
                        pathTopics: result[2]
                    };
                }),
                catchError((error) => {
                    this.notify.error('Problem loading topics!');
                    return of(
                        {
                            pathInfo : null,
                            pathSubject: null,
                            pathTopics: null
                        });
                })
            );
        } else {
            this.notify.error('Problem loading topics');
            return of(new LearningPathEditViewModel());
        }
    }
}
