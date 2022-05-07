import { LearningPathSubjectListViewModel } from './../../../../../models/learning-path';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { LearningPathEditViewModel } from 'src/app/models/learning-path';
import { AdminLayoutComponent } from '../../../admin-shared/components/admin-layout/admin-layout.component';
import { PaginatedResult } from 'src/app/models/pagaination';

@Component({
    selector: 'app-admin-learning-paths-info',
    templateUrl: './admin-learning-paths-info.component.html',
    styleUrls: ['./admin-learning-paths-info.component.scss']
})
export class AdminLearningPathsInfoComponent implements OnInit {

    Path: LearningPathEditViewModel = new LearningPathEditViewModel();
    PathSubjects: PaginatedResult<LearningPathSubjectListViewModel[]>;
    activeTab = 1;

    constructor(private route: ActivatedRoute,
                private parentComponent: AdminLayoutComponent,
                private titleService: Title) {

        this.PathSubjects = new PaginatedResult<LearningPathSubjectListViewModel[]>();
    }

    ngOnInit(): void {
        // get learning path info
        this.route.data.subscribe(data => {
            this.Path = data.path.pathInfo;
            this.PathSubjects.pagination = data.path.pathSubjects.pagination;
            this.PathSubjects.result = data.path.pathSubjects.result;
        });

        this.setPageTitle();
    }

    setPageTitle(): void {
        // get path name
        let PageHeadingPrefix = '';
        if (this.Path.parent) {
            PageHeadingPrefix = `${this.Path.parent.name} > `;
        }

        // set page title
        this.titleService.setTitle(PageHeadingPrefix + this.Path.name + ' | Accave');

        // set page heading
        setTimeout(() => {
            this.parentComponent.PageHeadingPrefix = PageHeadingPrefix;
            this.parentComponent.PageHeading = this.Path.name;
            this.parentComponent.PageSubHeading = '';
        });
    }

    updatePath(pathInfo: LearningPathEditViewModel): void {
        this.Path = pathInfo;

        this.setPageTitle();
    }

    updatePathSubjects(pathSubjectsInfo: LearningPathSubjectListViewModel[]): void {
        this.PathSubjects.result = pathSubjectsInfo;
    }

}
