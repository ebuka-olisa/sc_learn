import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { takeUntil } from 'rxjs/operators';
import { LessonViewModel } from 'src/app/models/lesson';
import { NotificationService } from 'src/app/services/notification.service';
import { ModalContainerComponent } from '../../admin-shared/components/modal-container/modal-container.component';
import { AdminLearningPathsLessonsAddComponent } from './admin-learning-paths-lessons-add/admin-learning-paths-lessons-add.component';
import { AdminLearningPathsTopicLessonsComponent } from './admin-learning-paths-topic-lessons/admin-learning-paths-topic-lessons.component';

@Component({
  selector: 'app-admin-learning-paths-topic-lesson-modal-container',
  template: '',
})
export class AdminLearningPathsTopicLessonModalContainerComponent extends ModalContainerComponent {

    private modalConfig: NgbModalOptions = {
        size: 'lg',
        centered: true,
        keyboard: false,
        backdrop: 'static'
    };

    constructor(private modalService: NgbModal,
                private notify: NotificationService,
                parentComponent: AdminLearningPathsTopicLessonsComponent,
                route: ActivatedRoute,
                router: Router) {
        super(router);

        route.params.pipe(takeUntil(this.destroy)).subscribe( params => {
            const PathId = route.parent?.snapshot.params.id;
            const SubjectId = route.parent?.snapshot.params.subjectId;
            const TopicId = route.parent?.snapshot.params.topicId;
            let initialState;
            if (params.lessonId) {
                // set page title
                // this.titleService.setTitle('Edit Topic | Accave');

                initialState = {
                    title: 'Edit Lesson',
                    Lesson: {id: params.lessonId},
                    PathId,
                    SubjectId,
                    TopicId
                };
            }
            else {
                // set page title
                // this.titleService.setTitle('Add Topic | Accave');

                initialState = {
                    title: 'Add Lesson',
                    PathId,
                    SubjectId,
                    TopicId
                };
            }
            // When router navigates on this component is takes the params and opens up the vendor edit modal
            this.currentDialog = this.modalService.open(AdminLearningPathsLessonsAddComponent, this.modalConfig);
            this.currentDialog.componentInstance.initialState = initialState;
            this.currentDialog.componentInstance.lessonCreated.subscribe(
                (lessonCreated: LessonViewModel) => {
                    if (this.currentDialog) {
                        this.currentDialog.dismiss(lessonCreated);
                    }
                    this.notify.success('Lesson was created successfully!');
                }
            );
            this.currentDialog.componentInstance.lessonEdited.subscribe(
                () => {
                    if (this.currentDialog) {
                        this.currentDialog.dismiss('update');
                    }
                    this.notify.success('Lesson was updated successfully!');
                }
            );

            // Go back to parent page after the modal is closed
            this.currentDialog.result.then(result => {
                // set page title
                // this.titleService.setTitle('Learning Paths | Accave');

                // router.navigateByUrl('/qm-staff/vendors');
            }, reason => {
                // set page title
                // this.titleService.setTitle('Learning Paths | Accave');

                router.navigateByUrl('/scl-admin/learning-paths/' + PathId + '/subjects/' + SubjectId + '/topics/' + TopicId + '/lessons');
                parentComponent.setParentUrl();

                if (reason === 'update') {
                    parentComponent.reloadPage();
                    window.scrollTo(0, 0);
                } else if (reason as LessonViewModel) {
                    parentComponent.reloadPage(reason);
                    window.scrollTo(0, 0);
                }
            });
        });
    }
}
