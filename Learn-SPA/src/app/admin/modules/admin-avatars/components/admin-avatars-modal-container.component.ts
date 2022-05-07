import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from 'src/app/services/notification.service';
import { ModalContainerComponent } from '../../admin-shared/components/modal-container/modal-container.component';
import { AdminAvatarsAddComponent } from './admin-avatars-add/admin-avatars-add.component';
import { AdminAvatarsListComponent } from './admin-avatars-list/admin-avatars-list.component';

@Component({
  selector: 'app-admin-avatars-modal-container',
  template: ''
})
export class AdminAvatarsModalContainerComponent extends ModalContainerComponent {

    private modalConfig: NgbModalOptions = {
        centered: true,
        keyboard: false,
        backdrop: 'static'
    };

    constructor(private titleService: Title,
                private modalService: NgbModal,
                private notify: NotificationService,
                parentComponent: AdminAvatarsListComponent,
                route: ActivatedRoute,
                router: Router) {

        super(router);

        route.params.pipe(takeUntil(this.destroy)).subscribe(params => {
            let initialState;
            if (params.id) {
                // set page title
                this.titleService.setTitle('Edit Avatar | Accave');

                initialState = {
                    title: 'Edit Avatar',
                    Avatar: {id: params.id}
                };
            } else {
                // set page title
                this.titleService.setTitle('Add Avatar | Accave');

                initialState = {
                    title: 'Add Avatar'
                };
            }
            // When router navigates on this component is takes the params and opens up the vendor edit modal
            this.currentDialog = this.modalService.open(AdminAvatarsAddComponent, this.modalConfig);
            this.currentDialog.componentInstance.initialState = initialState;
            this.currentDialog.componentInstance.avatarCreated.subscribe(
                () => {
                    if (this.currentDialog) {
                        this.currentDialog.dismiss('update');
                    }
                    this.notify.success('Avatar was created successfully!');
                }
            );
            this.currentDialog.componentInstance.avatarEdited.subscribe(
                () => {
                    if (this.currentDialog) {
                        this.currentDialog.dismiss('update');
                    }
                    this.notify.success('Avatar was updated successfully!');
                }
            );
            this.currentDialog.componentInstance.avatarDeleted.subscribe(
                () => {
                    if (this.currentDialog) {
                        this.currentDialog.dismiss('update');
                    }
                    this.notify.success('Avatar was deleted successfully!');
                }
            );

            // Go back to parent page after the modal is closed
            this.currentDialog.result.then(result => {
                // set page title
                this.titleService.setTitle('Avatars | Accave');

                // router.navigateByUrl('/qm-staff/vendors');
            }, reason => {
                // set page title
                this.titleService.setTitle('Avatars | Accave');

                router.navigateByUrl('/scl-admin/avatars');

                if (reason === 'update') {
                    parentComponent.reloadPage();
                    window.scrollTo(0, 0);
                }
            });
        });
    }

}
