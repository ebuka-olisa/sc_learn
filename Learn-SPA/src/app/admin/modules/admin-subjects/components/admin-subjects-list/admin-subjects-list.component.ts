import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Pagination } from 'src/app/models/pagaination';
import { SubjectListViewModel } from 'src/app/models/subject';
import { NotificationService } from 'src/app/services/notification.service';
import { AdminLayoutComponent } from '../../../admin-shared/components/admin-layout/admin-layout.component';
import { AdminSubjectsService } from '../../admin-subjects.service';

@Component({
  selector: 'app-admin-subjects-list',
  templateUrl: './admin-subjects-list.component.html',
  styleUrls: ['./admin-subjects-list.component.scss']
})
export class AdminSubjectsListComponent implements OnInit {

    contentLoading = false;
    pagination!: Pagination;

    @ViewChild('searchText', {static: false}) searchText!: ElementRef;
    lastSearchTerm: string | null = null;
    private searchTerms = new Subject<string>();

    Subjects: SubjectListViewModel[] = [];

    Filter: {[status: string]: string | null} = { status: null};
    SelectedFilter: {status: string | null} = { status : null};
    filtered = false;
    FilteredElements: any[] = [];

    constructor(private titleService: Title,
                parentComponent: AdminLayoutComponent,
                private adminSubjectsService: AdminSubjectsService,
                private notify: NotificationService) {
        // set page title
        this.titleService.setTitle('Subjects | Accave');

        // set page heading
        parentComponent.PageHeadingPrefix = '';
        parentComponent.PageHeading = 'Subjects';
        parentComponent.PageSubHeading = '';

        // initialize pagination parameters
        this.pagination = {
            currentPage: 1,
            itemsPerPage: 20,
            totalCount: 0,
            maxSize: 5,
            rotate: true
        };
    }

    ngOnInit(): void {
        this.loadSubjects();
        this.setupSearch();
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
                return this.adminSubjectsService.getSubjectsList(this.Filter.status, 1, this.pagination.itemsPerPage, term);
            })
        ).subscribe(response => {
            this.pagination.currentPage = response.pagination.currentPage;
            this.pagination.totalCount = response.pagination.totalCount;

            this.Subjects = response.result;

            this.contentLoading = false;
        });
    }

    // Content Loading Operations
    loadSubjects(pageNumber?: number): void {
        this.contentLoading = true;

        pageNumber = pageNumber || this.pagination.currentPage;
        // ensure this uses search and filter
        this.adminSubjectsService.getSubjectsList(this.Filter.status, pageNumber, this.pagination.itemsPerPage,
            this.lastSearchTerm == null ? undefined : this.lastSearchTerm)
        .subscribe(
            // success
            response => {
                this.pagination.currentPage = response.pagination.currentPage;
                this.pagination.totalCount = response.pagination.totalCount;

                this.Subjects = response.result;

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

                // done
                this.contentLoading = false;
            },

            // error
            () => {
                this.notify.error('Problem loading subject list, please reload page.');
                this.contentLoading = false;
            }
        );
    }

    reloadPage(): void {
        this.searchText.nativeElement.value = '';
        this.setupSearch();
        this.lastSearchTerm = null;
        this.loadSubjects(1);
    }

    pageChanged(newPageNumber: number): void {
        this.pagination.currentPage = newPageNumber;
        this.loadSubjects();
        window.scrollTo(0, 0);
    }


    // Search Operations
    search(term: string): void {
        this.searchTerms.next(term);
        this.lastSearchTerm = term;
    }


    // Filter Opeations
    clearFilter(): void {
        this.Filter.status = null;
        if (this.filtered) {
            this.loadSubjects(1);
        }
    }

    handleFilterOpen(): void {
        // return to previous settings
        this.Filter.status = this.SelectedFilter.status;
    }

    removeFilter(key: string, index?: number): void {
        this.Filter[key] = null;
        this.loadSubjects(1);
    }

    filter(): void {
        this.loadSubjects(1);
    }

}
