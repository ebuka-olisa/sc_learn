import { LearningPathEditViewModel } from 'src/app/models/learning-path';
import { NotificationService } from 'src/app/services/notification.service';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { catchError, map } from 'rxjs/operators';
import { forkJoin, Observable, of } from 'rxjs';
import { AdminLearningPathsService } from '../services/admin-learning-paths.service';

@Injectable()
export class AdminLearningPathsInfoResolver implements Resolve<any> {

    constructor(private adminLearningPathsService: AdminLearningPathsService,
                private notify: NotificationService) { }

    resolve(route: ActivatedRouteSnapshot): Observable<any>{
        // get learning path id
        const pathId = route.params.id;
        if (pathId) {
            return forkJoin([
                this.adminLearningPathsService.getLearningPathInfo(Number.parseInt(pathId, 10)),
                this.adminLearningPathsService.getLearningPathSubjects(Number.parseInt(pathId, 10), null)
            ]).pipe(
                map(result => {
                    return {
                        pathInfo: result[0],
                        pathSubjects: result[1]
                    };
                }),
                catchError((error) => {
                    this.notify.error('Problem loading learning path information');
                    return of(
                        {
                            pathInfo : null,
                            pathSubjects: null
                        });
                })
            );
        } else {
            this.notify.error('Problem loading learning path information');
            return of(new LearningPathEditViewModel());
        }
    }

}
