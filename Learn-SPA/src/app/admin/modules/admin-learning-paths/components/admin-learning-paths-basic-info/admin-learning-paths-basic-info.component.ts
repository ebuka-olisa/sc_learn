import { AdminLearningPathsInfoComponent } from './../admin-learning-paths-info/admin-learning-paths-info.component';
import { Component, OnInit } from '@angular/core';
import { LearningPathEditViewModel } from 'src/app/models/learning-path';

@Component({
    selector: 'app-admin-learning-paths-basic-info',
    templateUrl: './admin-learning-paths-basic-info.component.html',
    styleUrls: ['./admin-learning-paths-basic-info.component.scss']
})
export class AdminLearningPathsBasicInfoComponent implements OnInit {

    Path = new LearningPathEditViewModel();

    constructor(private parentComponent: AdminLearningPathsInfoComponent) {}

    ngOnInit(): void {
        this.Path = this.parentComponent.Path;
    }


    // Parent Operations
    showParent(): string {
        let parent = '';
        if (this.Path.parent) {
            parent = `${this.Path.parent.name} > ` ;
        }
        return parent;
    }

    updatePath(pathInfo: LearningPathEditViewModel): void {
        this.Path = pathInfo;
        this.parentComponent.updatePath(pathInfo);
    }

}
