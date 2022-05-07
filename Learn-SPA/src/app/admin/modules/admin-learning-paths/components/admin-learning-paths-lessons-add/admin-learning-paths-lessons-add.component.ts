import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalOptions, NgbModalRef, NgbNav, NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { LessonCreateViewModel, VideoViewModel } from 'src/app/models/lesson';
import { MyValidationErrors } from 'src/app/models/my-validation-error';
import { NotificationService } from 'src/app/services/notification.service';
import { ValidationErrorService } from 'src/app/services/validation-error.service';
import { AdminSharedService } from '../../../admin-shared/admin-shared.service';
import { ConfirmExitComponent } from '../../../admin-shared/components/confirm-exit/confirm-exit.component';
import { SinglePictureComponent } from '../../../admin-shared/components/single-picture/single-picture.component';
import { AdminLearningPathsLessonService } from '../../services/admin-learning-paths-lesson.service';

@Component({
  selector: 'app-admin-learning-paths-lessons-add',
  templateUrl: './admin-learning-paths-lessons-add.component.html',
  styleUrls: ['./admin-learning-paths-lessons-add.component.scss']
})
export class AdminLearningPathsLessonsAddComponent implements OnInit, OnDestroy {

    // @ViewChild('myForm', {static: false}) private myForm!: NgForm;
    @ViewChild('nav', {static: false}) private tab!: NgbNav;
    // @ViewChild('myTab', { static: false }) tab!: TabsetComponent;
    @ViewChild('thumbnail', {static: false}) private pictureComponent!: SinglePictureComponent;
    // @ViewChild('noteEditor', {static: false}) private noteEditor!: CodeEditorComponent;

    @Input() initialState: any;

    @Output() lessonCreated = new EventEmitter<any>();
    @Output() lessonEdited = new EventEmitter<any>();

    editLessonReady = true;
    Lesson !: LessonCreateViewModel;
    OriginalLesson!: string;

    TopicId!: number;

    fieldErrors: any = {};
    processing!: boolean;
    deleting!: boolean;
    editMode!: boolean;

    noteEditorOptions = {
        theme: 'vs',
        model : {
          language: 'xml',
          uri: 'main.xml',
          value: ''
        },
        options : {
          /*contextmenu: true,
          minimap: {
            enabled: true
          }*/
        }
    };
    assessmentEditorOptions = {
        theme: 'vs',
        model : {
          language: 'xml',
          uri: 'main2.xml',
          value: ''
        },
        options : {
          /*contextmenu: true,
          minimap: {
            enabled: true
          }*/
        }
    };

    activeTab = 0;

    modalRef !: NgbModalRef;
    modalConfig: NgbModalOptions = {
        centered: true,
        keyboard: false,
        backdrop: 'static'
    };
    videoModalConfig: NgbModalOptions = {
        size: 'lg',
        centered: true,
        keyboard: true,
        backdrop: 'static'
    };

    descriptionTextAreaReady = false;
    descriptionTextAreaConfig: any;

    // Picture = null;
    // pictureRemoved = false;
    // newPictureSelected = false;
    pictureConfig: any = {
        cssClass: 'lesson-thumbnail'
    };

    constructor(private activeModal: NgbActiveModal,
                private modalService: NgbModal,
                private adminLearningPathsLessonService: AdminLearningPathsLessonService,
                private validationErrorService: ValidationErrorService,
                private notify: NotificationService,
                adminSharedService: AdminSharedService) {

        this.Lesson = new LessonCreateViewModel();
        this.Lesson.video = new VideoViewModel();

        this.descriptionTextAreaConfig = adminSharedService.DescriptionTextAreaConfig;
    }

    ngOnInit(): void {
        // if in edit mode
        if (this.initialState)
        {
            if (this.initialState.TopicId) {
                this.TopicId = this.initialState.TopicId;
            }

            if (this.initialState.Lesson) {
                this.editMode = true;

                // clone original object so that changes do not reflect on the list view
                this.Lesson = JSON.parse(JSON.stringify(this.initialState.Lesson));
                this.Lesson.video = new VideoViewModel();

                // get more information from server
                this.getLessonForEdit();
            } else {
                // this.LearningPathTopic.isActive = true;
                this.OriginalLesson = JSON.stringify(this.Lesson);
            }
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
        const pictureRemoved = this.Lesson.thumbnail && this.Lesson.thumbnail.url !== null
            && this.pictureComponent && this.pictureComponent.pictureRemoved;
        let newPictureSelected = this.pictureComponent && this.pictureComponent.Picture !== null;
        newPictureSelected = newPictureSelected ? (this.Lesson.thumbnail && this.Lesson.thumbnail.url !== '' ?
            this.pictureComponent.newPictureSelected : true) : false;
        /*const pictureRemoved = this.Lesson.thumbnail && this.Lesson.thumbnail.url !== null && this.pictureRemoved;
        let newPictureSelected = this.Picture !== null;
        newPictureSelected = newPictureSelected ? (this.Lesson.thumbnail && this.Lesson.thumbnail.url !== '' ?
            this.newPictureSelected : true) : false;*/
        const topicInfoChanged = this.OriginalLesson !== JSON.stringify(this.Lesson)
            || this.Lesson.note !== this.noteEditorOptions.model.value
            || this.Lesson.assessment !== this.assessmentEditorOptions.model.value;
        return topicInfoChanged || pictureRemoved || newPictureSelected;
    }


    // Tabs
    onNavChange(changeEvent: NgbNavChangeEvent): void {
        this.triggerWindowResize();
    }

    onSelectTab(index: number): void {
        this.activeTab = index;
        this.triggerWindowResize();
    }

    goToPreviousTab(): void {
        // this.tab.tabs[--this.activeTab].active = true;
        this.tab.select(--this.activeTab);
        this.triggerWindowResize();
    }

    goToNextTab(): void {
        // this.tab.tabs[++this.activeTab].active = true;
        this.tab.select(++this.activeTab);
        this.triggerWindowResize();
    }

    triggerWindowResize(): void{
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 200);
    }


    // Loading Operations
    private getLessonForEdit(): void {
        this.editLessonReady = false;

        this.adminLearningPathsLessonService.getLessonInfo(this.Lesson.id)
        .subscribe(
            // success
            response => {
                this.Lesson = response;
                this.noteEditorOptions.model.value = this.Lesson.note;
                this.assessmentEditorOptions.model.value = this.Lesson.assessment;

                // get copy of subject to determine if change has been made
                this.OriginalLesson = JSON.stringify(this.Lesson);

                // set parameters for picture chooser
                this.pictureConfig = {
                    photo: this.Lesson.thumbnail && this.Lesson.thumbnail.url !== ''
                        ? this.Lesson.thumbnail : null,
                    cssClass: 'lesson-thumbnail'
                };

                this.editLessonReady = true;
            },

            // error
            error => {
                this.notify.error('Problem loading lesson information, please reload page.');
                this.editLessonReady = false;
                this.activeModal.dismiss();
            }
        );
    }


    // Description Operations
    descriptionReady(): void {
        this.descriptionTextAreaReady = true;
    }

    hasDescription(): boolean {
        return this.Lesson.description !== undefined && this.Lesson.description !== null && this.Lesson.description.length > 0;
    }


    // Video Operatons
    /*toggleVideoButtonAppearance(video: VideoViewModel): void {
        this.Lessons.forEach((element: LessonListViewModel) => {
            if (element.holdButtonAppearance && element.id !== lesson.id) {
                element.previousButtonHolder = true;
            }
        });
        if (lesson.holdButtonAppearance) {
            lesson.holdButtonAppearance = false;
        } else {
            lesson.holdButtonAppearance = true;
        }
        this.triggeredByButton = true;
    }*/

    /*videoFileAdded(event: any): void {
        const reader = new FileReader();

        if (event.target.files && event.target.files.length) {
            const [file] = event.target.files;
            reader.readAsDataURL(file);
            this.Lesson.video = file;

            reader.onload = () => {
                if (this.Lesson.video) {
                    this.Lesson.video.url = reader.result;
                }

                //this.imageSrc = reader.result as string;

                // this.myForm.patchValue({
                    // fileSource: reader.result
                // });

            };

        }
    }

    previewVideo(): void {
        this.modalRef = this.modalService.open(PreviewVideoComponent, this.videoModalConfig);
        this.modalRef.componentInstance.initialState = {
            url: this.Lesson.video?.url
        };
    }

    /*removeVideo(): void {
        this.Lesson.video = null;
    }*/



    // Note Operations
    private hasNote(): boolean {
        return this.noteEditorOptions.model.value !== undefined && this.noteEditorOptions.model.value !== null
        && this.noteEditorOptions.model.value.length > 0;
    }

    onCodeChanged(value: string): void {
        // console.log('CODE', value);
    }



    // Assessment Operations
    private hasAssessment(): boolean {
        return this.assessmentEditorOptions.model.value !== undefined && this.assessmentEditorOptions.model.value !== null
        && this.assessmentEditorOptions.model.value.length > 0;
    }


    // Picture Operations
    private hasPicture(): boolean{
        return this.pictureComponent && this.pictureComponent.Picture !== null;
        // return this.Picture != null;
    }

    /*pictureRemovedEvent(): void {
        debugger;
        this.pictureRemoved = true;
        this.Picture = null;
        this.newPictureSelected = false;
    }

    pictureAddedEvent(event: any): void {
        debugger;
        this.Picture = event.file;
        if (event.newPicture) {
            this.newPictureSelected = true;
        }
    }*/



    // Create, Edit
    hasAllContent(): boolean {
        return this.hasAssessment() && this.hasNote() && this.hasPicture() &&
        (this.Lesson && this.Lesson.name.trim().length !== 0 && this.Lesson.video && this.Lesson.video.url.trim().length !== 0);
    }

    save(): void{
        this.processing = true;
        this.fieldErrors = {};

        // check if video url is a valid url

        // create new object to contain topic information
        const lessonObj: LessonCreateViewModel = JSON.parse(JSON.stringify(this.Lesson));
        lessonObj.video.name = lessonObj.name.trim();
        lessonObj.note = this.noteEditorOptions.model.value;
        lessonObj.assessment = this.assessmentEditorOptions.model.value;

        if (!this.editMode) {
            this.createNewLesson(lessonObj);
        } else {
            this.editLesson(lessonObj);
        }
    }

    private createNewLesson(lessonObj: LessonCreateViewModel): void {

        this.adminLearningPathsLessonService.createLesson(this.TopicId , lessonObj)
        .subscribe(

            // success
            (response: any) => {
                this.uploadLessonThumbnail(response);
            },

            // error
            error => {
                const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error);
                this.fieldErrors = allErrors.fieldErrors;
                if (this.fieldErrors.error && this.fieldErrors.error.indexOf('_ERROR:') !== -1) {
                    if ( this.fieldErrors.error.indexOf('NOTE_ERROR:') !== -1) {
                        this.fieldErrors.Note = this.fieldErrors.error.substring(11);
                    }
                    else if (this.fieldErrors.error.indexOf('ASSESSMENT_ERROR:') !== -1) {
                        this.fieldErrors.Assessment = this.fieldErrors.error.substring(17);
                    }
                } else if (this.fieldErrors.error && this.fieldErrors.error.indexOf('name') !== -1) {
                    this.fieldErrors.Name = this.fieldErrors.error;
                }
                if (this.fieldErrors.Note) {
                    // this.activeTab = 1;
                    // this.tab.tabs[1].active = true;
                    this.tab.select(1);
                    this.triggerWindowResize();
                } else if (this.fieldErrors.Assessment) {
                    // this.activeTab = 2;
                    // this.tab.tabs[2].active = true;
                    this.tab.select(2);
                    this.triggerWindowResize();
                }
                this.processing = false;
            }
        );
    }

    private editLesson(lessonObj: LessonCreateViewModel): void {
        // if changes were made to staff information then update staff
        if (this.OriginalLesson !== JSON.stringify(lessonObj)) {
            this.adminLearningPathsLessonService.editLesson(lessonObj)
            .subscribe(

                // success
                (response) => {
                    this.uploadLessonThumbnail(lessonObj);
                },

                // error
                error => {
                    const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error);
                    this.fieldErrors = allErrors.fieldErrors;
                    if (this.fieldErrors.error && this.fieldErrors.error.indexOf('_ERROR:') !== -1) {
                        if ( this.fieldErrors.error.indexOf('NOTE_ERROR:') !== -1) {
                            this.fieldErrors.Note = this.fieldErrors.error.substring(11);
                        }
                        else if (this.fieldErrors.error.indexOf('ASSESSMENT_ERROR:') !== -1) {
                            this.fieldErrors.Assessment = this.fieldErrors.error.substring(17);
                        }
                    } else if (this.fieldErrors.error && this.fieldErrors.error.indexOf('name') !== -1) {
                        this.fieldErrors.Name = this.fieldErrors.error;
                    }
                    if (this.fieldErrors.Note) {
                        // this.activeTab = 1;
                        // this.tab.tabs[1].active = true;
                        this.tab.select(1);
                        this.triggerWindowResize();
                    } else if (this.fieldErrors.Assessment) {
                        // this.activeTab = 1;
                        // this.tab.tabs[1].active = true;
                        this.tab.select(2);
                        this.triggerWindowResize();
                    }
                    this.processing = false;
                }
            );
        } else {
            this.uploadLessonThumbnail(lessonObj);
        }
    }

    private uploadLessonThumbnail(lesson: LessonCreateViewModel): void {
        let newPictureSelected = this.pictureComponent.Picture != null;
        newPictureSelected = newPictureSelected ? (this.Lesson.thumbnail && this.Lesson.thumbnail.url !== '' ?
            this.pictureComponent.newPictureSelected : true) : false;
        /*let newPictureSelected = this.Picture != null;
        newPictureSelected = newPictureSelected ? (this.Lesson.thumbnail && this.Lesson.thumbnail.url !== '' ?
            this.newPictureSelected : true) : false;*/
        if (newPictureSelected) {
            this.adminLearningPathsLessonService.uploadLessonThumbnail(lesson, this.pictureComponent.Picture)
            .subscribe(
                // success
                () => {
                    this.completeThumbnailUpload(lesson);
                },

                // error
                error => {
                    const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error, false, false, true);
                    this.fieldErrors = allErrors.fieldErrors;
                    this.processing = false;
                }
            );
        } else {
            this.completeThumbnailUpload(lesson);
        }
    }

    private completeThumbnailUpload(lesson: LessonCreateViewModel): void{
        // tell parent component to reload category list
        if (this.editMode) {
            this.lessonEdited.emit();
        } else {
            this.lessonCreated.emit(lesson);
        }
        this.processing = false;
    }

}
