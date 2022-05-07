/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AdminLearningPathsLessonService } from './admin-learning-paths-lesson.service';

describe('Service: AdminLearningPathsLesson', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminLearningPathsLessonService]
    });
  });

  it('should ...', inject([AdminLearningPathsLessonService], (service: AdminLearningPathsLessonService) => {
    expect(service).toBeTruthy();
  }));
});
