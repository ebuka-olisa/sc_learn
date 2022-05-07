import { AdminLearningPathsListComponent } from './admin-learning-paths-list/admin-learning-paths-list.component';
import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from 'src/app/services/notification.service';
import { ModalContainerComponent } from '../../admin-shared/components/modal-container/modal-container.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminLearningPathsAddComponent } from './admin-learning-paths-add/admin-learning-paths-add.component';

@Component({
  selector: 'app-admin-learning-paths-modal-container',
  template: '',
})
export class AdminLearningPathsModalContainerComponent extends ModalContainerComponent {

    private modalConfig: NgbModalOptions = {
        size: 'lg',
        centered: true,
        keyboard: false,
        backdrop: 'static'
    };

    constructor(private titleService: Title,
                private modalService: NgbModal,
                private notify: NotificationService,
                parentComponent: AdminLearningPathsListComponent,
                route: ActivatedRoute,
                router: Router) {

        super(router);

        route.params.pipe(takeUntil(this.destroy)).subscribe( _ => {
            // set page title
            this.titleService.setTitle('Add Learning Path | Accave');

            const initialState = {
                title: 'Add Learning Path'
            };
            // When router navigates on this component is takes the params and opens up the vendor edit modal
            this.currentDialog = this.modalService.open(AdminLearningPathsAddComponent, this.modalConfig);
            this.currentDialog.componentInstance.initialState = initialState;
            this.currentDialog.componentInstance.pathCreated.subscribe(
                () => {
                    if (this.currentDialog) {
                        this.currentDialog.dismiss('update');
                    }
                    this.notify.success('Learning Path was created successfully!');
                }
            );

            // Go back to parent page after the modal is closed
            this.currentDialog.result.then(result => {
                // set page title
                this.titleService.setTitle('Learning Paths | Accave');

                // router.navigateByUrl('/qm-staff/vendors');
            }, reason => {
                // set page title
                this.titleService.setTitle('Learning Paths | Accave');

                router.navigateByUrl('/scl-admin/learning-paths');

                if (reason === 'update') {
                    parentComponent.reloadPage();
                    window.scrollTo(0, 0);
                }
            });
        });
    }

}
