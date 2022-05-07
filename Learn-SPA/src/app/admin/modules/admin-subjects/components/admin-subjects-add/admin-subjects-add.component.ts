import { AdminSubjectsService, SubjectPictureType } from './../../admin-subjects.service';
import { SubjectEditViewModel } from './../../../../../models/subject';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild, OnDestroy, Renderer2, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbActiveModal, NgbModal, NgbModalOptions, NgbModalRef, NgbNav } from '@ng-bootstrap/ng-bootstrap';
import { ValidationErrorService } from 'src/app/services/validation-error.service';
import { NotificationService } from 'src/app/services/notification.service';
import { MyValidationErrors } from 'src/app/models/my-validation-error';
import { ConfirmExitComponent } from '../../../admin-shared/components/confirm-exit/confirm-exit.component';
import { AdminSharedService, StatusOption } from '../../../admin-shared/admin-shared.service';
import { ShowInfoComponent } from '../../../admin-shared/components/show-info/show-info.component';
import { ConfirmDeleteComponent } from '../../../admin-shared/components/confirm-delete/confirm-delete.component';
import { DeleteItemNameConfirmComponent } from '../../../admin-shared/components/delete-item-name-confirm/delete-item-name-confirm.component';
import { SinglePictureComponent } from '../../../admin-shared/components/single-picture/single-picture.component';
import { ColorEvent } from 'ngx-color';
import { Photo } from 'src/app/models/lesson';
import { TabsetComponent } from 'ngx-bootstrap/tabs';

@Component({
  selector: 'app-admin-subjects-add',
  templateUrl: './admin-subjects-add.component.html',
  styleUrls: ['./admin-subjects-add.component.scss']
})
export class AdminSubjectsAddComponent implements OnInit, OnDestroy {

    @ViewChild('longPicture', {static: false}) private longPictureComponent!: SinglePictureComponent;
    @ViewChild('shortPicture', {static: false}) private shortPictureComponent!: SinglePictureComponent;
    @ViewChild('bannerPicture', {static: false}) private bannerPictureComponent!: SinglePictureComponent;

    @ViewChild('myForm', {static: false}) private myForm!: NgForm;
    // @ViewChild('nav', {static: false}) private tab!: NgbNav;
    @ViewChild('myTab', { static: false }) tab!: TabsetComponent;

    @ViewChild('colorPicker') colorPicker!: ElementRef<HTMLElement>;

    @Input() initialState: any;

    @Output() subjectCreated = new EventEmitter<any>();
    @Output() subjectEdited = new EventEmitter<any>();
    @Output() subjectDeleted = new EventEmitter<any>();

    editSubjectReady = true;
    Subject!: SubjectEditViewModel;
    OriginalSubject!: string;

    fieldErrors: any = {};
    processing!: boolean;
    deleting!: boolean;
    editMode!: boolean;

    activeTab = 0;

    modalRef !: NgbModalRef;
    modalConfig: NgbModalOptions = {
        centered: true,
        keyboard: true,
        backdrop: 'static'
    };
    selectModalConfig: NgbModalOptions = {
        centered: true,
        keyboard: false,
        backdrop: 'static'
    };

    StatusOptions: StatusOption[] = [];
    statusSelectizeConfig: any;

    descriptionTextAreaReady = false;
    descriptionTextAreaConfig: any;

    Picture = null;
    pictureColorConfig = {};
    longPictureConfig: any = {
        cssClass: 'subject-icon-long'
    };
    shortPictureConfig: any = {
        cssClass: 'subject-icon-small'
    };
    bannerPictureConfig: any = {
        cssClass: 'subject-icon-wide'
    };

    isColorPickerVisible = false;
    color = '';

    constructor(private activeModal: NgbActiveModal,
                private modalService: NgbModal,
                private adminSubjectsService: AdminSubjectsService,
                private validationErrorService: ValidationErrorService,
                private notify: NotificationService,
                adminSharedService: AdminSharedService,
                renderer: Renderer2) {

        this.Subject = new SubjectEditViewModel();
        this.StatusOptions = adminSharedService.StatusOptions;
        this.descriptionTextAreaConfig = adminSharedService.DescriptionTextAreaConfig;
        this.statusSelectizeConfig = adminSharedService.StatusSelectizeConfig;

        // manage outside clicks
        renderer.listen('window', 'click', (e: Event ) => {
            const element = e.target as HTMLElement;
            if (this.colorPicker && !this.colorPicker.nativeElement.contains(element)) {
                this.isColorPickerVisible = false;
            }
       });
    }

    ngOnInit(): void {
        // if in edit mode
        if (this.initialState && this.initialState.Subject) {
            this.editMode = true;

            // clone original object so that changes do not reflect on the list view
            this.Subject = JSON.parse(JSON.stringify(this.initialState.Subject));

            // get more information from server
            this.getSubjectForEdit();
        } else {
            // this.Subject.deactivated = 'false';
            this.Subject.isActive = 'false';
            this.OriginalSubject = JSON.stringify(this.Subject);
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


    // Subject Operations
    getSubjectForEdit(): void {
        this.editSubjectReady = false;

        this.adminSubjectsService.getSubject(this.Subject)
        .subscribe(
            // success
            response => {
                this.Subject = response;
                this.Subject.colorCode = this.Subject.graphic && this.Subject.graphic.colorCode ? this.Subject.graphic.colorCode : '';
                this.color = this.Subject.colorCode;
                this.Subject.isActive = this.Subject.isActive ? 'true' : 'false';

                // get copy of subject to determine if change has been made
                this.OriginalSubject = JSON.stringify(this.Subject);

                // set parameters for picture chooser
                this.pictureColorConfig = {
                    color : this.Subject.colorCode
                };
                this.longPictureConfig = {
                    photo: this.Subject.graphic && this.Subject.graphic.long && this.Subject.graphic.long.url !== ''
                        ? this.Subject.graphic.long : null,
                    cssClass: 'subject-icon-long'
                };
                this.shortPictureConfig = {
                    photo: this.Subject.graphic && this.Subject.graphic.short && this.Subject.graphic.short.url !== ''
                        ? this.Subject.graphic.short : null,
                    cssClass: 'subject-icon-small'
                };
                this.bannerPictureConfig = {
                    photo: this.Subject.graphic && this.Subject.graphic.banner && this.Subject.graphic.banner.url !== ''
                        ? this.Subject.graphic.banner : null,
                    cssClass: 'subject-icon-wide'
                };


                this.editSubjectReady = true;
            },

            // error
            error => {
                this.notify.error('Problem loading subject information, please reload page.');
                this.editSubjectReady = false;
                this.activeModal.dismiss();
            }
        );
    }


    // Picture Operations
    hasPictures(): boolean{
        return this.longPictureComponent && this.longPictureComponent.Picture !== null
        && this.shortPictureComponent && this.shortPictureComponent.Picture !== null
        && this.bannerPictureComponent && this.bannerPictureComponent.Picture !== null;
    }


    // Color Operations
    toggleColorPicker(): void{
        this.isColorPickerVisible = !this.isColorPickerVisible;
    }

    showColorPicker(): void{
        this.isColorPickerVisible = true;
    }

    handleColorChangeFromInput(): void {
        this.color = this.Subject.colorCode;
        this.pictureColorConfig = {
            color : this.Subject.colorCode
        };
    }

    handleColorChange($event: ColorEvent): void {
        this.Subject.colorCode = $event.color.hex;
        this.pictureColorConfig = {
            color : this.Subject.colorCode
        };
    }

    /*isDescendant(pParent: any, pChild: HTMLElement): boolean {
        try {
            while (pChild !== null) {
                if (pChild === pParent) {
                return true;
                } else {
                pChild = (pChild.parentNode as HTMLElement);
                }
            }
        } catch (e) {
          console.warn('isDescendant ', e);
        }
        return false;
    }*/


    // Description Operations
    descriptionReady(): void {
        this.descriptionTextAreaReady = true;
    }

    hasDescription(): boolean {
        return this.Subject.description != null && this.Subject.description.length > 0;
    }


    // Changes
    changesMade(): boolean {
        const subjectInfoChanged = this.OriginalSubject !== JSON.stringify(this.Subject);

        const longPictureRemoved = this.Subject.graphic && this.Subject.graphic.long
            && this.Subject.graphic.long.url !== null && this.longPictureComponent && this.longPictureComponent.pictureRemoved;
        const shortPictureRemoved = this.Subject.graphic && this.Subject.graphic.short
            && this.Subject.graphic.short.url !== null && this.shortPictureComponent && this.shortPictureComponent.pictureRemoved;
        const bannerPictureRemoved = this.Subject.graphic && this.Subject.graphic.banner
            && this.Subject.graphic.banner.url !== null && this.bannerPictureComponent && this.bannerPictureComponent.pictureRemoved;

        let newLongPictureSelected = this.longPictureComponent && this.longPictureComponent.Picture !== null;
        newLongPictureSelected = newLongPictureSelected ? (this.Subject.graphic && this.Subject.graphic.long
            && this.Subject.graphic.long.url !== '' ? this.longPictureComponent.newPictureSelected : true) : false;
        let newShortPictureSelected = this.shortPictureComponent && this.shortPictureComponent.Picture !== null;
        newShortPictureSelected = newShortPictureSelected ? (this.Subject.graphic && this.Subject.graphic.short
            && this.Subject.graphic.short.url !== '' ? this.shortPictureComponent.newPictureSelected : true) : false;
        let newBannerPictureSelected = this.bannerPictureComponent && this.bannerPictureComponent.Picture !== null;
        newBannerPictureSelected = newBannerPictureSelected ? (this.Subject.graphic && this.Subject.graphic.banner
            && this.Subject.graphic.banner.url !== '' ? this.bannerPictureComponent.newPictureSelected : true) : false;

        return subjectInfoChanged || longPictureRemoved || shortPictureRemoved || bannerPictureRemoved
            || newLongPictureSelected || newShortPictureSelected || newBannerPictureSelected;
    }


    // Tabs
    tabSelelected(index: number): void {
        this.activeTab = index;
    }

    goToPreviousTab(): void {
        this.tab.tabs[--this.activeTab].active = true;
        // this.tab.select(--this.activeTab);
    }

    goToNextTab(): void {
        this.tab.tabs[++this.activeTab].active = true;
        // this.tab.select(++this.activeTab);
    }


    // Save
    save(): void {
        // let error = false;
        this.fieldErrors = {};
        this.processing = true;
        // if (!error) {

        // create new object to contain subject information
        const subjectObj: SubjectEditViewModel = JSON.parse(JSON.stringify(this.Subject));
        // subjectObj.isActive = this.Subject.isActive === 'true' ? true : false;

        if (!this.editMode) {
            subjectObj.isActive = true;
            this.createNewSubject(subjectObj);
        } else {
            this.editSubject(subjectObj);
        }
        // }
    }

    createNewSubject(subjectObj: SubjectEditViewModel): void {
        this.adminSubjectsService.createSubject(subjectObj)
        .subscribe(

            // success
            (response) => {
                // this.uploadSubjectLongPhoto(response);
                this.uploadSubjectPhoto(response, SubjectPictureType.Long);
            },

            // error
            error => {
                const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error);
                this.fieldErrors = allErrors.fieldErrors;
                if (this.fieldErrors.error && this.fieldErrors.error.indexOf('name') !== - 1) {
                    this.fieldErrors.Name = this.fieldErrors.error;
                }
                else if (this.fieldErrors.error && this.fieldErrors.error.toLowerCase().indexOf('color') !== - 1) {
                    this.fieldErrors.ColorCode = this.fieldErrors.error;
                }
                this.processing = false;
            }
        );
    }

    editSubject(subjectObj: SubjectEditViewModel): void {
        // if changes were made to staff information then update staff
        if (this.OriginalSubject !== JSON.stringify(subjectObj)) {
            this.adminSubjectsService.editSubject(subjectObj)
            .subscribe(

                // success
                (response) => {
                    this.uploadSubjectPhoto(subjectObj, SubjectPictureType.Long);
                },

                // error
                error => {
                    const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error);
                    this.fieldErrors = allErrors.fieldErrors;
                    if (this.fieldErrors.error && this.fieldErrors.error.indexOf('name') !== - 1) {
                        this.fieldErrors.Name = this.fieldErrors.error;
                    }
                    else if (this.fieldErrors.error && this.fieldErrors.error.toLowerCase().indexOf('color') !== - 1) {
                        this.fieldErrors.ColorCode = this.fieldErrors.error;
                    }
                    this.processing = false;
                }
            );
        } else {
            this.uploadSubjectPhoto(subjectObj, SubjectPictureType.Long);
        }
    }

    private uploadSubjectPhoto(subject: SubjectEditViewModel, version: SubjectPictureType): void {
        let pictureComponent: SinglePictureComponent = this.longPictureComponent;
        let picture: Photo | null = this.Subject.graphic ? this.Subject.graphic.long : null;
        switch (version){
            case SubjectPictureType.Short:
                pictureComponent = this.shortPictureComponent;
                picture = this.Subject.graphic ? this.Subject.graphic.short : null;
                break;
            case SubjectPictureType.Banner:
                pictureComponent = this.bannerPictureComponent;
                picture = this.Subject.graphic ? this.Subject.graphic.banner : null;
                break;
        }
        let newPictureSelected = pictureComponent.Picture != null;
        newPictureSelected = newPictureSelected ? (picture && picture.url !== '' ? pictureComponent.newPictureSelected : true) : false;
        if (newPictureSelected) {
            this.adminSubjectsService.uploadSubjectPhoto(subject, version, pictureComponent.Picture)
            .subscribe(
                // success
                () => {
                    this.continuePictureUpload(version, subject);
                },

                // error
                error => {
                    const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error, false, false, true);
                    this.fieldErrors = allErrors.fieldErrors;
                    this.processing = false;
                }
            );
        } else {
            this.continuePictureUpload(version, subject);
        }
    }

    private continuePictureUpload(version: SubjectPictureType, subject: SubjectEditViewModel): void{
        switch (version){
            case SubjectPictureType.Long:
                this.uploadSubjectPhoto(subject, SubjectPictureType.Short);
                break;
            case SubjectPictureType.Short:
                this.uploadSubjectPhoto(subject, SubjectPictureType.Banner);
                break;
            case SubjectPictureType.Banner:
                if (this.editMode) {
                    this.subjectEdited.emit();
                } else {
                    this.subjectCreated.emit();
                }
                this.processing = false;
                break;
        }
    }

    // Delete & Deactivate
    delete(): void {
        // show remove modal if category can de deleted
        if (this.Subject.canDelete === true) {
            this.modalRef = this.modalService.open(ConfirmDeleteComponent, this.modalConfig);
            this.modalRef.componentInstance.ModalContent = {
                item: 'Subject',
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
        } else {
            // tell user that this item cannot be removed
            this.modalRef = this.modalService.open(ShowInfoComponent, this.modalConfig);
            this.modalRef.componentInstance.ModalContent = {
                title: 'Subject In Use',
                message: 'This subject cannot be deleted because it is contained in some learning paths.',
                icon: 'warning'
            };
        }
    }

    confirmDelete(): void {
        // show remove modal if category can de deleted
        this.modalRef = this.modalService.open(DeleteItemNameConfirmComponent, this.modalConfig);
        this.modalRef.componentInstance.ModalContent = {
            item: 'Subject',
            action: 'Delete',
            extraMessage: 'Please be informed that this action cannot be reversed!',
            correctName: this.Subject.name
        };
        this.modalRef.componentInstance.completeDelete.subscribe(
            (response: { name: string; parentName: string | null; }) => {

                // delete
                this.completeDelete(response.name, this.modalRef);
            }
        );
    }

    completeDelete(subjectName: string, modalRef: NgbModalRef): void {
        this.deleting = true;
        this.adminSubjectsService.deleteSubject(this.Subject, subjectName)
        .subscribe(

            // success
            (response) => {
                // close modal
                modalRef.close();

                // tell parent component to reload list
                this.subjectDeleted.emit();
                this.deleting = false;
                // this.reloadServiceListUsedByOthers();
            },

            // error
            error => {
                const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error, true);
                this.fieldErrors = allErrors.fieldErrors;
                this.deleting = false;

                // close modal
                modalRef.close();
            }
        );
    }

}
