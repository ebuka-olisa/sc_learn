import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbActiveModal, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AvatarViewModel } from 'src/app/models/avatar';
import { MyValidationErrors } from 'src/app/models/my-validation-error';
import { NotificationService } from 'src/app/services/notification.service';
import { ValidationErrorService } from 'src/app/services/validation-error.service';
import { ConfirmDeleteComponent } from '../../../admin-shared/components/confirm-delete/confirm-delete.component';
import { ConfirmExitComponent } from '../../../admin-shared/components/confirm-exit/confirm-exit.component';
import { DeleteItemNameConfirmComponent } from '../../../admin-shared/components/delete-item-name-confirm/delete-item-name-confirm.component';
import { ShowInfoComponent } from '../../../admin-shared/components/show-info/show-info.component';
import { SinglePictureComponent } from '../../../admin-shared/components/single-picture/single-picture.component';
import { AdminAvatarsService } from '../../admin-avatars.service';

@Component({
  selector: 'app-admin-avatars-add',
  templateUrl: './admin-avatars-add.component.html',
  styleUrls: ['./admin-avatars-add.component.scss']
})
export class AdminAvatarsAddComponent implements OnInit, OnDestroy {

    @ViewChild(SinglePictureComponent, {static: false})
    private singlePictureComponent!: SinglePictureComponent;

    @ViewChild('myForm', {static: false}) private myForm!: NgForm;

    @Input() initialState: any;

    @Output() avatarCreated = new EventEmitter<any>();
    @Output() avatarEdited = new EventEmitter<any>();
    @Output() avatarDeleted = new EventEmitter<any>();

    editAvatarReady = true;
    Avatar!: AvatarViewModel;
    OriginalAvatar!: string;

    fieldErrors: any = {};
    processing!: boolean;
    deleting!: boolean;
    editMode!: boolean;

    modalRef !: NgbModalRef;
    modalConfig: NgbModalOptions = {
        centered: true,
        keyboard: true,
        backdrop: 'static'
    };

    Picture = null;
    pictureConfig: any = {};

    constructor(private activeModal: NgbActiveModal,
                private modalService: NgbModal,
                private adminAvatarService: AdminAvatarsService,
                private validationErrorService: ValidationErrorService,
                private notify: NotificationService) {
        this.Avatar = new AvatarViewModel();
    }

    ngOnInit(): void {
        // if in edit mode
        if (this.initialState && this.initialState.Avatar) {
            this.editMode = true;

            // clone original object so that changes do not reflect on the list view
            this.Avatar = JSON.parse(JSON.stringify(this.initialState.Avatar));

            // get more information from server
            this.getAvatarForEdit();
        } else {
            this.OriginalAvatar = JSON.stringify(this.Avatar);
        }
    }

    ngOnDestroy(): void {
        if (this.modalRef) {
            this.modalRef.close();
        }
    }

    close(): void {
        // (!this.editMode && !this.myForm.dirty)
        if (!this.changesMade()) {
            this.activeModal.dismiss();
        } else {
            // show another modal asking to discard changes
            this.modalRef = this.modalService.open(ConfirmExitComponent, this.modalConfig);
            this.modalRef.componentInstance.closeEditModal.subscribe(
                () => {
                    this.modalRef.close();
                    this.activeModal.dismiss();
                }
            );
        }
    }


    // Changes
    changesMade(): boolean {
        const avatarInfoChanged = this.OriginalAvatar !== JSON.stringify(this.Avatar);
        const pictureRemoved = this.Avatar.photo && this.Avatar.photo.url !== null && this.singlePictureComponent
            && this.singlePictureComponent.pictureRemoved;
        let newPictureSelected = this.singlePictureComponent && this.singlePictureComponent.Picture !== null;
        newPictureSelected = newPictureSelected ? (this.Avatar.photo && this.Avatar.photo.url !== '' ?
            this.singlePictureComponent.newPictureSelected : true) : false;
        return avatarInfoChanged || pictureRemoved || newPictureSelected;
    }


    // Avatar Operations
    getAvatarForEdit(): void {
        this.editAvatarReady = false;

        this.adminAvatarService.getAvatar(this.Avatar)
        .subscribe(
            // success
            response => {
                this.Avatar = response;

                // get copy of avatar to determine if change has been made
                this.OriginalAvatar = JSON.stringify(this.Avatar);

                // set parameters for picture chooser
                this.pictureConfig = {
                    photo: this.Avatar.photo && this.Avatar.photo.url !== '' ? this.Avatar.photo : null
                };

                this.editAvatarReady = true;
            },

            // error
            error => {
                this.notify.error('Problem loading avatar information, please reload page.');
                this.editAvatarReady = false;
                this.activeModal.dismiss();
            }
        );
    }


    // Save
    save(): void {
        let error = false;
        this.fieldErrors = {};
        this.processing = true;

        if (!this.Avatar.name || this.Avatar.name.trim() === '') {
            error = true;
            this.fieldErrors.Name = 'Enter the name of this avatar';
        }
        if (!this.singlePictureComponent || this.singlePictureComponent.Picture === null) {
            error = true;
            this.fieldErrors.Picture = 'Select a picture';
        }

        if (!error) {

            // create new object to contain subject information
            const avatarObj: AvatarViewModel = JSON.parse(JSON.stringify(this.Avatar));

            if (!this.editMode) {
                this.createNewAvatar(avatarObj);
            } else {

                // check if a new picture was selected
                let newPictureSelected = this.singlePictureComponent.Picture != null;
                newPictureSelected = newPictureSelected ? (this.Avatar.photo && this.Avatar.photo.url !== '' ?
                    this.singlePictureComponent.newPictureSelected : true) : false;

                this.editAvatar(avatarObj, newPictureSelected);
            }
        } else {
            this.processing = false;
        }
    }


    createNewAvatar(avatarObj: AvatarViewModel): void {
        this.adminAvatarService.createAvatar(avatarObj)
        .subscribe(

            // success
            (response) => {
                // this.subjectCreated.emit();
                this.uploadAvatarPhoto(response);
            },

            // error
            error => {
                const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error);
                this.fieldErrors = allErrors.fieldErrors;
                if (this.fieldErrors.error && this.fieldErrors.error.indexOf('name') !== - 1) {
                    this.fieldErrors.Name = this.fieldErrors.error;
                }
                this.processing = false;
            }
        );
    }

    editAvatar(avatarObj: AvatarViewModel, newPictureSelected: boolean): void {
        // if changes were made to staff information then update staff
        if (this.OriginalAvatar !== JSON.stringify(avatarObj)) {
            this.adminAvatarService.editAvatar(avatarObj)
            .subscribe(

                // success
                (response) => {
                    if (newPictureSelected) {
                        this.uploadAvatarPhoto(avatarObj);
                    } else {
                        this.avatarEdited.emit();
                        this.processing = false;
                    }
                    // this.subjectEdited.emit();
                },

                // error
                error => {
                    const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error);
                    this.fieldErrors = allErrors.fieldErrors;
                    if (this.fieldErrors.error && this.fieldErrors.error.indexOf('name') !== - 1) {
                        this.fieldErrors.Name = this.fieldErrors.error;
                    }
                    this.processing = false;
                }
            );
        } else if (newPictureSelected){
            this.uploadAvatarPhoto(avatarObj);
        }
    }

    private uploadAvatarPhoto(avatar: AvatarViewModel): void {
        this.adminAvatarService.uploadAvatarPhoto(avatar, this.singlePictureComponent.Picture)
                .subscribe(
                    // success
                    () => {
                        if (this.editMode) {
                            this.avatarEdited.emit();
                        } else {
                            this.avatarCreated.emit();
                        }
                        this.processing = false;
                    },

                    // error
                    error => {
                        const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error, false, false, true);
                        this.fieldErrors = allErrors.fieldErrors;
                        this.processing = false;
                    }
                );
    }


    // Picture Operations
    hasPicture(): boolean{
        return this.singlePictureComponent && this.singlePictureComponent.Picture !== null;
    }


    // Delete Operations
    delete(): void {
        // show remove modal if category can de deleted
        this.modalRef = this.modalService.open(ConfirmDeleteComponent, this.modalConfig);
        this.modalRef.componentInstance.ModalContent = {
            item: 'Avatar',
            action: 'Delete'
        };
        this.modalRef.componentInstance.completeDelete.subscribe(
            () => {
                // close modal
                this.modalRef.close();

                // delete
                this.confirmDelete();
            }
        );
    }

    confirmDelete(): void {
        // show remove modal if category can de deleted
        this.modalRef = this.modalService.open(DeleteItemNameConfirmComponent, this.modalConfig);
        this.modalRef.componentInstance.ModalContent = {
            item: 'Avatar',
            action: 'Delete',
            extraMessage: 'Please be informed that this action cannot be reversed!',
            correctName: this.Avatar.name
        };
        this.modalRef.componentInstance.completeDelete.subscribe(
            (response: { name: string; parentName: string | null; }) => {

                // delete
                this.completeDelete(response.name, this.modalRef);
            }
        );
    }

    completeDelete(avatarName: string, modalRef: NgbModalRef): void {
        this.deleting = true;
        this.adminAvatarService.deleteAvatar(this.Avatar, avatarName)
        .subscribe(

            // success
            (response) => {
                // close modal
                modalRef.close();

                // tell parent component to reload list
                this.avatarDeleted.emit();
                this.deleting = false;
            },

            // error
            error => {
                const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error, true);
                this.fieldErrors = allErrors.fieldErrors;
                this.deleting = false;

                // close modal
                modalRef.close();

                if (this.fieldErrors.canDelete !== undefined && this.fieldErrors.canDelete === 'false'
                    || this.fieldErrors.canDelete === false) {
                    // tell user that this item cannot be removed
                    this.modalRef = this.modalService.open(ShowInfoComponent, this.modalConfig);
                    this.modalRef.componentInstance.ModalContent = {
                        title: 'Avatar In Use',
                        message: 'This avatar cannot be deleted because it is being used by some students.',
                        icon: 'warning'
                    };
                }
            }
        );
    }

}
