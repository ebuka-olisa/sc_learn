import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LearningPathSubjectTopicUpdateViewModel, LearningPathSubjectTopicListViewModel } from 'src/app/models/topic';
import { NotificationService } from 'src/app/services/notification.service';
import { ValidationErrorService } from 'src/app/services/validation-error.service';
import { AdminLearningPathsTopicService } from '../../services/admin-learning-paths-topic.service';
import { AdminLearningPathsService } from '../../services/admin-learning-paths.service';

@Component({
    selector: 'app-admin-learning-path-subjects-add-topic',
    templateUrl: './admin-learning-path-subjects-add-topic.component.html',
    styleUrls: ['./admin-learning-path-subjects-add-topic.component.scss']
})
export class AdminLearningPathSubjectsAddTopicComponent implements OnInit {

    @Output() completeTopicAdd = new EventEmitter<any>();
    @Input() initialState: any;

    SelectedTopics: LearningPathSubjectTopicUpdateViewModel[] = [];

    topicsReady = false;
    processing = false;

    PathId!: number;
    Topics: LearningPathSubjectTopicListViewModel[] = [];
    filteredItems: LearningPathSubjectTopicListViewModel[] = [];

    Search!: string;

    constructor(private activeModal: NgbActiveModal,
                private adminLearningPathsService: AdminLearningPathsService,
                private notify: NotificationService) { }

    ngOnInit(): void {
        // Get path id
        if (this.initialState && this.initialState.PathId) {
            this.PathId = this.initialState.PathId;

            // fetch list of subjects not in the learning path
            this.adminLearningPathsService.getSubjectsNotInLearningPath(this.initialState.PathId)
            .subscribe(
                // success
                response => {
                    // this.Topics = response; // .result;
                    this.assignCopy();

                    // done
                    this.topicsReady = true;
                },

                // error
                () => {
                    this.notify.error('Problem loading topics, please try again.');
                    this.topicsReady = true;
                }
            );
        } else {
            this.notify.error('Problem loading topics, please try again.');
            this.topicsReady = true;
        }

        // Get already selected subjects
        if (this.initialState && this.initialState.CurrentPathSubjectTopics) {
            this.initialState.CurrentPathSubjectTopics.forEach((element: LearningPathSubjectTopicListViewModel) => {
                this.SelectedTopics.push({
                    id: element.id,
                    name: element.name,
                    isActive: element.isActive,
                    index: element.index
                });
            });
        }
    }

    close(): void {
        this.activeModal.dismiss();
    }

    assignCopy(): void {
        this.filteredItems = Object.assign([], this.Topics);
    }


    // Search
    filterItem(value: string): void {
        if (!value) {
            this.assignCopy();
        } else {
            const empty: LearningPathSubjectTopicListViewModel[] = [];
            this.filteredItems = Object.assign(empty, this.Topics).filter(
                item => {
                    const selected = item.name.toLowerCase().indexOf(value.toLowerCase()) > -1;
                    return selected;
                }
            );
        }
    }

    // Select & Save
    toggleTopic(sub: LearningPathSubjectTopicListViewModel): void {
        const index = this.SelectedTopics.findIndex(o => o.id === sub.id);
        if (index === -1) {
            this.SelectedTopics.push({
                id: sub.id,
                name: sub.name,
                isActive: true,
                index: sub.index
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
        this.processing = true;

        // send list to back end
        /*this.adminLearningPathsService.updateLearningPathSubjects(this.PathId, this.SelectedTopics)
        .subscribe(

            // success
            (response) => {
                // tell front end to reload page
                this.completeTopicAdd.emit();
            },

            // error
            error => {
                const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error);
                this.processing = false;
            }
        );*/
    }

}
