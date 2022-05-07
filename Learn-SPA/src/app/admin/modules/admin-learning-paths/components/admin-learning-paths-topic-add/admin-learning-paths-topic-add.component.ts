import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbActiveModal, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { LearningPathListViewModel } from 'src/app/models/learning-path';
import { MyValidationErrors } from 'src/app/models/my-validation-error';
import { SubjectEditViewModel } from 'src/app/models/subject';
import { LearningPathSubjectTopicCreateViewModel, LearningPathSubjectTopicListViewModel, 
    LearningPathSubjectTopicUpdateViewModel, Topic, LPSubjectTopicsAndSectionsViewModel } from 'src/app/models/topic';
import { NotificationService } from 'src/app/services/notification.service';
import { ValidationErrorService } from 'src/app/services/validation-error.service';
import { AdminSharedService } from '../../../admin-shared/admin-shared.service';
import { ConfirmExitComponent } from '../../../admin-shared/components/confirm-exit/confirm-exit.component';
import { AdminLearningPathsTopicService } from '../../services/admin-learning-paths-topic.service';
import { AdminLearningPathsTopicAddExistingComponent } from '../admin-learning-paths-topic-add-existing/admin-learning-paths-topic-add-existing.component';

@Component({
    selector: 'app-admin-learning-paths-topic-add',
    templateUrl: './admin-learning-paths-topic-add.component.html',
    styleUrls: ['./admin-learning-paths-topic-add.component.scss']
})
export class AdminLearningPathsTopicAddComponent implements OnInit, OnDestroy {

    @ViewChild('myForm', {static: false}) private myForm!: NgForm;

    @Input() initialState: any;

    @Output() topicCreated = new EventEmitter<any>();
    @Output() topicEdited = new EventEmitter<any>();
    @Output() topicsAdded = new EventEmitter<any>();

    editLearningPathTopicReady = true;
    LearningPathTopic!: LearningPathSubjectTopicCreateViewModel;
    TopicSharedLearningPaths: LearningPathListViewModel[] = [];
    OriginalLearningPathTopic!: string;

    fieldErrors: any = {};
    processing!: boolean;
    deleting!: boolean;
    editMode!: boolean;

    activeTab = 0;

    modalRef !: NgbModalRef;
    modalConfig: NgbModalOptions = {
        centered: true,
        keyboard: false,
        backdrop: 'static'
    };

    descriptionTextAreaReady = false;
    descriptionTextAreaConfig: any;

    subjectReady = false;
    Subject!: SubjectEditViewModel;

    LPSubjectInfoReady = false;
    SectionStartIndex: number[] = [];
    Topics: LearningPathSubjectTopicListViewModel[] = [];
    ExistingTopics: LearningPathSubjectTopicUpdateViewModel[] = [];

    constructor(private activeModal: NgbActiveModal,
                private modalService: NgbModal,
                private adminLearningPathsTopicService: AdminLearningPathsTopicService,
                private validationErrorService: ValidationErrorService,
                private notify: NotificationService,
                adminSharedService: AdminSharedService) {

        this.LearningPathTopic = new LearningPathSubjectTopicCreateViewModel();
        this.LearningPathTopic.topic = new Topic();

        this.descriptionTextAreaConfig = adminSharedService.DescriptionTextAreaConfig;
        // this.selectizeConfig = adminSharedService.NormalSelectizeConfig;
    }

    ngOnInit(): void {

        // if in edit mode
        if (this.initialState && this.initialState.Topic) {
            this.editMode = true;

            // clone original object so that changes do not reflect on the list view
            this.LearningPathTopic = JSON.parse(JSON.stringify(this.initialState.Topic));
            this.LearningPathTopic.topic = new Topic();
            this.LearningPathTopic.learningPathId = this.initialState.PathId;
            this.LearningPathTopic.subjectId = this.initialState.SubjectId;

            // get more information from server
            this.getLearningPathTopicForEdit();

            this.LPSubjectInfoReady = true;
            this.subjectReady = true;
        } else {
            // this.Subject.deactivated = 'false';
            this.LearningPathTopic.isActive = false;
            this.LearningPathTopic.learningPathId = Number.parseInt(this.initialState.PathId, 10);
            this.LearningPathTopic.subjectId = Number.parseInt(this.initialState.SubjectId, 10);
            this.OriginalLearningPathTopic = JSON.stringify(this.LearningPathTopic);

            // get lpsubject info
            this.getLPSubjectInfo();

            // get subject info
            this.getSubjectInfo();
        }
    }

    ngOnDestroy(): void {
        if (this.modalRef) {
            this.modalRef.close();
        }
    }

    close(): void {
        if (!this.changesMade()) {
            this.activeModal.dismiss();
        } else {
            // show another modal asking to discard changes
            this.modalRef = this.modalService.open(ConfirmExitComponent, this.modalConfig);
            this.modalRef.componentInstance.closeEditModal.subscribe(
                () => {
                    this.modalRef.close();
                    this.activeModal.dismiss();
                }
            );
        }
    }


    // Loading Operations
    private getLearningPathTopicForEdit(): void {
        this.editLearningPathTopicReady = false;

        this.adminLearningPathsTopicService.getLearningPathTopicInfo(this.LearningPathTopic.learningPathId, 
            this.LearningPathTopic.subjectId, this.LearningPathTopic.id)
        .subscribe(
            // success
            response => {
                this.LearningPathTopic.topic.name = response.name;
                this.LearningPathTopic.topic.description = response.description;
                this.TopicSharedLearningPaths = response.learningPath;
                // this.LearningPathTopic.isActive = response.isActive ? 'true' : 'false';

                // get copy of subject to determine if change has been made
                this.OriginalLearningPathTopic = JSON.stringify(this.LearningPathTopic);

                this.editLearningPathTopicReady = true;
            },

            // error
            error => {
                this.notify.error('Problem loading topic information, please reload page.');
                this.editLearningPathTopicReady = false;
                this.activeModal.dismiss();
            }
        );
    }

    private getLPSubjectInfo(): void{
        this.LPSubjectInfoReady = false;
        this.adminLearningPathsTopicService.getLearningPathSubjectTopics(this.LearningPathTopic.learningPathId,
            this.LearningPathTopic.subjectId, null)
        .subscribe(
            // success
            response => {
                this.SectionStartIndex[0] = response.section1;
                this.SectionStartIndex[1] = response.section2;
                this.SectionStartIndex[2] = response.section3;
                this.Topics = response.topics;

                this.LPSubjectInfoReady = true;
            },

            // error
            error => {
                this.notify.error('Problem loadiing learning path subject information, please reload page.');
                this.LPSubjectInfoReady = false;
                this.activeModal.dismiss();
            }
        );
    }

    private getSubjectInfo(): void{
        this.subjectReady = false;
        this.adminLearningPathsTopicService.getSubject(this.LearningPathTopic.subjectId)
        .subscribe(
            // success
            response => {
                this.Subject = response;

                this.subjectReady = true;
            },

            // error
            error => {
                this.notify.error('Problem loadiing learning path subject information, please reload page.');
                this.subjectReady = false;
                this.activeModal.dismiss();
            }
        );
    }


    // UI Operations
    showParent(path: LearningPathListViewModel): string {
        let parent = '';
        if (path.parent) {
            parent = `${path.parent.name} > ` ;
        }
        return parent;
    }


    // Description Operations
    descriptionReady(): void {
        this.descriptionTextAreaReady = true;
    }

    hasDescription(): boolean {
        return (this.ExistingTopics.length === 0 && this.LearningPathTopic.topic.description !== undefined
            && this.LearningPathTopic.topic.description !== null && this.LearningPathTopic.topic.description.length > 0)
            || this.ExistingTopics.length > 0;
    }


    // Changes
    changesMade(): boolean {
        /*if (!this.editMode) {
            return false;
        }*/
        const topicInfoChanged = this.OriginalLearningPathTopic !== JSON.stringify(this.LearningPathTopic);
        // const propertiesInfoChanged = this.OriginalExtraAttributes !== JSON.stringify(this.ExtraAttributes);
        return topicInfoChanged;
    }

    // Create, Edit
    loadExistingTopics(): void {
        const initialState = {
            PathId: this.LearningPathTopic.learningPathId,
            SubjectId: this.LearningPathTopic.subjectId,
            SelectedTopics: this.ExistingTopics
            // CurrentTopics: this.Topics
        };
        this.modalRef = this.modalService.open(AdminLearningPathsTopicAddExistingComponent, this.modalConfig);
        this.modalRef.componentInstance.initialState = initialState;
        this.modalRef.componentInstance.completeTopicAdd.subscribe(
            (existingTopics: LearningPathSubjectTopicUpdateViewModel[]) => {
                this.modalRef.close();

                // add existing topics to be added to the UI
                this.ExistingTopics = existingTopics;

                // clear topic name, replace with div to hold topic names
                this.LearningPathTopic.topic.name = '';

                // clear and disable description
                this.LearningPathTopic.topic.description = '';
            }
        );
    }

    removeExistingTopic(index: number): void {
        this.ExistingTopics.splice(index, 1);
    }

    save(): void {
        this.processing = true;
        this.fieldErrors = {};

        // create new object to contain topic information
        const topicObj: LearningPathSubjectTopicCreateViewModel = JSON.parse(JSON.stringify(this.LearningPathTopic));

        if (!this.editMode) {
            if (this.ExistingTopics.length === 0) {
                this.processTopicIndex(topicObj);
                this.createNewLearningPathTopic(topicObj);
            } else {
                const exTopics: LearningPathSubjectTopicUpdateViewModel[] = Object.assign([], this.ExistingTopics);
                const stIndex = this.getFirstTopicIndexForExistingTopics(exTopics[0], this.LearningPathTopic.section);
                exTopics.forEach((el, idx, arr) => {
                    el.index = stIndex + idx;
                });
                this.addExistingLearningPathTopics(exTopics);
            }
        } else {
            this.editLearningPathTopic(topicObj);
        }
    }

    private processTopicIndex(topicObj: LearningPathSubjectTopicCreateViewModel): void{
        if (topicObj.section === '3') {
            topicObj.index = this.Topics.length + 1;
        } else if (topicObj.section === '2'){
            if (this.SectionStartIndex[2] !== 0){
                topicObj.index = this.SectionStartIndex[2];
            }
            else {
                topicObj.index = this.Topics.length + 1;
            }
        } else if (topicObj.section === '1'){
            if (this.SectionStartIndex[1] !== 0){
                topicObj.index = this.SectionStartIndex[1];
            }
            else {
                if (this.SectionStartIndex[2] !== 0 ) {
                    topicObj.index = this.SectionStartIndex[2];
                } else {
                    topicObj.index = this.Topics.length + 1;
                }
            }
        }
    }

    private getFirstTopicIndexForExistingTopics(topicObj: LearningPathSubjectTopicUpdateViewModel, section: string | number): number {
        if (section === '3') {
            return this.Topics.length + 1;
        } else if (section === '2'){
            if (this.SectionStartIndex[2] !== 0){
                return this.SectionStartIndex[2];
            }
            else {
                return this.Topics.length + 1;
            }
        } else {
            if (this.SectionStartIndex[1] !== 0){
                return this.SectionStartIndex[1];
            }
            else {
                if (this.SectionStartIndex[2] !== 0 ) {
                    return this.SectionStartIndex[2];
                } else {
                    return this.Topics.length + 1;
                }
            }
        }
    }

    private createNewLearningPathTopic(topicObj: LearningPathSubjectTopicCreateViewModel): void {

        this.adminLearningPathsTopicService.createLearningPathTopic(topicObj)
        .subscribe(

            // success
            (response) => {
                // tell parent component to reload category list
                this.topicCreated.emit();
                this.processing = false;
            },

            // error
            error => {
                const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error);
                this.fieldErrors = allErrors.fieldErrors;
                if (this.fieldErrors.error && this.fieldErrors.error.indexOf('name') !== -1) {
                    this.fieldErrors.Name = this.fieldErrors.error;
                }
                this.processing = false;
            }
        );
    }

    private addExistingLearningPathTopics(topicObjs: LearningPathSubjectTopicUpdateViewModel[]): void {
        const uploadObj = new LPSubjectTopicsAndSectionsViewModel();
        uploadObj.topics = [];
        topicObjs.forEach((el, idx, arrr) => {
            uploadObj.topics.push({
                id: el.id,
                index: el.index,
                isActive: el.isActive,
                name: el.name
            });
        });
        this.adminLearningPathsTopicService.addExistingLearningPathTopic(this.LearningPathTopic.learningPathId,
            this.LearningPathTopic.subjectId, this.LearningPathTopic.section, uploadObj)
        .subscribe(

            // success
            (response) => {
                // tell parent component to reload category list
                this.topicsAdded.emit(topicObjs.length);
                this.processing = false;
            },

            // error
            error => {
                const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error);
                this.fieldErrors = allErrors.fieldErrors;
                if (this.fieldErrors.error && this.fieldErrors.error.indexOf('name') !== -1) {
                    this.fieldErrors.Name = this.fieldErrors.error;
                }
                this.processing = false;
            }
        );
    }

    private editLearningPathTopic(topicObj: LearningPathSubjectTopicCreateViewModel): void {
        // if changes were made to staff information then update staff
        if (this.OriginalLearningPathTopic !== JSON.stringify(topicObj)) {
            this.adminLearningPathsTopicService.editLearningPathTopic(topicObj)
            .subscribe(

                // success
                (response) => {
                    this.topicEdited.emit();
                    this.processing = false;
                },

                // error
                error => {
                    const allErrors: MyValidationErrors = this.validationErrorService.showValidationErrors(error);
                    this.fieldErrors = allErrors.fieldErrors;
                    if (this.fieldErrors.error && this.fieldErrors.error.indexOf('name') !== - 1) {
                        this.fieldErrors.Name = this.fieldErrors.error;
                    }
                    this.processing = false;
                }
            );
        }
    }

}
