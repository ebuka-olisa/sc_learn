import { AdminSubjectsListComponent } from './admin-subjects-list/admin-subjects-list.component';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from 'src/app/services/notification.service';
import { Title } from '@angular/platform-browser';
import { ModalContainerComponent } from '../../admin-shared/components/modal-container/modal-container.component';
import { AdminSubjectsAddComponent } from './admin-subjects-add/admin-subjects-add.component';

@Component({
  selector: 'app-admin-subjects-modal-container',
  template: ''
})
export class AdminSubjectsModalContainerComponent extends ModalContainerComponent {


    private modalConfig: NgbModalOptions = {
        size: 'lg',
        centered: true,
        keyboard: false,
        backdrop: 'static'
    };

    constructor(private titleService: Title,
                private modalService: NgbModal,
                private notify: NotificationService,
                parentComponent: AdminSubjectsListComponent,
                route: ActivatedRoute,
                router: Router) {

        super(router);

        route.params.pipe(takeUntil(this.destroy)).subscribe(params => {
            let initialState;
            if (params.id) {
                // set page title
                this.titleService.setTitle('Edit Subject | Accave');

                initialState = {
                    title: 'Edit Subject',
                    Subject: {id: params.id}
                };
            } else {
                // set page title
                this.titleService.setTitle('Add Subject | Accave');

                initialState = {
                    title: 'Add Subject'
                };
            }
            // When router navigates on this component is takes the params and opens up the vendor edit modal
            this.currentDialog = this.modalService.open(AdminSubjectsAddComponent, this.modalConfig);
            this.currentDialog.componentInstance.initialState = initialState;
            this.currentDialog.componentInstance.subjectCreated.subscribe(
                () => {
                    if (this.currentDialog) {
                        this.currentDialog.dismiss('update');
                    }
                    this.notify.success('Subject was created successfully!');
                }
            );
            this.currentDialog.componentInstance.subjectEdited.subscribe(
                () => {
                    if (this.currentDialog) {
                        this.currentDialog.dismiss('update');
                    }
                    this.notify.success('Subject was updated successfully!');
                }
            );
            this.currentDialog.componentInstance.subjectDeleted.subscribe(
                () => {
                    if (this.currentDialog) {
                        this.currentDialog.dismiss('update');
                    }
                    this.notify.success('Subject was deleted successfully!');
                }
            );

            // Go back to parent page after the modal is closed
            this.currentDialog.result.then(result => {
                // set page title
                this.titleService.setTitle('Subjects | Accave');

                // router.navigateByUrl('/qm-staff/vendors');
            }, reason => {
                // set page title
                this.titleService.setTitle('Subjects | Accave');

                router.navigateByUrl('/scl-admin/subjects');

                if (reason === 'update') {
                    parentComponent.reloadPage();
                    window.scrollTo(0, 0);
                }
            });
        });
    }

}
