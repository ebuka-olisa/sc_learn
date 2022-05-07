import { AdminLearningPathsListComponent } from './components/admin-learning-paths-list/admin-learning-paths-list.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from '../admin-shared/components/admin-layout/admin-layout.component';
import { AdminPageNotFoundComponent } from '../admin-shared/components/admin-page-not-found/admin-page-not-found.component';
import { AdminLearningPathsModalContainerComponent } from './components/admin-learning-paths-modal-container.component';
import { AdminLearningPathsInfoComponent } from './components/admin-learning-paths-info/admin-learning-paths-info.component';
import { AdminLearningPathsBasicInfoComponent } from './components/admin-learning-paths-basic-info/admin-learning-paths-basic-info.component';
import { AdminLearningPathsInfoResolver } from './resolvers/admin-learning-paths-info.resolver';
import { AdminLearningPathsEditModalContainerComponent } from './components/admin-learning-paths-edit-modal-container/admin-learning-paths-edit-modal-container.component';
import { AdminLearningPathsSubjectsComponent } from './components/admin-learning-paths-subjects/admin-learning-paths-subjects.component';
import { AdminLearningPathsTopicsComponent } from './components/admin-learning-paths-topics/admin-learning-paths-topics.component';
import { AdminLearningPathsTopicsResolver } from './resolvers/admin-learning-paths-topics.resolver';
import { CanDeactivateTopics } from './guards/can-deactivate-topics.guard';
import { AdminLearningPathsSubjectTopicModalContainerComponent } from './components/admin-learning-paths-subject-topic-modal-container.component';
import { AdminLearningPathsTopicLessonsComponent } from './components/admin-learning-paths-topic-lessons/admin-learning-paths-topic-lessons.component';
import { CanDeactivateLessons } from './guards/can-deactivate-lessons.guard';
import { AdminLearningPathsTopicLessonsResolver } from './resolvers/admin-learning-paths-topic-lessons.resolver';
import { AdminLearningPathsTopicLessonModalContainerComponent } from './components/admin-learning-paths-topic-lesson-modal-container.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    data: {
      home: '/scl-admin',
      activePage: 'learning paths',
      breadcrumb: [{label: 'Learning Paths', url: ''}]
    },
    children: [
      {
        path: '',
        component: AdminLearningPathsListComponent,
        data: {
          showBackButton: false
        },
        children: [
          {
            path: 'add',
            component: AdminLearningPathsModalContainerComponent,
            data: {
              breadcrumb: [{label: 'Learning Paths', url: ''}],
              showBackButton: false
            }
          }
        ]
      },
      {
        path: ':id',
        component: AdminLearningPathsInfoComponent,
        data: {
          breadcrumb: [
            { label: 'Learning Paths', url: '/scl-admin/learning-paths'},
            { label: 'Overview', url: '' }
          ],
          showBackButton: true,
          parentUrl: '/scl-admin/learning-paths/'
        },
        resolve: {
          path: AdminLearningPathsInfoResolver
        },
        children: [
          {
            path: '',
            component: AdminLearningPathsBasicInfoComponent,
            data: {
              showBackButton: true
            },
            children: [
              {
                path: 'edit',
                component: AdminLearningPathsEditModalContainerComponent,
                data: {
                  breadcrumb: [
                    { label: 'Learning Paths', url: '/scl-admin/learning-paths'},
                    { label: 'Overview', url: '' }
                  ],
                  showBackButton: true
                },
              }
            ]
          },
          {
            path: 'subjects',
            component: AdminLearningPathsSubjectsComponent,
            data: {
              breadcrumb: [
                { label: 'Learning Paths', url: '/scl-admin/learning-paths'},
                { label: 'Subjects', url: '' }
              ],
              showBackButton: true
            },
          }
        ]
      },
      {
        path: ':id/subjects/:subjectId/topics',
        component: AdminLearningPathsTopicsComponent,
        canDeactivate: [CanDeactivateTopics],
        resolve: {
          pathInfo: AdminLearningPathsTopicsResolver
        },
        data: {
          breadcrumb: [
            { label: 'Learning Paths', url: '/scl-admin/learning-paths'},
            { label: 'Subjects', url: '/scl-admin/learning-paths/:id/subjects' },
            { label: 'Topics', url: '' }
          ],
          showBackButton: true,
        },
        children: [
          {
            path: 'add',
            component: AdminLearningPathsSubjectTopicModalContainerComponent,
            data: {
              breadcrumb: [
                { label: 'Learning Paths', url: '/scl-admin/learning-paths'},
                { label: 'Subjects', url: '/scl-admin/learning-paths/:id/subjects' },
                { label: 'Topics', url: '' }
              ],
              showBackButton: false
            },
          },
          {
            path: ':topicId',
            component: AdminLearningPathsSubjectTopicModalContainerComponent,
            data: {
              breadcrumb: [
                { label: 'Learning Paths', url: '/scl-admin/learning-paths'},
                { label: 'Subjects', url: '/scl-admin/learning-paths/:id/subjects' },
                { label: 'Topics', url: '' }
              ],
              showBackButton: false
            },
          }
        ]
      },
      {
        path: ':id/subjects/:subjectId/topics/:topicId/lessons',
        component: AdminLearningPathsTopicLessonsComponent,
        canDeactivate: [CanDeactivateLessons],
        resolve: {
          pathInfo: AdminLearningPathsTopicLessonsResolver
        },
        data: {
          breadcrumb: [
            { label: 'Learning Paths', url: '/scl-admin/learning-paths'},
            { label: 'Subjects', url: '/scl-admin/learning-paths/:id/subjects' },
            { label: 'Topics', url: '/scl-admin/learning-paths/:id/subjects/:subjectId/topics' },
            { label: 'Lessons', url: '' }
          ],
          showBackButton: true,
        },
        children: [
          {
            path: 'add',
            component: AdminLearningPathsTopicLessonModalContainerComponent,
            data: {
              breadcrumb: [
                { label: 'Learning Paths', url: '/scl-admin/learning-paths'},
                { label: 'Subjects', url: '/scl-admin/learning-paths/:id/subjects' },
                { label: 'Topics', url: '/scl-admin/learning-paths/:id/subjects/:subjectId/topics' },
                { label: 'Lessons', url: '' }
              ],
              showBackButton: false
            },
          },
          {
            path: ':lessonId',
            component: AdminLearningPathsTopicLessonModalContainerComponent,
            data: {
              breadcrumb: [
                { label: 'Learning Paths', url: '/scl-admin/learning-paths'},
                { label: 'Subjects', url: '/scl-admin/learning-paths/:id/subjects' },
                { label: 'Topics', url: '/scl-admin/learning-paths/:id/subjects/:subjectId/topics' },
                { label: 'Lessons', url: '' }
              ],
              showBackButton: false
            },
          }
        ]
      },
      {
        path: '**',
        component: AdminPageNotFoundComponent,
        data: {
          breadcrumbs: 'Page Not Found', /*[
            {label: 'Subjects', url: '/scl-admin/subjects'},
            {label: 'Page Not Found', url: ''}
          ],*/
          showBackButton: false
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminLearningPathsRoutingModule { }
