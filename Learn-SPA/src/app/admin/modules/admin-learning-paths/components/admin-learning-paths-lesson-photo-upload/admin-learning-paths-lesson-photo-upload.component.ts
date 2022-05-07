import { ChangeDetectorRef, Component, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { LessonViewModel, Photo } from 'src/app/models/lesson';
import { MyValidationErrors } from 'src/app/models/my-validation-error';
import { NotificationService } from 'src/app/services/notification.service';
import { ValidationErrorService } from 'src/app/services/validation-error.service';
import { ConfirmExitComponent } from '../../../admin-shared/components/confirm-exit/confirm-exit.component';
import { AdminLearningPathsLessonService } from '../../services/admin-learning-paths-lesson.service';

@Component({
    selector: 'app-admin-learning-paths-lesson-photo-upload',
    templateUrl: './admin-learning-paths-lesson-photo-upload.component.html',
    styleUrls: ['./admin-learning-paths-lesson-photo-upload.component.scss']
})
export class AdminLearningPathsLessonPhotoUploadComponent implements OnInit, OnDestroy {

    @Input() initialState: any;

    @Output() photosUploaded = new EventEmitter<any>();

    Lesson!: LessonViewModel;

    lessonReady = false;
    fieldErrors: any = {};
    processing = false;
    editMode = false;
    anySuccess = false;
    errorFound = false;

    Pictures: any[] = [];
    pictureConfig: any = {};
    pictureDeleted = false;

    modalRef !: NgbModalRef;
    modalConfig: NgbModalOptions = {
        centered: true,
        keyboard: true,
        backdrop: 'static'
    };

    ActionText = 'Upload';

    constructor(private activeModal: NgbActiveModal,
                private modalService: NgbModal,
                private notify: NotificationService,
                private adminLearningPathsLessonService: AdminLearningPathsLessonService,
                private validationErrorService: ValidationErrorService,
                private ref: ChangeDetectorRef) {
        this.Lesson = new LessonViewModel();
    }


    ngOnInit(): void {
        // if in edit mode
        if (this.initialState) {
            if (this.initialState.Lesson) {
                this.Lesson = this.initialState.Lesson;
                // this.editMode = true;

                // get pictures of this lesson
                this.pictureConfig = {
                    photos: this.Lesson.photos ?? null
                };

                this.lessonReady = true;
            } else if (this.initialState.LessonForEdit) {
                this.editMode = true;
                this.ActionText = 'Save';
                this.getLessonForEdit(this.initialState.LessonForEdit.id);
            }
        } else {
            this.close();
        }
    }

    ngOnDestroy(): void {
        if (this.modalRef) {
            this.modalRef.close();
        }
    }

    close(): void {
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
        let changes = false;
        for (const pic of this.Pictures) {
            if (!pic.photoId){
                changes = true;
                break;
            }
        }
        if (!changes) {
            for (const pic of this.Lesson.photos) {
                if (pic.deleted){
                    changes = true;
                    break;
                }
            }
        }
        return changes;
    }


    // Loading Operations
    private getLessonForEdit(lessonId: number): void {
        this.lessonReady = false;

        this.adminLearningPathsLessonService.getLessonInfo(lessonId)
        .subscribe(
            // success
            response => {
                this.Lesson = response;

                // get pictures of this lesson
                this.pictureConfig = {
                    photos: this.Lesson.photos ?? null
                };
                // this.noteEditorOptions.model.value = this.Lesson.note;
                // this.assessmentEditorOptions.model.value = this.Lesson.assessment;

                // get copy of subject to determine if change has been made
                // this.OriginalLesson = JSON.stringify(this.Lesson);

                this.lessonReady = true;
            },

            // error
            error => {
                this.notify.error('Problem loading lesson information, please reload page.');
                this.lessonReady = false;
                this.activeModal.dismiss();
            }
        );
    }



    // Picture Operations
    setPictures(pics: any): void {
        this.Pictures = pics;
    }

    deletePicture(photoId: number): void {
        const obj = this.Lesson.photos.find(x => x.id === photoId);
        if (obj) {
            // this.ngZone.run(() => {
            obj.deleted = true;
            this.pictureDeleted = true;
            this.ref.detectChanges();
            this.ref.markForCheck();
            // });
            // so pop-up for delete
            /*this.modalRef = this.modalService.open(ConfirmDeleteComponent, this.modalConfig);
            this.modalRef.componentInstance.ModalContent = {
                item: 'Picture',
                action: 'Delete',
                body: 'Are you sure you want to delete this picture from this lesson',
                extraMessage: 'Ensure it is not referenced in a note or assessment because this action cannot be reversed.'
            };
            this.modalRef.componentInstance.completeDelete.subscribe(
                () => {
                    // close modal
                    // this.modalRef.close();

                    // delete
                    this.confirmDeletePicture(this.modalRef, obj);
                }
            );*/
        }
    }


    // Save, Edit
    save(): void {
        this.processing = true;
        this.fieldErrors = {};

        if (this.Pictures.length > 0) {
            this.uploadPhotos(this.Lesson, this.Pictures, 0);
        } else {
            if (!this.editMode) {
                this.fieldErrors.Photos = ['Select pictures for the note and assessments of this lesson'];
                this.processing = false;
            } else if (this.pictureDeleted) {
                this.deletePictureFromServer(this.Lesson.photos, 0);
            }
        }
    }

    private uploadPhotos(lesson: LessonViewModel, pictures: any[], pictureIndex: number): void {
        if (!pictures[pictureIndex].photoId) {
            this.adminLearningPathsLessonService.uploadLessonPhoto(lesson, pictures[pictureIndex])
                .subscribe(
                    // success
                    (photoId: number) => {
                        this.anySuccess = true;
                        pictures[pictureIndex].photoId = photoId;
                        this.completePictureUpload(lesson, pictures, pictureIndex);
                    },

                    // error
                    error => {
                        this.errorFound = true;
                        const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error, false, false, true);
                        const tempFieldErrors = allErrors.fieldErrors;
                        if (!this.fieldErrors.Photos) {
                            this.fieldErrors.Photos = [];
                        }
                        this.fieldErrors.Photos.push(tempFieldErrors.error);
                        this.completePictureUpload(lesson, pictures, pictureIndex);
                    }
                );
        } else {
            this.completePictureUpload(lesson, pictures, pictureIndex);
        }
    }

    private completePictureUpload(lesson: LessonViewModel, pictures: any[], pictureIndex: number): void {
        if (pictureIndex === (pictures.length - 1)) {
            if (!this.pictureDeleted) {
                if (this.errorFound) {
                    if (this.anySuccess) {
                        this.anySuccess = false;
                        this.fieldErrors.Success = 'Pictures not listed with errors were uploaded successfully';
                    }
                    this.errorFound = false;
                    this.notify.error('Review pictures selected for upload!');
                } else {
                    this.photosUploaded.emit();
                }

                this.processing = false;
            } else {
                this.deletePictureFromServer(this.Lesson.photos, 0);
            }
        } else {
            this.uploadPhotos(lesson, pictures, pictureIndex + 1);
        }
    }

    private deletePictureFromServer(photos: Photo[], pictureIndex: number): void {
        if (photos[pictureIndex].deleted) {
            this.adminLearningPathsLessonService.deleteLessonPicture(this.Lesson, photos[pictureIndex])
                .subscribe(
                    // success
                    (photoId: number) => {
                        this.completePictureDelete(photos, pictureIndex);
                    },

                    // error
                    error => {
                        /*const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error, false, false, true);
                        const tempFieldErrors = allErrors.fieldErrors;
                        if (!this.fieldErrors.Photos) {
                            this.fieldErrors.Photos = [];
                        }
                        this.fieldErrors.Photos.push(tempFieldErrors.error);*/
                        this.notify.error('Error occurred while deleting some pictures');
                        this.completePictureDelete(photos, pictureIndex);
                    }
                );
        } else {
            this.completePictureDelete(photos, pictureIndex);
        }
    }

    private completePictureDelete(pictures: Photo[], pictureIndex: number): void {
        if (pictureIndex === (pictures.length - 1)) {
            if (this.errorFound) {
                this.fieldErrors.Success = 'Pictures not listed with errors were deleted successfully';
                if (this.anySuccess) {
                    this.anySuccess = false;
                    this.fieldErrors.Success = 'Pictures not listed with errors were uploaded and deleted successfully';
                }
                this.errorFound = false;
                this.notify.error('Review pictures selected for upload!');
            } else {
                this.photosUploaded.emit();
            }
            this.processing = false;
        } else {
            this.deletePictureFromServer(pictures, pictureIndex + 1);
        }
    }

}
