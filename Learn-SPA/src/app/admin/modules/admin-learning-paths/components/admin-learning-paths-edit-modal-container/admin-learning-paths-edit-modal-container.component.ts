import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { takeUntil } from 'rxjs/operators';
import { LearningPathEditViewModel } from 'src/app/models/learning-path';
import { NotificationService } from 'src/app/services/notification.service';
import { ModalContainerComponent } from '../../../admin-shared/components/modal-container/modal-container.component';
import { AdminLearningPathsAddComponent } from '../admin-learning-paths-add/admin-learning-paths-add.component';
import { AdminLearningPathsBasicInfoComponent } from '../admin-learning-paths-basic-info/admin-learning-paths-basic-info.component';

@Component({
  selector: 'app-admin-learning-paths-edit-modal-container',
  template: ''
})
export class AdminLearningPathsEditModalContainerComponent extends ModalContainerComponent {

    private modalConfig: NgbModalOptions = {
        size: 'lg',
        centered: true,
        keyboard: false,
        backdrop: 'static'
    };

    constructor(private titleService: Title,
                private modalService: NgbModal,
                private notify: NotificationService,
                parentComponent: AdminLearningPathsBasicInfoComponent,
                route: ActivatedRoute,
                router: Router) {

        super(router);

        route.params.pipe(takeUntil(this.destroy)).subscribe(params => {
            // set page title
            // this.titleService.setTitle('Edit Learning Path | Accave');

            const PathId = route.parent?.snapshot.params.id;
            const initialState = {
                title: 'Edit Learning Path',
                Path: {id: PathId}
            };

            // When router navigates on this component is takes the params and opens up the vendor edit modal
            this.currentDialog = this.modalService.open(AdminLearningPathsAddComponent, this.modalConfig);
            this.currentDialog.componentInstance.initialState = initialState;
            this.currentDialog.componentInstance.pathEdited.subscribe(
                (newPath: LearningPathEditViewModel) => {
                    if (this.currentDialog) {
                        this.currentDialog.dismiss({reason: 'update', obj: newPath});
                    }
                    this.notify.success('Learning Path was updated successfully!');
                }
            );
            this.currentDialog.componentInstance.pathDeleted.subscribe(
                () => {
                    if (this.currentDialog) {
                        this.currentDialog.dismiss('delete');
                    }
                    this.notify.success('Learning Path was deleted successfully!');
                }
            );

            // Go back to parent page after the modal is closed
            this.currentDialog.result.then(result => {
                // set page title
                // this.titleService.setTitle('Learning Paths | Accave');
            }, response => {
                // set page title
                // this.titleService.setTitle('Learning Paths | Accave');

                if (!response || response.reason === 'update') {
                    router.navigateByUrl('/scl-admin/learning-paths/' + PathId);
                } else {
                    router.navigateByUrl('/scl-admin/learning-paths');
                    window.scrollTo(0, 0);
                }

                if (response && response.reason === 'update') {
                    parentComponent.updatePath(response.obj);
                    window.scrollTo(0, 0);
                }
            });
        });
    }
}
