import { AdminLearningPathsTopicsComponent } from './components/admin-learning-paths-topics/admin-learning-paths-topics.component';
import { AdminLearningPathsAddSubjectComponent } from './components/admin-learning-paths-add-subject/admin-learning-paths-add-subject.component';
import { AdminLearningPathsSubjectsComponent } from './components/admin-learning-paths-subjects/admin-learning-paths-subjects.component';
import { AdminLearningPathsBasicInfoComponent } from './components/admin-learning-paths-basic-info/admin-learning-paths-basic-info.component';
import { AdminLearningPathsInfoComponent } from './components/admin-learning-paths-info/admin-learning-paths-info.component';
import { AdminLearningPathsListComponent } from './components/admin-learning-paths-list/admin-learning-paths-list.component';
import { AdminLearningPathsRoutingModule } from './admin-learning-paths-routing.module';
import { NgModule } from '@angular/core';
import { AdminSharedModule } from '../admin-shared/admin-shared.module';
import { AdminLearningPathsModalContainerComponent } from './components/admin-learning-paths-modal-container.component';
import { AdminLearningPathsAddComponent } from './components/admin-learning-paths-add/admin-learning-paths-add.component';
import { AdminLearningPathsInfoResolver } from './resolvers/admin-learning-paths-info.resolver';
import { AdminLearningPathsTopicsResolver } from './resolvers/admin-learning-paths-topics.resolver';
import { CanDeactivateTopics } from './guards/can-deactivate-topics.guard';
import { AdminLearningPathSubjectsAddTopicComponent } from './components/admin-learning-path-subjects-add-topic/admin-learning-path-subjects-add-topic.component';
import { AdminLearningPathsSubjectTopicModalContainerComponent } from './components/admin-learning-paths-subject-topic-modal-container.component';
import { AdminLearningPathsTopicAddComponent } from './components/admin-learning-paths-topic-add/admin-learning-paths-topic-add.component';
import { AdminLearningPathsEditModalContainerComponent } from './components/admin-learning-paths-edit-modal-container/admin-learning-paths-edit-modal-container.component';
import { AdminLearningPathsTopicAddExistingComponent } from './components/admin-learning-paths-topic-add-existing/admin-learning-paths-topic-add-existing.component';
import { AdminLearningPathsTopicLessonsComponent } from './components/admin-learning-paths-topic-lessons/admin-learning-paths-topic-lessons.component';
import { CanDeactivateLessons } from './guards/can-deactivate-lessons.guard';
import { AdminLearningPathsService } from './services/admin-learning-paths.service';
import { AdminLearningPathsTopicService } from './services/admin-learning-paths-topic.service';
import { AdminLearningPathsLessonService } from './services/admin-learning-paths-lesson.service';
import { AdminLearningPathsTopicLessonsResolver } from './resolvers/admin-learning-paths-topic-lessons.resolver';
import { AdminLearningPathsLessonsAddComponent } from './components/admin-learning-paths-lessons-add/admin-learning-paths-lessons-add.component';
import { AdminLearningPathsTopicLessonModalContainerComponent } from './components/admin-learning-paths-topic-lesson-modal-container.component';
import { CodeEditorModule } from '@ngstack/code-editor';
import { AdminLearningPathsLessonPhotoUploadComponent } from './components/admin-learning-paths-lesson-photo-upload/admin-learning-paths-lesson-photo-upload.component';

@NgModule({
  imports: [
    AdminSharedModule,
    AdminLearningPathsRoutingModule,
    CodeEditorModule.forChild()
  ],
  declarations: [
    AdminLearningPathsListComponent,
    AdminLearningPathsModalContainerComponent,
    AdminLearningPathsEditModalContainerComponent,
    AdminLearningPathsAddComponent,
    AdminLearningPathsInfoComponent,
    AdminLearningPathsBasicInfoComponent,
    AdminLearningPathsSubjectsComponent,
    AdminLearningPathsAddSubjectComponent,
    AdminLearningPathsTopicsComponent,
    AdminLearningPathSubjectsAddTopicComponent,
    AdminLearningPathsSubjectTopicModalContainerComponent,
    AdminLearningPathsTopicAddComponent,
    AdminLearningPathsTopicAddExistingComponent,
    AdminLearningPathsTopicLessonsComponent,
    AdminLearningPathsTopicLessonModalContainerComponent,
    AdminLearningPathsLessonsAddComponent,
    AdminLearningPathsLessonPhotoUploadComponent
  ],
  providers: [
    AdminLearningPathsService,
    AdminLearningPathsTopicService,
    AdminLearningPathsLessonService,
    AdminLearningPathsInfoResolver,
    AdminLearningPathsTopicsResolver,
    AdminLearningPathsTopicLessonsResolver,
    CanDeactivateTopics,
    CanDeactivateLessons
  ]
})
export class AdminLearningPathsModule { }
