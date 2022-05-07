import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { AvatarViewModel } from 'src/app/models/avatar';
import { Pagination } from 'src/app/models/pagaination';
import { NotificationService } from 'src/app/services/notification.service';
import { AdminLayoutComponent } from '../../../admin-shared/components/admin-layout/admin-layout.component';
import { AdminAvatarsService } from '../../admin-avatars.service';

@Component({
    selector: 'app-admin-avatars-list',
    templateUrl: './admin-avatars-list.component.html',
    styleUrls: ['./admin-avatars-list.component.scss']
})
export class AdminAvatarsListComponent implements OnInit {

    contentLoading = false;
    pagination!: Pagination;

    @ViewChild('searchText', {static: false}) searchText!: ElementRef;
    lastSearchTerm: string | null = null;
    private searchTerms = new Subject<string>();

    Avatars: AvatarViewModel[] = [];

    constructor(private titleService: Title,
                parentComponent: AdminLayoutComponent,
                private adminAvatarsService: AdminAvatarsService,
                private notify: NotificationService) {
        // set page title
        this.titleService.setTitle('Avatars | Accave');

        // set page heading
        parentComponent.PageHeadingPrefix = '';
        parentComponent.PageHeading = 'Avatars';
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
        this.loadAvatars();
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
                return this.adminAvatarsService.getAvatarList(1, this.pagination.itemsPerPage, term)
            })
        ).subscribe(response => {
            this.pagination.currentPage = response.pagination.currentPage;
            this.pagination.totalCount = response.pagination.totalCount;

            this.Avatars = response.result;

            this.contentLoading = false;
        });
    }

    // Content Loading Operations
    loadAvatars(pageNumber?: number): void {
        this.contentLoading = true;

        pageNumber = pageNumber || this.pagination.currentPage;
        // ensure this uses search and filter
        this.adminAvatarsService.getAvatarList(pageNumber, this.pagination.itemsPerPage,
            this.lastSearchTerm == null ? undefined : this.lastSearchTerm)
        .subscribe(
            // success
            response => {
                this.pagination.currentPage = response.pagination.currentPage;
                this.pagination.totalCount = response.pagination.totalCount;

                this.Avatars = response.result;

                // done
                this.contentLoading = false;
            },

            // error
            () => {
                this.notify.error('Problem loading avatar list, please reload page.');
                this.contentLoading = false;
            }
        );
    }

    reloadPage(): void {
        this.searchText.nativeElement.value = '';
        this.setupSearch();
        this.lastSearchTerm = null;
        this.loadAvatars(1);
    }

    pageChanged(newPageNumber: number): void {
        this.pagination.currentPage = newPageNumber;
        this.loadAvatars();
        window.scrollTo(0, 0);
    }


    // Search Operations
    search(term: string): void {
        this.searchTerms.next(term);
        this.lastSearchTerm = term;
    }

}
