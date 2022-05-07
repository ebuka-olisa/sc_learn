import { NotificationService } from './../../../../../services/notification.service';
import { ActivatedRoute } from '@angular/router';
import { AdminLayoutComponent } from './../../../admin-shared/components/admin-layout/admin-layout.component';
import { Component, ElementRef, OnInit, Renderer2, ViewChild, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ConfirmDeleteComponent } from '../../../admin-shared/components/confirm-delete/confirm-delete.component';
import { ShowInfoComponent } from '../../../admin-shared/components/show-info/show-info.component';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DeleteItemNameConfirmComponent } from '../../../admin-shared/components/delete-item-name-confirm/delete-item-name-confirm.component';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { SubjectEditViewModel } from 'src/app/models/subject';
import { ConfirmActionComponent } from '../../../admin-shared/components/confirm-action/confirm-action.component';
import { AdminLearningPathsTopicService } from '../../services/admin-learning-paths-topic.service';
import { LearningPathEditViewModel } from 'src/app/models/learning-path';
import { LearningPathSubjectTopicListViewModel, LPSubjectTopicsAndSectionsViewModel } from 'src/app/models/topic';

@Component({
    selector: 'app-admin-learning-paths-topics',
    templateUrl: './admin-learning-paths-topics.component.html',
    styleUrls: ['./admin-learning-paths-topics.component.scss']
})
export class AdminLearningPathsTopicsComponent implements OnInit, OnDestroy {

    Path: LearningPathEditViewModel = new LearningPathEditViewModel();
    Subject: SubjectEditViewModel = new SubjectEditViewModel();
    AllPathSubjectTopics: LearningPathSubjectTopicListViewModel[] = [];
    CopyAllPathSubjectTopics: LearningPathSubjectTopicListViewModel[] = [];
    FirstPathSubjectTopics: LearningPathSubjectTopicListViewModel[] = [];
    SecondPathSubjectTopics: LearningPathSubjectTopicListViewModel[] = [];
    ThirdPathSubjectTopics: LearningPathSubjectTopicListViewModel[] = [];
    SectionStartIndex: number[] = [];
    CopySectionStartIndex: number[] = [];
    SectionUIStartIndex: number[] = [];

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
    SelectedTopics: LearningPathSubjectTopicListViewModel[] = [];
    SelectedTopicsThatNeedUpdate: number[] = [];

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

    constructor(private parentComponent: AdminLayoutComponent,
                private route: ActivatedRoute,
                private adminLearningPathsTopicService: AdminLearningPathsTopicService,
                private titleService: Title,
                private notify: NotificationService,
                private renderer: Renderer2,
                private modalService: NgbModal) {

        // manage outside clicks
        this.renderer.listen('window', 'click', (e: Event ) => {
            // If a previous holder is found, it means it was clicked by another button
            this.handleOutsideClick(this.FirstPathSubjectTopics);
            this.handleOutsideClick(this.SecondPathSubjectTopics);
            this.handleOutsideClick(this.ThirdPathSubjectTopics);
            this.triggeredByButton = false;
       });
    }

    ngOnInit(): void {
        const pathId = this.route.snapshot.params.id || '';

        // get learning path info
        this.route.data.subscribe(data => {
            this.Path = data.pathInfo.pathInfo;
            this.setParentUrl();
            this.Subject = data.pathInfo.pathSubject;
            this.AllPathSubjectTopics = data.pathInfo.pathTopics.topics;
            this.SectionStartIndex [0] = data.pathInfo.pathTopics.section1;
            this.SectionStartIndex [1] = data.pathInfo.pathTopics.section2;
            this.SectionStartIndex [2] = data.pathInfo.pathTopics.section3;
            this.SectionUIStartIndex[0] = 1;
            this.SectionUIStartIndex[1] = 3;
            this.SectionUIStartIndex[2] = 5;
            this.sortTopics(this.AllPathSubjectTopics, true);
        });

        this.setPageTitle();
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
        this.titleService.setTitle('Topics' + ' | ' + this.Subject.name + ' | ' + PathPrefix + this.Path.name + ' | Accave');

        // set page heading
        setTimeout(() => {
            this.parentComponent.PageHeadingPrefix = '';
            this.parentComponent.PageHeading = 'Topics';
            this.parentComponent.PageSubHeading = PathPrefix + ' ' + this.Path.name + '  ' + this.Subject.name;
        });
    }

    setParentUrl(): void{
        setTimeout(() => {
            this.parentComponent.ParentUrl = '/scl-admin/learning-paths/' + this.Path.id + '/subjects';
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

                return this.adminLearningPathsTopicService.getLearningPathSubjectTopics(this.Path.id, this.Subject.id, this.Filter.status,
                    term);
            })
        ).subscribe(response => {
            this.AllPathSubjectTopics = response.topics;
            this.SectionStartIndex [0] = response.section1;
            this.SectionStartIndex [1] = response.section2;
            this.SectionStartIndex [2] = response.section3;
            this.SectionUIStartIndex[0] = 1;
            this.SectionUIStartIndex[1] = 3;
            this.SectionUIStartIndex[2] = 5;
            this.sortTopics(this.AllPathSubjectTopics, true);

            // remove selected topics that are no longer available
            this.dropUnavailableSelections();

            this.contentLoading = false;
        });
    }


    // UI Helpers
    private handleOutsideClick(list: LearningPathSubjectTopicListViewModel[]): void {
        list.forEach((element: LearningPathSubjectTopicListViewModel) => {
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

    private sortTopics(topics: LearningPathSubjectTopicListViewModel[], split: boolean): void{
        topics.sort((a, b) => a.index - b.index);
        if (split) {
            this.ThirdPathSubjectTopics = [];
            this.SecondPathSubjectTopics = [];
            this.FirstPathSubjectTopics = [];
            topics.forEach((el, idX, array) => {
                if (this.SectionStartIndex [2] > 0 && el.index >= this.SectionStartIndex [2]){
                    this.ThirdPathSubjectTopics.push(el);
                    this.SectionUIStartIndex[2] = -1;
                }
                else if (this.SectionStartIndex [1] > 0 && el.index >= this.SectionStartIndex [1]){
                    this.SecondPathSubjectTopics.push(el);
                    this.SectionUIStartIndex[1] = -1;
                }
                else if (el.index >= this.SectionStartIndex [0]) {
                    this.FirstPathSubjectTopics.push(el);
                    this.SectionUIStartIndex[0] = -1;
                }
            });

            if (this.FirstPathSubjectTopics.length  ===  0) {
                this.SectionStartIndex[0] = 0;
                this.SectionUIStartIndex[0] = 1;
            }
            if (this.SecondPathSubjectTopics.length  ===  0) {
                this.SectionStartIndex[1] = 0;
                this.SectionUIStartIndex[1] = this.FirstPathSubjectTopics.length + 2
                + (this.FirstPathSubjectTopics.length === 0 ? 1 : 0);
            }
            if (this.ThirdPathSubjectTopics.length  ===  0) {
                this.SectionStartIndex[2] = 0;
                this.SectionUIStartIndex[2] = this.FirstPathSubjectTopics.length + this.SecondPathSubjectTopics.length + 3
                + (this.SecondPathSubjectTopics.length === 0 ? 1 : 0) + (this.FirstPathSubjectTopics.length === 0 ? 1 : 0);
            }
        }
    }

    private dropUnavailableSelections(): void {
        for (let i = this.SelectedTopics.length - 1; i >= 0; i--) {
            const foundIem = this.AllPathSubjectTopics.find(o => o.id === this.SelectedTopics[i].id);
            if (!foundIem) {
                this.SelectedTopics.splice(i, 1);
            }
        }
    }

    private getCopyOfTopics(): void {
        this.CopyAllPathSubjectTopics = [];
        for (const el of this.AllPathSubjectTopics) {
            this.CopyAllPathSubjectTopics.push({
                id: el.id,
                name: el.name,
                index: el.index,
                isActive: el.isActive
            });
        }

        this.CopySectionStartIndex[0] = this.SectionStartIndex[0];
        this.CopySectionStartIndex[1] = this.SectionStartIndex[1];
        this.CopySectionStartIndex[2] = this.SectionStartIndex[2];
    }

    reloadPage(): void {
        this.searchText.nativeElement.value = '';
        this.setupSearch();
        this.lastSearchTerm = null;
        this.loadLearningPathSubjectTopics();
    }


    // Search Operations
    search(term: string): void {
        this.searchTerms.next(term.trim());
        this.lastSearchTerm = term.trim();
    }


    // Filter Opeations
    private loadLearningPathSubjectTopics(): void {
        this.contentLoading = true;

        // ensure this uses search and filter
        this.adminLearningPathsTopicService.getLearningPathSubjectTopics(this.Path.id, this.Subject.id, this.Filter.status,
            this.lastSearchTerm == null ? undefined : this.lastSearchTerm)
        .subscribe(
            // success
            response => {
                this.AllPathSubjectTopics = response.topics;
                this.SectionStartIndex [0] = response.section1;
                this.SectionStartIndex [1] = response.section2;
                this.SectionStartIndex [2] = response.section3;
                this.SectionUIStartIndex[0] = 1;
                this.SectionUIStartIndex[1] = 3;
                this.SectionUIStartIndex[2] = 5;
                this.sortTopics(this.AllPathSubjectTopics, true);

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
                this.notify.error('Problem loading topics, please reload page.');
                this.contentLoading = false;
            }
        );
    }

    clearFilter(): void {
        this.Filter.status = null;
        if (this.filtered) {
            this.loadLearningPathSubjectTopics();
        }
    }

    handleFilterOpen(): void {
        // return to previous settings
        this.Filter.status = this.SelectedFilter.status;
    }

    removeFilter(key: string, index?: number): void {
        this.Filter[key] = null;
        this.loadLearningPathSubjectTopics();
    }

    filter(): void {
        this.loadLearningPathSubjectTopics();
    }


    // UI Operations
    isTopicSelected(id: number): boolean {
        const selected = this.SelectedTopics.some(o => o.id === id);
        return selected;
    }

    toggleTopic(subject: LearningPathSubjectTopicListViewModel): void {
        const index = this.SelectedTopics.findIndex(o => o.id === subject.id);
        if (index === -1) {
            this.SelectedTopics.push(subject);
        } else {
            this.SelectedTopics.splice(index, 1);
        }
    }

    toggleButtonAppearance(PathSubject: LearningPathSubjectTopicListViewModel): void {
        this.toggleButtonAppearanceHelper(this.FirstPathSubjectTopics, PathSubject);
        this.toggleButtonAppearanceHelper(this.SecondPathSubjectTopics, PathSubject);
        this.toggleButtonAppearanceHelper(this.ThirdPathSubjectTopics, PathSubject);
        this.triggeredByButton = true;
    }

    private toggleButtonAppearanceHelper(list: LearningPathSubjectTopicListViewModel[],
                                         PathSubject: LearningPathSubjectTopicListViewModel): void {
        list.forEach((element: LearningPathSubjectTopicListViewModel) => {
            if (element.holdButtonAppearance && element.id !== PathSubject.id) {
                element.previousButtonHolder = true;
            }
        });
        if (PathSubject.holdButtonAppearance) {
            PathSubject.holdButtonAppearance = false;
        } else {
            PathSubject.holdButtonAppearance = true;
        }
    }

    drop(event: CdkDragDrop<string[]>): void {
        const pIndex =  event.previousIndex;
        const cIndex =  event.currentIndex;

        if (cIndex > 0 && pIndex !== cIndex && !this.filtered) {
            if (!this.rearrangeStarted) {
                this.rearrangeStarted = true;
                this.getCopyOfTopics();
            }
            // get the section the current index belongs to
            const newSection = pIndex < cIndex ? this.getAffectedSectionForDownwardMove(cIndex) :
            this.getAffectedSectionForUpwardMove(cIndex);
            const oldSection = pIndex < cIndex ? this.getAffectedSectionForDownwardMove(pIndex) :
            this.getAffectedSectionForUpwardMove(pIndex);
            const newIndex = cIndex - (newSection - 1) - (newSection > 1 ? this.FirstPathSubjectTopics.length === 0 ? 1 : 0 : 0) -
            (newSection > 2 ? this.SecondPathSubjectTopics.length === 0 ? 1 : 0 : 0);
            const oldIndex = pIndex - (oldSection - 1) - (oldSection > 1 ? (this.FirstPathSubjectTopics.length === 0 ? 1 : 0) : 0) -
            (oldSection > 2 ? (this.SecondPathSubjectTopics.length === 0 ? 1 : 0) : 0);

            // adjust index
            this.adjustTopicIndexes(this.AllPathSubjectTopics, newIndex, oldIndex, cIndex < pIndex);

            // adjust section start
            if (newSection !== oldSection) {
                this.adjustSectionStart(newSection, oldSection);
            }

            // check if new section has gotten first element
            if (this.SectionUIStartIndex[0] !== -1 && cIndex === this.SectionUIStartIndex[0]) {
                this.SectionStartIndex[0] = newIndex;
                this.SectionUIStartIndex[0] = -1;
            } else  if (this.SectionUIStartIndex[1] !== -1 && cIndex === (this.SectionUIStartIndex[1] - (pIndex < cIndex ? 1 : 0))) {
                this.SectionStartIndex[1] = newIndex;
                this.SectionUIStartIndex[1] = -1;
            } else if (this.SectionUIStartIndex[2] !== -1 && cIndex === (this.SectionUIStartIndex[2] - (pIndex < cIndex ? 1 : 0))) {
                this.SectionStartIndex[2] = newIndex;
                this.SectionUIStartIndex[2] = -1;
            }

            // sort and separate into sections
            this.sortTopics(this.AllPathSubjectTopics, true);
        }
    }

    private adjustSectionStart(newSection: number, oldSection: number): void {
        if (newSection < oldSection) {
            // moved item up
            for (let scIdx = newSection; scIdx < oldSection; scIdx++){
                if (this.SectionStartIndex [scIdx] !== 0) {
                    this.SectionStartIndex [scIdx] += 1;
                }
            }
        }
        else {
            // moved down
            for (let scIdx = oldSection; scIdx < newSection; scIdx++){
                if (this.SectionStartIndex [scIdx] !== 0) {
                    this.SectionStartIndex [scIdx] -= 1;
                }
            }
        }
    }

    private getAffectedSectionForUpwardMove(index: number): number{
        const lessForSection3 = (this.FirstPathSubjectTopics.length === 0 ? 1 : 0) + (this.SecondPathSubjectTopics.length === 0 ? 1 : 0);
        const lessForSection2 = this.FirstPathSubjectTopics.length === 0 ? 1 : 0;
        if ((this.SectionStartIndex [2] > 0 && (index - 2 - lessForSection3 >= this.SectionStartIndex [2]))
            || (this.SectionUIStartIndex[2] !== -1 && index === this.SectionUIStartIndex[2])) {
            return 3;
        }
        else if ((this.SectionStartIndex [1] > 0 && (index - 1 - lessForSection2 >= this.SectionStartIndex [1]))
            || (this.SectionUIStartIndex[1] !== -1 && index === this.SectionUIStartIndex[1])) {
            return 2;
        }
        else {
            return 1;
        }
    }

    private getAffectedSectionForDownwardMove(index: number): number{
        const moreForSection3 = (this.FirstPathSubjectTopics.length === 0 ? 1 : 0) + (this.SecondPathSubjectTopics.length === 0 ? 1 : 0);
        const moreForSection2 = this.FirstPathSubjectTopics.length === 0 ? 1 : 0;
        if ((this.SectionStartIndex [2] > 0 && (index >= this.SectionStartIndex [2] + 1 + moreForSection3))
            || (this.SectionUIStartIndex[2] !== -1 && index === this.SectionUIStartIndex[2] - 1)) {
            return 3;
        }
        if ((this.SectionStartIndex [1] > 0 && (index >= this.SectionStartIndex [1] + moreForSection2))
            || (this.SectionUIStartIndex[1] !== -1 && index === this.SectionUIStartIndex[1] - 1)) {
            return 2;
        }
        return 1;
    }

    private adjustTopicIndexes(list: LearningPathSubjectTopicListViewModel[], newIndex: number, oldIndex: number,
                               itemMovedUp: boolean): void {
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
            body: 'Are you sure you want to discard changes made to the arrangement of topics'
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
        this.AllPathSubjectTopics = [];
        for (const el of this.CopyAllPathSubjectTopics) {
            this.AllPathSubjectTopics.push({
                id: el.id,
                name: el.name,
                index: el.index,
                isActive: el.isActive
            });
        }
        this.SectionStartIndex[0] = this.CopySectionStartIndex[0];
        this.SectionStartIndex[1] = this.CopySectionStartIndex[1];
        this.SectionStartIndex[2] = this.CopySectionStartIndex[2];
        this.sortTopics(this.AllPathSubjectTopics, true);
        this.rearrangeStarted = false;
    }

    saveDragSort(): void {
        this.modalRef = this.modalService.open(ConfirmActionComponent, this.modalConfig);
        this.modalRef.componentInstance.ModalContent = {
            heading: 'Save Changes',
            action: 'Save Changes',
            body: 'Are you sure you want to save changes made to the arrangement of topics'
        };
        this.modalRef.componentInstance.completeAction.subscribe(
            () => {
                // close modal
                this.modalRef.close();

                // delete
                this.completeSaveDragSort();
            }
        );
    }

    private completeSaveDragSort(): void {
        // upload new list
        if (this.rearrangeStarted) {
            this.updateTopicListOnServer(
                false,
                (): void => {
                    this.rearrangeStarted = false;
                    this.notify.success('Topic arrangement was saved successfully!');
                },
                (): void => {
                    this.notify.error('Problem saving changes!');
                }
            );
        }
    }


    // Remove
    removeTopic(PathSubjectTopic: LearningPathSubjectTopicListViewModel): void {
        this.modalRef = this.modalService.open(ConfirmDeleteComponent, this.modalConfig);
        this.modalRef.componentInstance.ModalContent = {
            item: 'Topic',
            action: 'Remove'
        };
        this.modalRef.componentInstance.completeDelete.subscribe(
            () => {
                // close modal
                this.modalRef.close();

                // delete
                this.confirmRemove(PathSubjectTopic);
            }
        );
    }

    private confirmRemove(PathSubjectTopic: LearningPathSubjectTopicListViewModel): void {
        // show remove modal if category can de deleted
        this.modalRef = this.modalService.open(DeleteItemNameConfirmComponent, this.modalConfig);
        this.modalRef.componentInstance.ModalContent = {
            item: 'Topic',
            action: 'Remove',
            extraMessage: 'Please be informed that this action cannot be reversed!',
            correctName: PathSubjectTopic.name
        };
        this.modalRef.componentInstance.completeDelete.subscribe(
            (response: string) => {
                // remove
                this.completeRemove(PathSubjectTopic, this.modalRef);
            }
        );
    }

    private completeRemove(PathSubjectTopic: LearningPathSubjectTopicListViewModel, modalRef: NgbModalRef): void {
        // send info to back end to remove topic
        this.adminLearningPathsTopicService.deleteLearningPathSubjectTopic(this.Path.id, this.Subject, PathSubjectTopic)
        .subscribe(

            // success
            // if success, reload content
            (response) => {
                // tell front end to reload page
                this.reloadPage();
                modalRef.close();
                this.notify.success('Topic was removed successfully!');
            },

            // error
            // else show error message
            error => {
                modalRef.close();
                this.modalRef = this.modalService.open(ShowInfoComponent, this.modalConfig);
                this.modalRef.componentInstance.ModalContent = {
                    title: 'Topic cannot be removed',
                    message: 'This topic cannot be removed because:'
                        + '<ul><li>It is only attached to ' + this.Path.name + ' ' + this.Subject.name
                        + ' and lessons have been created for this topic</li></ul>'
                        + 'Consider <span class="font-weight-600">deactivating</span> the topic as an alternative',
                    icon: 'warning'
                };
            }
        );

    }


    // Edit
    activateSelected(): void {
        this.modalRef = this.modalService.open(ConfirmActionComponent, this.modalConfig);
        this.modalRef.componentInstance.ModalContent = {
            heading: 'Activate Topics',
            action: 'Activate',
            body: 'Are you sure you want to activate the selected topics',
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
        this.SelectedTopicsThatNeedUpdate = [];
        foundNeed = this.checkForUpdateNeed(this.FirstPathSubjectTopics, true);
        foundNeed = this.checkForUpdateNeed(this.SecondPathSubjectTopics, true) === true ? true : foundNeed;
        foundNeed = this.checkForUpdateNeed(this.ThirdPathSubjectTopics, true) === true ? true : foundNeed;

        // upload new list
        if (foundNeed) {
            this.updateTopicListOnServer(
                true,
                (): void => {
                    // update UI
                    this.updateTopicForUI(this.FirstPathSubjectTopics);
                    this.updateTopicForUI(this.SecondPathSubjectTopics);
                    this.updateTopicForUI(this.ThirdPathSubjectTopics);
                    modRef.close();

                    this.notify.success('Topics were activated successfully!');
                    this.SelectedTopics = [];
                    this.SelectedTopicsThatNeedUpdate = [];
                },
                (): void => {
                    this.notify.error('Problem activating topics!');
                    modRef.close();
                }
            );
        } else {
            this.notify.success('Topics were activated successfully!');
            this.SelectedTopics = [];
            this.SelectedTopicsThatNeedUpdate = [];
            modRef.close();
        }
    }

    deactivateSelected(): void {
        this.modalRef = this.modalService.open(ConfirmActionComponent, this.modalConfig);
        this.modalRef.componentInstance.ModalContent = {
            heading: 'Deactivate Topics',
            action: 'Deactivate',
            body: 'Are you sure you want to deactivate the selected topics',
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
        this.SelectedTopicsThatNeedUpdate = [];
        foundNeed = this.checkForUpdateNeed(this.FirstPathSubjectTopics, false);
        foundNeed = this.checkForUpdateNeed(this.SecondPathSubjectTopics, false) === true ? true : foundNeed;
        foundNeed = this.checkForUpdateNeed(this.ThirdPathSubjectTopics, false) === true ? true : foundNeed;

        // upload new list
        if (foundNeed) {
            this.updateTopicListOnServer(
                true,
                (): void => {
                    // update UI
                    this.updateTopicForUI(this.FirstPathSubjectTopics);
                    this.updateTopicForUI(this.SecondPathSubjectTopics);
                    this.updateTopicForUI(this.ThirdPathSubjectTopics);

                    // close modal
                    modRef.close();

                    this.notify.success('Topics were deactivated successfully!');
                    this.SelectedTopics = [];
                    this.SelectedTopicsThatNeedUpdate = [];
                },
                (): void => {
                    this.notify.error('Problem deactivating topics!');
                    modRef.close();
                }
            );
        } else {
            this.notify.success('Topics were dactivated successfully!');
            this.SelectedTopics = [];
            this.SelectedTopicsThatNeedUpdate = [];
            modRef.close();
        }
    }

    uUpdateSingleTopic(PathSubjectTopic: LearningPathSubjectTopicListViewModel): void {
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
    }

    updateSingleTopic(PathSubjectTopic: LearningPathSubjectTopicListViewModel): void {
        if (PathSubjectTopic.isActive === 'true') {
            PathSubjectTopic.isActive = true;
        } else {
            PathSubjectTopic.isActive = false;
        }
        this.SelectedTopicsThatNeedUpdate = [];
        this.SelectedTopicsThatNeedUpdate.push(PathSubjectTopic.id);

        this.updateTopicListOnServer(
            false,
            (): void => {
                // modRef.close();
                this.notify.success('Change was saved!');
                this.SelectedTopicsThatNeedUpdate = [];
            },
            (): void => {
                // modRef.close();
                this.notify.error('Change failed!');
                PathSubjectTopic.isActive = !PathSubjectTopic.isActive;
            }
        );
    }

    private checkForUpdateNeed(list: LearningPathSubjectTopicListViewModel[], activate: boolean): boolean {
        let foundNeed = false;
        list.forEach((element: LearningPathSubjectTopicListViewModel) => {
            if (this.SelectedTopics.some(o => o.id === element.id) && element.isActive !== activate) {
                foundNeed = true;
                this.SelectedTopicsThatNeedUpdate.push(element.id);
            }
        });
        return foundNeed;
    }

    private updateTopicListOnServer(pendingUIUpdate: boolean, positiveCallback: () => void, negativeCallback: () => void): void{

        // gather list
        const UpdateTopicList: LPSubjectTopicsAndSectionsViewModel = new LPSubjectTopicsAndSectionsViewModel();
        UpdateTopicList.section1 = this.SectionStartIndex[0];
        UpdateTopicList.section2 = this.SectionStartIndex[1];
        UpdateTopicList.section3 = this.SectionStartIndex[2];
        UpdateTopicList.topics = [];

        this.assembleTopicsForUpdate(this.FirstPathSubjectTopics, UpdateTopicList.topics, pendingUIUpdate);
        this.assembleTopicsForUpdate(this.SecondPathSubjectTopics, UpdateTopicList.topics, pendingUIUpdate);
        this.assembleTopicsForUpdate(this.ThirdPathSubjectTopics, UpdateTopicList.topics, pendingUIUpdate);

        // send list to server
        this.adminLearningPathsTopicService.updateLearningPathSubjectTopics(this.Path.id, this.Subject, UpdateTopicList)
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

    private assembleTopicsForUpdate(list: LearningPathSubjectTopicListViewModel[],
                                    listToJoin: LearningPathSubjectTopicListViewModel[], pendingChange: boolean): void {
        list.forEach((element: LearningPathSubjectTopicListViewModel) => {
            listToJoin.push({
                id: element.id,
                name: element.name,
                index: element.index,
                isActive: pendingChange ?
                    (this.SelectedTopicsThatNeedUpdate.find(o => o === element.id) != null ? !element.isActive : element.isActive) 
                    : element.isActive
            });
        });
    }

    private updateTopicForUI(list: LearningPathSubjectTopicListViewModel[]): void {
        list.forEach((element: LearningPathSubjectTopicListViewModel) => {
            if (this.SelectedTopicsThatNeedUpdate.some(o => o === element.id)) {
                element.isActive = !element.isActive;
            }
        });
    }

}
