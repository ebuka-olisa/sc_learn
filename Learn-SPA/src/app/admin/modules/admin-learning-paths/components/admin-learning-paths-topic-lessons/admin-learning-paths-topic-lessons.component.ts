import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { LearningPathEditViewModel } from 'src/app/models/learning-path';
import { LessonListViewModel, LessonViewModel } from 'src/app/models/lesson';
import { MyValidationErrors } from 'src/app/models/my-validation-error';
import { SubjectEditViewModel } from 'src/app/models/subject';
import { LearningPathSubjectTopicEditViewModel } from 'src/app/models/topic';
import { NotificationService } from 'src/app/services/notification.service';
import { ValidationErrorService } from 'src/app/services/validation-error.service';
import { AdminLayoutComponent } from '../../../admin-shared/components/admin-layout/admin-layout.component';
import { ConfirmActionComponent } from '../../../admin-shared/components/confirm-action/confirm-action.component';
import { ConfirmDeleteComponent } from '../../../admin-shared/components/confirm-delete/confirm-delete.component';
import { DeleteItemNameConfirmComponent } from '../../../admin-shared/components/delete-item-name-confirm/delete-item-name-confirm.component';
import { ShowInfoComponent } from '../../../admin-shared/components/show-info/show-info.component';
import { AdminLearningPathsLessonService } from '../../services/admin-learning-paths-lesson.service';
import { AdminLearningPathsLessonPhotoUploadComponent } from '../admin-learning-paths-lesson-photo-upload/admin-learning-paths-lesson-photo-upload.component';

@Component({
  selector: 'app-admin-learning-paths-topic-lessons',
  templateUrl: './admin-learning-paths-topic-lessons.component.html',
  styleUrls: ['./admin-learning-paths-topic-lessons.component.scss']
})
export class AdminLearningPathsTopicLessonsComponent implements OnInit, OnDestroy {

    Path: LearningPathEditViewModel = new LearningPathEditViewModel();
    Subject: SubjectEditViewModel = new SubjectEditViewModel();
    Topic: LearningPathSubjectTopicEditViewModel = new LearningPathSubjectTopicEditViewModel();
    Lessons: LessonListViewModel[] = [];
    CopyOfLessons: LessonListViewModel[] = [];

    Filter: {[status: string]: string | null} = { status: null};
    SelectedFilter: {status: string | null} = { status : null};
    filtered = false;
    FilteredElements: any[] = [];

    @ViewChild('searchText', {static: false}) searchText!: ElementRef;
    lastSearchTerm: string | null = null;
    private searchTerms = new Subject<string>();
    Searching = false;

    contentLoading = false;
    rearrangeStarted = false;

    triggeredByButton = false;
    SelectedLessons: LessonListViewModel[] = [];
    SelectedLessonsThatNeedUpdate: number[] = [];

    modalRef !: NgbModalRef;
    modalConfig: NgbModalOptions = {
        centered: true,
        keyboard: true,
        backdrop: 'static'
    };
    lgModalConfig: NgbModalOptions = {
        size: 'lg',
        centered: true,
        keyboard: false,
        backdrop: 'static'
    };

    constructor(private parentComponent: AdminLayoutComponent,
                private route: ActivatedRoute,
                private adminLearningPathsLessonService: AdminLearningPathsLessonService,
                private titleService: Title,
                private notify: NotificationService,
                private validationErrorService: ValidationErrorService,
                private renderer: Renderer2,
                private modalService: NgbModal) {

        // manage outside clicks
        this.renderer.listen('window', 'click', (e: Event ) => {
            // If a previous holder is found, it means it was clicked by another button
            this.handleOutsideClick();
            this.triggeredByButton = false;
       });
    }

    ngOnInit(): void {
        const pathId = this.route.snapshot.params.id || '';

        // get learning path info
        this.route.data.subscribe(data => {
            this.Path = data.pathInfo.pathInfo;
            this.Subject = data.pathInfo.pathSubject;
            this.Topic = data.pathInfo.pathTopic;

            this.setParentUrl();
            this.setPageTitle();

            this.Lessons = data.pathInfo.pathLessons;
            this.sortLessons(this.Lessons);
        });

        this.setupSearch();
    }

    ngOnDestroy(): void {
        if (this.modalRef) {
            this.modalRef.close();
        }
    }

    setPageTitle(): void {
        // get path name
        let PathPrefix = '';
        if (this.Path.parent) {
            PathPrefix = `${this.Path.parent.name} > `;
        }

        // set page title
        this.titleService.setTitle('Lessons' + ' | ' + this.Topic.name + ' | ' + this.Subject.name + ' | ' + PathPrefix + this.Path.name + ' | Accave');

        // set page heading
        setTimeout(() => {
            this.parentComponent.PageHeadingPrefix = '';
            this.parentComponent.PageHeading = 'Lessons';
            this.parentComponent.PageSubHeading = PathPrefix + ' ' + this.Path.name + ' / ' + this.Subject.name + ' / ' + this.Topic.name;
        });
    }

    setParentUrl(): void{
        setTimeout(() => {
            this.parentComponent.ParentUrl = '/scl-admin/learning-paths/' + this.Path.id + '/subjects/' + this.Subject.id + '/topics';
        });
    }

    setupSearch(): void {
        this.searchTerms.pipe(
            // wait 500ms after each keystroke before considering the term
            debounceTime(400),

            // ignore new term if same as previous term
            distinctUntilChanged(),

            // switch to new search observable each time the term changes
            switchMap((term: string) => {
                this.contentLoading = true;

                if (term.trim().length > 0) {
                    this.Searching = true;
                } else {
                    this.Searching = false;
                }

                return this.adminLearningPathsLessonService.getLearningPathTopicLessons(this.Topic.id, this.Filter.status, term);
            })
        ).subscribe(response => {
            this.Lessons = response;
            this.sortLessons(this.Lessons);

            // remove selected topics that are no longer available
            this.dropUnavailableSelections();

            this.contentLoading = false;
        });
    }


    // UI Helpers
    private handleOutsideClick(): void {
        this.Lessons.forEach((element: LessonListViewModel) => {
            if (this.triggeredByButton){
                if (element.previousButtonHolder) {
                    element.holdButtonAppearance = false;
                    element.previousButtonHolder = false;
                }
            } else {
                element.holdButtonAppearance = false;
            }
        });
    }

    private sortLessons(topics: LessonListViewModel[]): void{
        topics.sort((a, b) => a.index - b.index);
    }

    private dropUnavailableSelections(): void {
        for (let i = this.SelectedLessons.length - 1; i >= 0; i--) {
            const foundIem = this.Lessons.find(o => o.id === this.SelectedLessons[i].id);
            if (!foundIem) {
                this.SelectedLessons.splice(i, 1);
            }
        }
    }

    private getCopyOfLessons(): void {
        this.CopyOfLessons = [];
        for (const el of this.Lessons) {
            this.CopyOfLessons.push({
                id: el.id,
                name: el.name,
                index: el.index,
                isActive: el.isActive
            });
        }
    }

    reloadPage(newLesson?: LessonViewModel): void {
        this.searchText.nativeElement.value = '';
        this.setupSearch();
        this.lastSearchTerm = null;
        this.loadLearningTopicLessons();

        if (newLesson) {
            this.openPhotoUpload(newLesson);
        }
    }


    // Search Operations
    search(term: string): void {
        this.searchTerms.next(term.trim());
        this.lastSearchTerm = term.trim();
    }


    // Filter Opeations
    private loadLearningTopicLessons(): void {
        this.contentLoading = true;

        // ensure this uses search and filter
        this.adminLearningPathsLessonService.getLearningPathTopicLessons(this.Topic.id, this.Filter.status,
            this.lastSearchTerm == null ? undefined : this.lastSearchTerm)
        .subscribe(
            // success
            response => {
                this.Lessons = response;
                this.sortLessons(this.Lessons);

                this.SelectedFilter.status = this.Filter.status;

                // show filters
                this.filtered = false;
                this.FilteredElements = [];
                for (const key in this.Filter) {
                    if (this.Filter.hasOwnProperty(key)) {
                        const value = this.Filter[key];
                        if (value) {
                            this.filtered = true;
                            this.FilteredElements.push({key, value});
                        }
                    }
                }

                // remove selected topics that are no longer available
                this.dropUnavailableSelections();

                // done
                this.contentLoading = false;
            },

            // error
            () => {
                this.notify.error('Problem loading lessons, please reload page.');
                this.contentLoading = false;
            }
        );
    }

    clearFilter(): void {
        this.Filter.status = null;
        if (this.filtered) {
            this.loadLearningTopicLessons();
        }
    }

    handleFilterOpen(): void {
        // return to previous settings
        this.Filter.status = this.SelectedFilter.status;
    }

    removeFilter(key: string, index?: number): void {
        this.Filter[key] = null;
        this.loadLearningTopicLessons();
    }

    filter(): void {
        this.loadLearningTopicLessons();
    }


    // UI Operations
    isLessonSelected(id: number): boolean {
        const selected = this.SelectedLessons.some(o => o.id === id);
        return selected;
    }

    toggleLesson(lesson: LessonListViewModel): void {
        const index = this.SelectedLessons.findIndex(o => o.id === lesson.id);
        if (index === -1) {
            this.SelectedLessons.push(lesson);
        } else {
            this.SelectedLessons.splice(index, 1);
        }
    }

    toggleButtonAppearance(lesson: LessonListViewModel): void {
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
    }

    drop(event: CdkDragDrop<string[]>): void {
        const pIndex =  event.previousIndex;
        const cIndex =  event.currentIndex;

        if (pIndex !== cIndex && !this.filtered) {
            if (!this.rearrangeStarted) {
                this.rearrangeStarted = true;
                this.getCopyOfLessons();
            }
            // get the section the current index belongs to
            const newIndex = cIndex + 1;
            const oldIndex = pIndex + 1;

            // adjust index
            this.adjustLessonIndexes(this.Lessons, newIndex, oldIndex, cIndex < pIndex);

            // adjust section start
            /*if (newSection !== oldSection) {
                this.adjustSectionStart(newSection, oldSection);
            }*/

            // sort and separate into sections
            this.sortLessons(this.Lessons);
        }
    }

    private adjustLessonIndexes(list: LessonListViewModel[], newIndex: number, oldIndex: number, itemMovedUp: boolean): void {
        list.forEach((el, idx, arr) => {
            if (itemMovedUp && el.index >= newIndex && el.index <= oldIndex) {
                if (el.index === oldIndex) {
                    el.index = newIndex;
                }
                else {
                    el.index = el.index + 1;
                }
            } else if (!itemMovedUp && el.index >= oldIndex && el.index <= newIndex) {
                if (el.index === oldIndex) {
                    el.index = newIndex;
                }
                else {
                    el.index = el.index - 1;
                }
            }
        });
    }

    cancelDragSort(): void {
        this.modalRef = this.modalService.open(ConfirmDeleteComponent, this.modalConfig);
        this.modalRef.componentInstance.ModalContent = {
            item: '',
            action: 'Discard Changes',
            body: 'Are you sure you want to discard changes made to the arrangement of lessons'
        };
        this.modalRef.componentInstance.completeDelete.subscribe(
            () => {
                // close modal
                this.modalRef.close();

                // delete
                this.completeCancelDragSort();
            }
        );
    }

    private completeCancelDragSort(): void {
        this.Lessons = [];
        for (const el of this.CopyOfLessons) {
            this.Lessons.push({
                id: el.id,
                name: el.name,
                index: el.index,
                isActive: el.isActive
            });
        }
        this.sortLessons(this.Lessons);
        this.rearrangeStarted = false;
    }

    saveDragSort(): void {
        this.modalRef = this.modalService.open(ConfirmActionComponent, this.modalConfig);
        this.modalRef.componentInstance.ModalContent = {
            heading: 'Save Changes',
            action: 'Save Changes',
            body: 'Are you sure you want to save changes made to the arrangement of lessons'
        };
        this.modalRef.componentInstance.completeAction.subscribe(
            () => {
                // delete
                this.completeSaveDragSort(this.modalRef);
            }
        );
    }

    private completeSaveDragSort(modRef: NgbModalRef): void {
        // upload new list
        if (this.rearrangeStarted) {
            this.updateLessonListOnServer(
                false,
                (): void => {
                    this.rearrangeStarted = false;
                    this.notify.success('Lesson arrangement was saved successfully!');
                    modRef.close();
                },
                (): void => {
                    this.notify.error('Problem saving changes!');
                    modRef.close();
                }
            );
        }
    }

    openPhotoUpload(lesson: LessonViewModel): void{
        this.modalRef = this.modalService.open(AdminLearningPathsLessonPhotoUploadComponent, this.lgModalConfig);
        this.modalRef.componentInstance.initialState = {
            Lesson: lesson
        };
        this.modalRef.componentInstance.photosUploaded.subscribe(
            () => {
                if (this.modalRef) {
                    this.modalRef.dismiss();
                }
                this.notify.success('Pictures were uploaded successfully!');
            }
        );
    }

    editMedia(lesson: LessonListViewModel): void {
        this.modalRef = this.modalService.open(AdminLearningPathsLessonPhotoUploadComponent, this.lgModalConfig);
        this.modalRef.componentInstance.initialState = {
            LessonForEdit: lesson
        };
        this.modalRef.componentInstance.photosUploaded.subscribe(
            () => {
                if (this.modalRef) {
                    this.modalRef.dismiss();
                }
                this.notify.success('Pictures were updated successfully!');
            }
        );
    }


    // Remove
    removeLesson(lesson: LessonListViewModel): void {
        this.modalRef = this.modalService.open(ConfirmDeleteComponent, this.modalConfig);
        this.modalRef.componentInstance.ModalContent = {
            item: 'Lesson',
            action: 'Remove'
        };
        this.modalRef.componentInstance.completeDelete.subscribe(
            () => {
                // close modal
                this.modalRef.close();

                // delete
                this.confirmRemove(lesson);
            }
        );
    }

    private confirmRemove(lesson: LessonListViewModel): void {
        // show remove modal if category can de deleted
        this.modalRef = this.modalService.open(DeleteItemNameConfirmComponent, this.modalConfig);
        this.modalRef.componentInstance.ModalContent = {
            item: 'Lesson',
            action: 'Remove',
            extraMessage: 'Please be informed that this action cannot be reversed!',
            correctName: lesson.name
        };
        this.modalRef.componentInstance.completeDelete.subscribe(
            (response: string) => {
                // remove
                this.completeRemove(lesson, this.modalRef);
            }
        );
    }

    private completeRemove(lesson: LessonListViewModel, modalRef: NgbModalRef): void {
        // send info to back end to remove topic
        this.adminLearningPathsLessonService.deleteLesson(lesson)
        .subscribe(

            // success
            // if success, reload content
            (response) => {
                // tell front end to reload page
                this.reloadPage();
                modalRef.close();
                this.notify.success('Lesson was removed successfully!');
            },

            // error
            // else show error message
            error => {
                const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error, true);
                // this.fieldErrors = allErrors.fieldErrors;
                // this.deleting = false;

                modalRef.close();
                /*this.modalRef = this.modalService.open(ShowInfoComponent, this.modalConfig);
                this.modalRef.componentInstance.ModalContent = {
                    title: 'Lesson cannot be removed',
                    message: 'This lesson cannot be removed because:'
                        + '<ul><li>It is only attached to ' + this.Path.name + ' ' + this.Subject.name
                        + ' and lessons have been created for this topic</li></ul>'
                        + 'Consider <span class="font-weight-600">deactivating</span> the topic as an alternative',
                    icon: 'warning'
                };*/
            }
        );

    }


    // Edit
    activateSelected(): void {
        this.modalRef = this.modalService.open(ConfirmActionComponent, this.modalConfig);
        this.modalRef.componentInstance.ModalContent = {
            heading: 'Activate Lessons',
            action: 'Activate',
            body: 'Are you sure you want to activate the selected lessons',
            buttonColor: 'green'
        };
        this.modalRef.componentInstance.completeAction.subscribe(
            () => {
                this.completeActivateSelected(this.modalRef);
            }
        );
    }

    private completeActivateSelected(modRef: NgbModalRef): void {
        // set subjects to active, if try is need
        let foundNeed = false;
        this.SelectedLessonsThatNeedUpdate = [];
        foundNeed = this.checkForUpdateNeed(this.Lessons, true);

        // upload new list
        if (foundNeed) {
            this.updateLessonListOnServer(
                true,
                (): void => {
                    // update UI
                    this.updateLessonForUI(this.Lessons);
                    modRef.close();

                    this.notify.success('Lessons were activated successfully!');
                    this.SelectedLessons = [];
                    this.SelectedLessonsThatNeedUpdate = [];
                },
                (): void => {
                    this.notify.error('Problem activating lessons!');
                    modRef.close();
                }
            );
        } else {
            this.notify.success('Lessons were activated successfully!');
            this.SelectedLessons = [];
            this.SelectedLessonsThatNeedUpdate = [];
            modRef.close();
        }
    }

    deactivateSelected(): void {
        this.modalRef = this.modalService.open(ConfirmActionComponent, this.modalConfig);
        this.modalRef.componentInstance.ModalContent = {
            heading: 'Deactivate Lessons',
            action: 'Deactivate',
            body: 'Are you sure you want to deactivate the selected lessons',
            buttonColor: 'red'
        };
        this.modalRef.componentInstance.completeAction.subscribe(
            () => {
                this.completeDeactivateSelected(this.modalRef);
            }
        );
    }

    private completeDeactivateSelected(modRef: NgbModalRef): void {
        // set subjects to inactive, if try is need
        let foundNeed = false;
        this.SelectedLessonsThatNeedUpdate = [];
        foundNeed = this.checkForUpdateNeed(this.Lessons, false);

        // upload new list
        if (foundNeed) {
            this.updateLessonListOnServer(
                true,
                (): void => {
                    // update UI
                    this.updateLessonForUI(this.Lessons);

                    // close modal
                    modRef.close();

                    this.notify.success('Lessons were deactivated successfully!');
                    this.SelectedLessons = [];
                    this.SelectedLessonsThatNeedUpdate = [];
                },
                (): void => {
                    this.notify.error('Problem deactivating lessons!');
                    modRef.close();
                }
            );
        } else {
            this.notify.success('Lessons were dactivated successfully!');
            this.SelectedLessons = [];
            this.SelectedLessonsThatNeedUpdate = [];
            modRef.close();
        }
    }

    private checkForUpdateNeed(list: LessonListViewModel[], activate: boolean): boolean {
        let foundNeed = false;
        list.forEach((element: LessonListViewModel) => {
            if (this.SelectedLessons.some(o => o.id === element.id) && element.isActive !== activate) {
                foundNeed = true;
                this.SelectedLessonsThatNeedUpdate.push(element.id);
            }
        });
        return foundNeed;
    }

    /*uUpdateSingleTopic(PathSubjectTopic: LearningPathSubjectTopicListViewModel): void {
        let activate = false;
        if (PathSubjectTopic.isActive === 'true') {
            activate = true;
        }
        this.modalRef = this.modalService.open(ConfirmActionComponent, this.modalConfig);
        this.modalRef.componentInstance.ModalContent = {
            heading: activate ? 'Activate Topic' : 'Deactivate Topic',
            action: activate ? 'Activate' : 'Deactivate',
            body: 'Are you sure you want to ' + (activate ? '' : 'deactivate') + 'this topic',
            buttonColor: activate ? 'green' : 'red'
        };
        this.modalRef.result.then((data) => {
            // on close
            if (PathSubjectTopic.isActive === 'true') {
                PathSubjectTopic.isActive = false;
            } else {
                PathSubjectTopic.isActive = true;
            }
        }, (reason) => {
            // on dismiss
            if (PathSubjectTopic.isActive === 'true') {
                PathSubjectTopic.isActive = false;
            } else {
                PathSubjectTopic.isActive = true;
            }
        });
        this.modalRef.componentInstance.completeAction.subscribe(
            () => {
                // this.completeUpdateSingleTopic(PathSubjectTopic, this.modalRef);
            }
        );
    }*/

    updateSingleLesson(lesson: LessonListViewModel): void {
        if (lesson.isActive === 'true') {
            lesson.isActive = true;
        } else {
            lesson.isActive = false;
        }
        this.SelectedLessonsThatNeedUpdate = [];
        this.SelectedLessonsThatNeedUpdate.push(lesson.id);

        this.updateLessonListOnServer(
            false,
            (): void => {
                // modRef.close();
                this.notify.success('Change was saved!');
                this.SelectedLessonsThatNeedUpdate = [];
            },
            (): void => {
                // modRef.close();
                this.notify.error('Change failed!');
                lesson.isActive = !lesson.isActive;
            }
        );
    }

    private updateLessonListOnServer(pendingUIUpdate: boolean, positiveCallback: () => void, negativeCallback: () => void): void{

        // gather list
        const UpdateLessonList: LessonListViewModel[] = [];
        this.assembleLessonsForUpdate(this.Lessons, UpdateLessonList, pendingUIUpdate);

        // send list to server
        this.adminLearningPathsLessonService.updateTopicLessons(this.Topic.id, UpdateLessonList)
        .subscribe(

            // success
            (response) => {
                // tell front end to reload page
                positiveCallback();
            },

            // error
            error => {
                negativeCallback();
            }
        );
    }

    private assembleLessonsForUpdate(list: LessonListViewModel[], listToJoin: LessonListViewModel[], pendingChange: boolean): void {
        list.forEach((element: LessonListViewModel) => {
            listToJoin.push({
                id: element.id,
                name: element.name,
                index: element.index,
                isActive: pendingChange ?
                    (this.SelectedLessonsThatNeedUpdate.find(o => o === element.id) != null ? !element.isActive : element.isActive)
                    : element.isActive
            });
        });
    }

    private updateLessonForUI(list: LessonListViewModel[]): void {
        list.forEach((element: LessonListViewModel) => {
            if (this.SelectedLessonsThatNeedUpdate.some(o => o === element.id)) {
                element.isActive = !element.isActive;
            }
        });
    }

}
