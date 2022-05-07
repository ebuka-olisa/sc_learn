import { ValidationErrorService } from 'src/app/services/validation-error.service';
import { NotificationService } from 'src/app/services/notification.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LearningPathSubjectUpdateViewModel, LearningPathSubjectListViewModel } from 'src/app/models/learning-path';
import { MyValidationErrors } from 'src/app/models/my-validation-error';
import { AdminLearningPathsService } from '../../services/admin-learning-paths.service';

@Component({
    selector: 'app-admin-learning-paths-add-subject',
    templateUrl: './admin-learning-paths-add-subject.component.html',
    styleUrls: ['./admin-learning-paths-add-subject.component.scss']
})
export class AdminLearningPathsAddSubjectComponent implements OnInit {

    @Output() completeSubjectAdd = new EventEmitter<any>();
    @Input() initialState: any;

    SelectedSubjects: LearningPathSubjectUpdateViewModel[] = [];

    subjectsReady = false;
    processing = false;

    PathId!: number;
    Subjects: LearningPathSubjectListViewModel[] = [];
    filteredItems: LearningPathSubjectListViewModel[] = [];

    Search!: string;

    constructor(private activeModal: NgbActiveModal,
                private adminLearningPathsService: AdminLearningPathsService,
                private notify: NotificationService,
                private validationErrorService: ValidationErrorService) { }

    ngOnInit(): void {
        // Get path id
        if (this.initialState && this.initialState.PathId) {
            this.PathId = this.initialState.PathId;

            // fetch list of subjects not in the learning path
            this.adminLearningPathsService.getSubjectsNotInLearningPath(this.initialState.PathId)
            .subscribe(
                // success
                response => {
                    this.Subjects = response; // .result;
                    this.assignCopy();

                    // done
                    this.subjectsReady = true;
                },

                // error
                () => {
                    this.notify.error('Problem loading subjects, please try again.');
                    this.subjectsReady = true;
                }
            );
        } else {
            this.notify.error('Problem loading subjects, please try again.');
            this.subjectsReady = true;
        }

        // Get already selected subjects
        if (this.initialState && this.initialState.CurrentPathSubjects) {
            this.initialState.CurrentPathSubjects.forEach((element: LearningPathSubjectListViewModel) => {
                this.SelectedSubjects.push({
                    id: element.id,
                    name: element.name,
                    active: element.isActive
                });
            });
        }
    }

    close(): void {
        this.activeModal.dismiss();
    }

    assignCopy(): void {
        this.filteredItems = Object.assign([], this.Subjects);
    }


    // Search
    filterItem(value: string): void {
        if (!value) {
            this.assignCopy();
        } else {
            const empty: LearningPathSubjectListViewModel[] = [];
            this.filteredItems = Object.assign(empty, this.Subjects).filter(
                item => {
                    const selected = item.name.toLowerCase().indexOf(value.toLowerCase()) > -1;
                    return selected;
                }
            );
        }
    }

    // Select & Save
    toggleSubject(sub: LearningPathSubjectListViewModel): void {
        const index = this.SelectedSubjects.findIndex(o => o.id === sub.id);
        if (index === -1) {
            this.SelectedSubjects.push({
                id: sub.id,
                name: sub.name,
                active: true
            });
        } else {
            this.SelectedSubjects.splice(index, 1);
        }
    }

    isSubjectSelected(id: number): boolean {
        const selected = this.SelectedSubjects.some(o => o.id === id);
        return selected;
    }

    save(): void {
        this.processing = true;

        // send list to back end
        this.adminLearningPathsService.updateLearningPathSubjects(this.PathId, this.SelectedSubjects)
        .subscribe(

            // success
            (response) => {
                // tell front end to reload page
                this.completeSubjectAdd.emit();
            },

            // error
            error => {
                const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error);
                this.processing = false;
            }
        );
    }

}
