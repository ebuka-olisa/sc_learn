import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from 'src/app/services/notification.service';
import { ModalContainerComponent } from '../../admin-shared/components/modal-container/modal-container.component';
import { AdminLearningPathsTopicAddComponent } from './admin-learning-paths-topic-add/admin-learning-paths-topic-add.component';
import { AdminLearningPathsTopicsComponent } from './admin-learning-paths-topics/admin-learning-paths-topics.component';

@Component({
  selector: 'app-admin-learning-paths-subject-topic-modal-container',
  template: '',
})
export class AdminLearningPathsSubjectTopicModalContainerComponent extends ModalContainerComponent {

    private modalConfig: NgbModalOptions = {
        size: 'lg',
        centered: true,
        keyboard: false,
        backdrop: 'static'
    };

    constructor(private modalService: NgbModal,
                private notify: NotificationService,
                parentComponent: AdminLearningPathsTopicsComponent,
                route: ActivatedRoute,
                router: Router) {
        super(router);

        route.params.pipe(takeUntil(this.destroy)).subscribe( params => {
            const PathId = route.parent?.snapshot.params.id;
            const SubjectId = route.parent?.snapshot.params.subjectId;
            let initialState;
            if (params.topicId) {
                // set page title
                // this.titleService.setTitle('Edit Topic | Accave');

                initialState = {
                    title: 'Edit Topic',
                    Topic: {id: params.topicId},
                    PathId,
                    SubjectId
                };
            }
            else {
                // set page title
                // this.titleService.setTitle('Add Topic | Accave');

                initialState = {
                    title: 'Add Topic',
                    PathId,
                    SubjectId
                };
            }
            // When router navigates on this component is takes the params and opens up the vendor edit modal
            this.currentDialog = this.modalService.open(AdminLearningPathsTopicAddComponent, this.modalConfig);
            this.currentDialog.componentInstance.initialState = initialState;
            this.currentDialog.componentInstance.topicCreated.subscribe(
                () => {
                    if (this.currentDialog) {
                        this.currentDialog.dismiss('update');
                    }
                    this.notify.success('Topic was created successfully!');
                }
            );
            this.currentDialog.componentInstance.topicsAdded.subscribe(
                (topicCount: number) => {
                    if (this.currentDialog) {
                        this.currentDialog.dismiss('update');
                    }
                    this.notify.success('Topic' + (topicCount === 1 ? ' was' : 's were') + ' created successfully!');
                }
            );
            this.currentDialog.componentInstance.topicEdited.subscribe(
                () => {
                    if (this.currentDialog) {
                        this.currentDialog.dismiss('update');
                    }
                    this.notify.success('Topic was updated successfully!');
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

                router.navigateByUrl('/scl-admin/learning-paths/' + PathId + '/subjects' + '/' + SubjectId + '/topics');
                parentComponent.setParentUrl();

                if (reason === 'update') {
                    parentComponent.reloadPage();
                    window.scrollTo(0, 0);
                }
            });
        });
    }
}
