import { Component, EventEmitter, Input, OnInit, Output, ViewChild, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbActiveModal, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { LearningPathEditViewModel, LearningPathListViewModel } from 'src/app/models/learning-path';
import { MyValidationErrors } from 'src/app/models/my-validation-error';
import { NotificationService } from 'src/app/services/notification.service';
import { ValidationErrorService } from 'src/app/services/validation-error.service';
import { AdminSharedService, StatusOption } from '../../../admin-shared/admin-shared.service';
import { ConfirmDeleteComponent } from '../../../admin-shared/components/confirm-delete/confirm-delete.component';
import { ConfirmExitComponent } from '../../../admin-shared/components/confirm-exit/confirm-exit.component';
import { DeleteItemNameConfirmComponent } from '../../../admin-shared/components/delete-item-name-confirm/delete-item-name-confirm.component';
import { ShowInfoComponent } from '../../../admin-shared/components/show-info/show-info.component';
import { AdminLearningPathsService } from '../../services/admin-learning-paths.service';

@Component({
  selector: 'app-admin-learning-paths-add',
  templateUrl: './admin-learning-paths-add.component.html',
  styleUrls: ['./admin-learning-paths-add.component.scss']
})
export class AdminLearningPathsAddComponent implements OnInit, OnDestroy {

    @ViewChild('myForm', {static: false}) private myForm!: NgForm;

    @Input() initialState: any;

    @Output() pathCreated = new EventEmitter<any>();
    @Output() pathEdited = new EventEmitter<any>();
    @Output() pathDeleted = new EventEmitter<any>();

    editLearningPathReady = true;
    LearningPath!: LearningPathEditViewModel;
    OriginalLearningPath!: string;

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

    parentPathsReady = false;
    Paths: LearningPathListViewModel[] = [];

    StatusOptions: StatusOption[] = [];
    statusSelectizeConfig: any;

    descriptionTextAreaReady = false;
    descriptionTextAreaConfig: any;

    selectizeConfig: any;

    constructor(private activeModal: NgbActiveModal,
                private modalService: NgbModal,
                private adminLearningPathsService: AdminLearningPathsService,
                private validationErrorService: ValidationErrorService,
                private notify: NotificationService,
                adminSharedService: AdminSharedService) {

        this.LearningPath = new LearningPathEditViewModel();
        this.StatusOptions = adminSharedService.StatusOptions;
        this.descriptionTextAreaConfig = adminSharedService.DescriptionTextAreaConfig;
        this.statusSelectizeConfig = adminSharedService.StatusSelectizeConfig;
        this.selectizeConfig = adminSharedService.NormalSelectizeConfig;
    }

    ngOnInit(): void {
        // load categories
        this.loadParentPaths();

        // if in edit mode
        if (this.initialState && this.initialState.Path) {
            this.editMode = true;

            // clone original object so that changes do not reflect on the list view
            this.LearningPath = JSON.parse(JSON.stringify(this.initialState.Path));

            // get more information from server
            this.getLearningPathForEdit();
        } else {
            // this.Subject.deactivated = 'false';
            this.LearningPath.isActive = 'false';
            this.OriginalLearningPath = JSON.stringify(this.LearningPath);
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


    // Learning Path Operations
    getLearningPathForEdit(): void {
        this.editLearningPathReady = false;

        this.adminLearningPathsService.getLearningPathInfo(this.LearningPath.id)
        .subscribe(
            // success
            response => {
                this.LearningPath = response;
                this.LearningPath.isActive = this.LearningPath.isActive ? 'true' : 'false';
                if (this.LearningPath.parent && this.LearningPath.parent.id) {
                    this.LearningPath.parentId = this.LearningPath.parent.id + '';
                }

                // get copy of subject to determine if change has been made
                this.OriginalLearningPath = JSON.stringify(this.LearningPath);

                this.editLearningPathReady = true;
            },

            // error
            error => {
                this.notify.error('Problem loading learning path information, please reload page.');
                this.editLearningPathReady = false;
                this.activeModal.dismiss();
            }
        );
    }


    // Description Operations
    descriptionReady(): void {
        this.descriptionTextAreaReady = true;
    }

    hasDescription(): boolean {
        return this.LearningPath.description !== undefined && this.LearningPath.description !== null
        && this.LearningPath.description.length > 0;
    }


    // Changes
    changesMade(): boolean {
        /*if (!this.editMode) {
            return false;
        }*/
        const subjectInfoChanged = this.OriginalLearningPath !== JSON.stringify(this.LearningPath);
        // const propertiesInfoChanged = this.OriginalExtraAttributes !== JSON.stringify(this.ExtraAttributes);
        return subjectInfoChanged;
    }


    // Learning Path
    loadParentPaths(): void {
        this.parentPathsReady = false;

        if (!this.adminLearningPathsService.ParentPathsList) {
            this.adminLearningPathsService.getPotentialParentLearningPathsList()
            .subscribe(
                // success
                response => {
                    this.completeLoad(response);
                },

                // error
                error => {
                    this.notify.error('Problem loading learning paths, please reload page.');
                }
            );
        } else {
            this.completeLoad(this.adminLearningPathsService.ParentPathsList);
        }
    }

    completeLoad(list: LearningPathListViewModel[]): void {
        this.Paths = list;
        this.adminLearningPathsService.ParentPathsList = this.Paths;
        this.parentPathsReady = true;

        // Get category parent
        if (this.editMode && this.editLearningPathReady && this.LearningPath.parent) {
            this.LearningPath.parentId = this.LearningPath.parent.id.toString();

            // get copy of LearningPath to determine if change has been made
            this.OriginalLearningPath = JSON.stringify(this.LearningPath);
        }
    }


    // Create, Edit, Delete
    save(): void {
        this.processing = true;
        this.fieldErrors = {};

        // create new object to contain path information
        const pathObj: LearningPathEditViewModel = JSON.parse(JSON.stringify(this.LearningPath));
        pathObj.isActive = this.LearningPath.isActive === 'true' ? true : false;

        // process parent category info
        if (pathObj.parentId === '') {
            pathObj.parentId = '0';
        }
        pathObj.parent = null;

        if (!this.editMode) {
            this.createNewLearningPath(pathObj);
        } else {
            this.editLearningPath(pathObj);
        }
    }

    createNewLearningPath(pathObj: LearningPathEditViewModel): void {

        this.adminLearningPathsService.createLearningPath(pathObj)
        .subscribe(

            // success
            (response) => {
                // tell parent component to reload category list
                this.pathCreated.emit();
                this.processing = false;

                // reload parent path list
                this.reloadParentPathsList();
            },

            // error
            error => {
                const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error);
                this.fieldErrors = allErrors.fieldErrors;
                if (this.fieldErrors.error && this.fieldErrors.error.indexOf('name') !== -1) {
                    this.fieldErrors.Name = this.fieldErrors.error;
                }
                this.processing = false;
            }
        );
    }

    editLearningPath(pathObj: LearningPathEditViewModel): void {
        // if changes were made to staff information then update staff
        if (this.OriginalLearningPath !== JSON.stringify(pathObj)) {
            this.adminLearningPathsService.editLearningPath(pathObj)
            .subscribe(

                // success
                (response) => {
                    if (pathObj.parentId !== '0'){
                        pathObj.parent = this.adminLearningPathsService.ParentPathsList
                            .find(x => x.id === Number.parseInt(pathObj.parentId || '', 10));
                    }

                    this.pathEdited.emit(pathObj);
                    this.processing = false;

                    // reload parent path list
                    this.reloadParentPathsList();
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
    }

    reloadParentPathsList(): void {
        if (this.adminLearningPathsService.ParentPathsList) {
            this.adminLearningPathsService.getPotentialParentLearningPathsList().subscribe(
                // success
                reuslt => {
                    this.adminLearningPathsService.ParentPathsList = reuslt;
                },

                // error
                error => {}
            );
        }
        // this.reloadCategoriesListUsedByOthers();
    }


    // Delete & Deactivate
    delete(): void {
        // show remove modal if category can de deleted
        if (this.LearningPath.canDelete === true) {
            this.modalRef = this.modalService.open(ConfirmDeleteComponent, this.modalConfig);
            this.modalRef.componentInstance.ModalContent = {
                item: 'Learning Path',
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
                title: 'Learning Path In Use',
                message: 'This learning path cannot be deleted either because of one or more reasons'
                    + '<ul><li>It has subjects within its path</li><li>It is a parent to other learning paths</li></ul>',
                icon: 'warning'
            };
        }
    }

    confirmDelete(): void {
        // show remove modal if category can de deleted
        this.modalRef = this.modalService.open(DeleteItemNameConfirmComponent, this.modalConfig);
        this.modalRef.componentInstance.ModalContent = {
            item: 'Learning Path',
            action: 'Delete',
            extraMessage: 'Please be informed that this action cannot be reversed!',
            correctName: this.LearningPath.name,
            correctParentName: this.LearningPath.parent ? this.LearningPath.parent.name : null
        };
        this.modalRef.componentInstance.completeDelete.subscribe(
            (response: { name: string; parentName: string | null; }) => {
                // close modal
                // modalRef.close();

                // delete
                this.completeDelete(response.name, response.parentName, this.modalRef);
            }
        );
    }

    completeDelete(pathName: string, parentPathName: string|null , modalRef: NgbModalRef): void {
        this.deleting = true;
        this.adminLearningPathsService.deleteLearningPath(this.LearningPath, pathName, parentPathName)
        .subscribe(

            // success
            (response) => {
                // close modal
                modalRef.close();

                // tell parent component to reload list
                this.pathDeleted.emit();
                this.deleting = false;

                // reload list of potential parent paths
                this.reloadParentPathsList();
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
