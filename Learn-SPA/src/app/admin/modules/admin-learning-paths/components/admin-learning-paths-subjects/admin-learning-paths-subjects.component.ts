import { LearningPathSubjectUpdateViewModel } from './../../../../../models/learning-path';
import { NotificationService } from './../../../../../services/notification.service';
import { Component, ElementRef, OnInit, Renderer2, ViewChild, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { LearningPathEditViewModel, LearningPathSubjectListViewModel } from 'src/app/models/learning-path';
import { AdminLearningPathsInfoComponent } from '../admin-learning-paths-info/admin-learning-paths-info.component';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AdminLearningPathsAddSubjectComponent } from '../admin-learning-paths-add-subject/admin-learning-paths-add-subject.component';
import { Pagination } from 'src/app/models/pagaination';
import { ConfirmDeleteComponent } from '../../../admin-shared/components/confirm-delete/confirm-delete.component';
import { ShowInfoComponent } from '../../../admin-shared/components/show-info/show-info.component';
import { DeleteItemNameConfirmComponent } from '../../../admin-shared/components/delete-item-name-confirm/delete-item-name-confirm.component';
import { ConfirmActionComponent } from '../../../admin-shared/components/confirm-action/confirm-action.component';
import { AdminLearningPathsService } from '../../services/admin-learning-paths.service';

@Component({
    selector: 'app-admin-learning-paths-subjects',
    templateUrl: './admin-learning-paths-subjects.component.html',
    styleUrls: ['./admin-learning-paths-subjects.component.scss']
})
export class AdminLearningPathsSubjectsComponent implements OnInit, OnDestroy {

    PathSubjects: LearningPathSubjectListViewModel[] = [];
    Path: LearningPathEditViewModel = new LearningPathEditViewModel();

    Filter: {[status: string]: string | null} = { status: null};
    SelectedFilter: {status: string | null} = { status : null};
    filtered = false;
    FilteredElements: any[] = [];

    @ViewChild('searchText', {static: false}) searchText!: ElementRef;
    lastSearchTerm: string | null = null;
    private searchTerms = new Subject<string>();

    contentLoading = false;
    pagination!: Pagination;

    modalRef !: NgbModalRef;
    selectModalConfig: NgbModalOptions = {
        centered: true,
        keyboard: false,
        backdrop: 'static'
    };
    modalConfig: NgbModalOptions = {
        centered: true,
        keyboard: true,
        backdrop: 'static'
    };

    triggeredByButton = false;
    SelectedSubjects: LearningPathSubjectListViewModel[] = [];
    SelectedSubjectsThatNeedUpdate: number[] = [];

    constructor(private parentComponent: AdminLearningPathsInfoComponent,
                private adminLearningPathsService: AdminLearningPathsService,
                private notify: NotificationService,
                private modalService: NgbModal,
                private renderer: Renderer2) {
        parentComponent.activeTab = 2;

        // initialize pagination parameters
        this.pagination = {
            currentPage: 1,
            itemsPerPage: 20,
            totalCount: 0,
            maxSize: 5,
            rotate: true
        };

        // manage outside clicks
        this.renderer.listen('window', 'click', (e: Event ) => {
            // If a previous holder is found, it means it was clicked by another button
            this.PathSubjects.forEach((element: LearningPathSubjectListViewModel) => {
                if (this.triggeredByButton){
                    if (element.previousButtonHolder) {
                        element.holdButtonAppearance = false;
                        element.previousButtonHolder = false;
                    }
                } else {
                    element.holdButtonAppearance = false;
                }
            });

            this.triggeredByButton = false;
       });
    }

    ngOnInit(): void {
        this.PathSubjects = this.parentComponent.PathSubjects.result;
        this.pagination.currentPage = this.parentComponent.PathSubjects.pagination.currentPage;
        this.pagination.totalCount = this.parentComponent.PathSubjects.pagination.totalCount;
        this.Path = this.parentComponent.Path;
        this.setupSearch();
    }

    ngOnDestroy(): void {
        if (this.modalRef) {
            this.modalRef.close();
        }
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
                return this.adminLearningPathsService.getLearningPathSubjects(this.Path.id, this.Filter.status,
                    1, this.pagination.itemsPerPage, term);
            })
        ).subscribe(response => {
            this.pagination.currentPage = response.pagination.currentPage;
            this.pagination.totalCount = response.pagination.totalCount;

            this.PathSubjects = response.result;

            // remove selected topics that are no longer available
            this.dropUnavailableSelections();

            this.contentLoading = false;
        });
    }

    // Content Loading Operations

    reloadPage(): void {
        this.searchText.nativeElement.value = '';
        this.setupSearch();
        this.lastSearchTerm = null;
        this.loadLearningPathSubjects(1, true);
    }

    pageChanged(newPageNumber: number): void {
        this.pagination.currentPage = newPageNumber;
        this.loadLearningPathSubjects();
        window.scrollTo(0, 0);
    }


    // Search Operations
    search(term: string): void {
        this.searchTerms.next(term.trim());
        this.lastSearchTerm = term;
    }

    private dropUnavailableSelections(): void {
        for (let i = this.SelectedSubjects.length - 1; i >= 0; i--) {
            const foundIem = this.PathSubjects.find(o => o.id === this.SelectedSubjects[i].id);
            if (!foundIem) {
                this.SelectedSubjects.splice(i, 1);
            }
        }
    }


    // Filter Opeations
    private loadLearningPathSubjects(pageNumber?: number, updateParent?: boolean): void {
        this.contentLoading = true;

        // ensure this uses search and filter
        this.adminLearningPathsService.getLearningPathSubjects(this.Path.id, this.Filter.status, pageNumber, this.pagination.itemsPerPage,
            this.lastSearchTerm == null ? undefined : this.lastSearchTerm)
        .subscribe(
            // success
            response => {
                this.pagination.currentPage = response.pagination.currentPage;
                this.pagination.totalCount = response.pagination.totalCount;

                this.PathSubjects = response.result;
                if (updateParent) {
                    this.parentComponent.updatePathSubjects(this.PathSubjects);
                }

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
                this.notify.error('Problem loading learning path subjects, please reload page.');
                this.contentLoading = false;
            }
        );
    }

    clearFilter(): void {
        this.Filter.status = null;
        if (this.filtered) {
            this.loadLearningPathSubjects();
        }
    }

    handleFilterOpen(): void {
        // return to previous settings
        this.Filter.status = this.SelectedFilter.status;
    }

    removeFilter(key: string, index?: number): void {
        this.Filter[key] = null;
        this.loadLearningPathSubjects();
    }

    filter(): void {
        this.loadLearningPathSubjects();
    }


    // UI Operations
    toggleButtonAppearance(PathSubject: LearningPathSubjectListViewModel): void {
        this.PathSubjects.forEach((element: LearningPathSubjectListViewModel) => {
            if (element.holdButtonAppearance && element.id !== PathSubject.id) {
                element.previousButtonHolder = true;
            }
        });
        if (PathSubject.holdButtonAppearance) {
            PathSubject.holdButtonAppearance = false;
        } else {
            PathSubject.holdButtonAppearance = true;
        }

        this.triggeredByButton = true;
    }


    // Add
    showAddSubjectModal(): void {
        const initialState = {
            PathId: this.Path.id,
            CurrentPathSubjects: this.PathSubjects.filter(x => x.isParent === false)
        };
        this.modalRef = this.modalService.open(AdminLearningPathsAddSubjectComponent, this.selectModalConfig);
        this.modalRef.componentInstance.initialState = initialState;
        this.modalRef.componentInstance.completeSubjectAdd.subscribe(
            () => {
                this.modalRef.close();
                this.reloadPage();
            }
        );
    }


    // Edit
    toggleSubject(lpSubject: LearningPathSubjectListViewModel): void {
        const index = this.SelectedSubjects.findIndex(o => o.id === lpSubject.id);
        if (index === -1) {
            this.SelectedSubjects.push(lpSubject);
        } else {
            this.SelectedSubjects.splice(index, 1);
        }
    }

    isSubjectSelected(id: number): boolean {
        const selected = this.SelectedSubjects.some(o => o.id === id);
        return selected;
    }

    activateSelected(): void {
        this.modalRef = this.modalService.open(ConfirmActionComponent, this.modalConfig);
        this.modalRef.componentInstance.ModalContent = {
            heading: 'Activate Subjects',
            action: 'Activate',
            body: 'Are you sure you want to activate the selected subjects',
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
        this.SelectedSubjectsThatNeedUpdate = [];
        const foundNeed = this.checkForUpdateNeed(this.PathSubjects, true);

        // upload new list
        if (foundNeed) {
            this.updateSubjectListOnServer(
                true,
                (): void => {
                    // update UI
                    this.updateSubjectForUI(this.PathSubjects);
                    modRef.close();

                    this.notify.success('Subjects were activated successfully!');
                    this.SelectedSubjects = [];
                    this.SelectedSubjectsThatNeedUpdate = [];
                },
                (): void => {
                    modRef.close();
                    this.notify.error('Problem activating subjects!');
                }
            );
        } else {
            modRef.close();
            this.notify.success('Subjects were activated successfully!');
            this.SelectedSubjects = [];
            this.SelectedSubjectsThatNeedUpdate = [];
        }
    }

    deactivateSelected(): void {
        this.modalRef = this.modalService.open(ConfirmActionComponent, this.modalConfig);
        this.modalRef.componentInstance.ModalContent = {
            heading: 'Deactivate Subjects',
            action: 'Deactivate',
            body: 'Are you sure you want to deactivate the selected subjects',
            buttonColor: 'red'
        };
        this.modalRef.componentInstance.completeAction.subscribe(
            () => {
                this.completeDeactivateSelected(this.modalRef);
            }
        );
    }

    private completeDeactivateSelected(modRef: NgbModalRef): void {
        this.SelectedSubjectsThatNeedUpdate = [];
        const foundNeed = this.checkForUpdateNeed(this.PathSubjects, false);

        // upload new list
        if (foundNeed) {
            this.updateSubjectListOnServer(
                true,
                (): void => {
                    // update UI
                    this.updateSubjectForUI(this.PathSubjects);
                    modRef.close();

                    this.notify.success('Subjects were deactivated successfully!');
                    this.SelectedSubjects = [];
                    this.SelectedSubjectsThatNeedUpdate = [];
                },
                (): void => {
                    modRef.close();
                    this.notify.error('Problem activating subject!');
                }
            );
        } else {
            modRef.close();
            this.notify.success('Subjects were dactivated successfully!');
            this.SelectedSubjects = [];
            this.SelectedSubjectsThatNeedUpdate = [];
        }
    }

    uUpdateSingleSubject(PathSubject: LearningPathSubjectListViewModel): void {
        let activate = false;
        if (PathSubject.isActive === 'true') {
            activate = true;
        }
        this.modalRef = this.modalService.open(ConfirmActionComponent, this.modalConfig);
        this.modalRef.componentInstance.ModalContent = {
            heading: activate ? 'Activate Subject' : 'Deactivate Subject',
            action: activate ? 'Activate' : 'Deactivate',
            body: 'Are you sure you want to ' + (activate ? '' : 'deactivate') + 'this subject',
            buttonColor: activate ? 'green' : 'red'
        };
        this.modalRef.result.then((data) => {
            // on close
            if (PathSubject.isActive === 'true') {
                PathSubject.isActive = false;
            } else {
                PathSubject.isActive = true;
            }
        }, (reason) => {
            // on dismiss
            if (PathSubject.isActive === 'true') {
                PathSubject.isActive = false;
            } else {
                PathSubject.isActive = true;
            }
        });
        this.modalRef.componentInstance.completeAction.subscribe(
            () => {
                // this.completeUpdateSingleSubject(PathSubject, this.modalRef);
            }
        );
    }

    updateSingleSubject(PathSubject: LearningPathSubjectListViewModel): void {
        if (PathSubject.isActive === 'true') {
            PathSubject.isActive = true;
        } else {
            PathSubject.isActive = false;
        }
        this.SelectedSubjectsThatNeedUpdate = [];
        this.SelectedSubjectsThatNeedUpdate.push(PathSubject.id);

        this.updateSubjectListOnServer(
            false,
            (): void => {
                // modRef.close();
                this.notify.success('Change was saved!');
                this.SelectedSubjectsThatNeedUpdate = [];
            },
            (): void => {
                // modRef.close();
                this.notify.error('Change failed!');
                PathSubject.isActive = !PathSubject.isActive;
            }
        );
    }

    private updateSubjectListOnServer(pendingUIUpdate: boolean, positiveCallback: () => void, negativeCallback: () => void): void{

        // gather list
        const SelectedSubjects: LearningPathSubjectUpdateViewModel[] = [];
        this.PathSubjects.forEach((element: LearningPathSubjectListViewModel) => {
            if (!element.isParent) {
                SelectedSubjects.push({
                    id: element.id,
                    name: element.name,
                    active: pendingUIUpdate ?
                        (this.SelectedSubjectsThatNeedUpdate.find(o => o === element.id) != null ? !element.isActive : element.isActive)
                        : element.isActive
                });
            }
        });

        // send list to server
        this.adminLearningPathsService.updateLearningPathSubjects(this.Path.id, SelectedSubjects)
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

    private checkForUpdateNeed(list: LearningPathSubjectListViewModel[], activate: boolean): boolean {
        let foundNeed = false;
        list.forEach((element: LearningPathSubjectListViewModel) => {
            if (!element.isParent && this.SelectedSubjects.some(o => o.id === element.id) && element.isActive !== activate) {
                foundNeed = true;
                this.SelectedSubjectsThatNeedUpdate.push(element.id);
            }
        });
        return foundNeed;
    }

    private updateSubjectForUI(list: LearningPathSubjectListViewModel[]): void {
        list.forEach((element: LearningPathSubjectListViewModel) => {
            if (this.SelectedSubjectsThatNeedUpdate.some(o => o === element.id)) {
                element.isActive = !element.isActive;
            }
        });
    }


    // Remove
    removeSubject(PathSubject: LearningPathSubjectListViewModel): void {
        // show remove modal if category can de deleted
        if (PathSubject.canDelete === true) {
            this.modalRef = this.modalService.open(ConfirmDeleteComponent, this.modalConfig);
            this.modalRef.componentInstance.ModalContent = {
                item: 'Subject',
                action: 'Remove'
            };
            this.modalRef.componentInstance.completeDelete.subscribe(
                () => {
                    // close modal
                    this.modalRef.close();

                    // delete
                    this.confirmDelete(PathSubject);
                }
            );
        } else {
            // tell user that this item cannot be removed
            this.modalRef = this.modalService.open(ShowInfoComponent, this.modalConfig);
            this.modalRef.componentInstance.ModalContent = {
                title: 'Subject In Use',
                message: 'This subject cannot be remove either because of one or more reasons'
                    + '<ul><li>It has topics within this learning path</li>'
                    + '<li>Challenges have been created within this subject</li>'
                    + '<li>Students have started going through the lessons in this subject</li></ul>',
                icon: 'warning'
            };
        }
    }

    confirmDelete(PathSubject: LearningPathSubjectListViewModel): void {
        // show remove modal if category can de deleted
        this.modalRef = this.modalService.open(DeleteItemNameConfirmComponent, this.modalConfig);
        this.modalRef.componentInstance.ModalContent = {
            item: 'Subject',
            action: 'Remove',
            extraMessage: 'Please be informed that this action cannot be reversed!',
            correctName: PathSubject.name
        };
        this.modalRef.componentInstance.completeDelete.subscribe(
            (response: string) => {
                // delete
                this.completeDelete(PathSubject, this.modalRef);
            }
        );
    }

    completeDelete(PathSubject: LearningPathSubjectListViewModel, modalRef: NgbModalRef): void {

        // remove subject from list
        if (!PathSubject.isParent) {
            const subIndex = this.PathSubjects.indexOf(PathSubject);
            this.PathSubjects.splice(subIndex, 1);
        }

        // upload new list
        this.updateSubjectListOnServer(
            false,
            (): void => {
                this.notify.success('Subject was removed successfully!');
                modalRef.close();
            },
            (): void => {
                this.notify.error('Error removing subject!');
                modalRef.close();
            }
        );
    }

}
