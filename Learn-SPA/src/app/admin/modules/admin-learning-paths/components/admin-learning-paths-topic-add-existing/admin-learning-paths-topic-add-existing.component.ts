import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { LearningPathListViewModel } from 'src/app/models/learning-path';
import { LearningPathSubjectTopicUpdateViewModel } from 'src/app/models/topic';
import { PaginatedResult, Pagination } from 'src/app/models/pagaination';
import { NotificationService } from 'src/app/services/notification.service';
import { AdminLearningPathsTopicService } from '../../services/admin-learning-paths-topic.service';

@Component({
  selector: 'app-admin-learning-paths-topic-add-existing',
  templateUrl: './admin-learning-paths-topic-add-existing.component.html',
  styleUrls: ['./admin-learning-paths-topic-add-existing.component.scss']
})
export class AdminLearningPathsTopicAddExistingComponent implements OnInit {

    @Output() completeTopicAdd = new EventEmitter<any>();
    @Input() initialState: any;

    @ViewChild('searchText', {static: false}) searchText!: ElementRef;
    lastSearchTerm: string | null = null;
    private searchTerms = new Subject<string>();

    SelectedTopics: LearningPathSubjectTopicUpdateViewModel[] = [];

    topicsReady = false;
    processing = false;
    contentLoading = false;

    PathId!: number;
    SubjectId!: number;
    Topics: LearningPathSubjectTopicUpdateViewModel[] = [];
    filteredItems: LearningPathSubjectTopicUpdateViewModel[] = [];
    pagination!: Pagination;

    Search!: string;

    constructor(private activeModal: NgbActiveModal,
                private adminLearningPathsTopicService: AdminLearningPathsTopicService,
                private notify: NotificationService) {

        // initialize pagination parameters
        this.pagination = {
            currentPage: 1,
            itemsPerPage: 10,
            totalCount: 0,
            maxSize: 5,
            rotate: true
        };
    }

    ngOnInit(): void {
        // Get path id
        if (this.initialState && this.initialState.SubjectId) {
            this.PathId = this.initialState.PathId;
            this.SubjectId = this.initialState.SubjectId;
            this.SelectedTopics = this.filteredItems = Object.assign([], this.initialState.SelectedTopics);

            // fetch list of topics not in the learning path subject
            this.loadExistingTopics(true);
        } else {
            this.notify.error('Problem loading topics, please try again.');
            this.topicsReady = true;
        }

        this.setupSearch();
    }


    // loading operations
    private loadExistingTopics(globalWatcher: boolean): void {
        this.adminLearningPathsTopicService.getLearningPathTopicsBySubject(this.PathId, this.SubjectId, this.pagination.currentPage,
            this.pagination.itemsPerPage, this.lastSearchTerm == null ? undefined : this.lastSearchTerm)
            .subscribe(
                // success
                response => {
                    this.processTopics(response);

                    // done
                    globalWatcher ? this.topicsReady = true : this.contentLoading = false;
                },

                // error
                () => {
                    this.notify.error('Problem loading topics, please try again.');
                    globalWatcher ? this.topicsReady = true : this.contentLoading = false;
                }
            );
    }

    private processTopics(response: PaginatedResult<LearningPathSubjectTopicUpdateViewModel[]>): void{
        this.pagination.currentPage = response.pagination.currentPage;
        this.pagination.totalCount = response.pagination.totalCount;

        this.Topics = response.result;
    }

    pageChanged(newPageNumber: number): void {
        this.pagination.currentPage = newPageNumber;
        this.loadExistingTopics(false);
        this.contentLoading = true;
        // window.scrollTo(0, 0);
    }

    close(): void {
        this.activeModal.dismiss();
    }


    // Search Operations
    setupSearch(): void {
        this.searchTerms.pipe(
            // wait 500ms after each keystroke before considering the term
            debounceTime(400),

            // ignore new term if same as previous term
            distinctUntilChanged(),

            // switch to new search observable each time the term changes
            switchMap((term: string) => {
                this.contentLoading = true;
                return this.adminLearningPathsTopicService.getLearningPathTopicsBySubject(this.PathId, this.SubjectId, 1,
                    this.pagination.itemsPerPage, term);
            })
        ).subscribe(response => {
            this.processTopics(response);

            this.contentLoading = false;
        });
    }

    search(term: string): void {
        this.searchTerms.next(term);
        this.lastSearchTerm = term;
    }


    // UI Operations
    showParent(Path: LearningPathListViewModel | undefined): string {
        let parent = '';
        if (Path?.parent) {
            parent = `${Path.parent.name} > ` ;
        }
        return parent;
    }


    // Select & Save
    toggleTopic(sub: LearningPathSubjectTopicUpdateViewModel): void {
        const index = this.SelectedTopics.findIndex(o => o.id === sub.id);
        if (index === -1) {
            this.SelectedTopics.push({
                id: sub.id,
                index: 0,
                name: sub.name,
                isActive: true
            });
        } else {
            this.SelectedTopics.splice(index, 1);
        }
    }

    isTopicSelected(id: number): boolean {
        const selected = this.SelectedTopics.some(o => o.id === id);
        return selected;
    }

    save(): void {
        this.completeTopicAdd.emit(this.SelectedTopics);
    }

}
