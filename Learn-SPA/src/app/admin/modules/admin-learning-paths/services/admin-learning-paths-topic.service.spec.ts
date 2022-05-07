/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AdminLearningPathsTopicService } from './admin-learning-paths-topic.service';

describe('Service: AdminLearningPathsTopic', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminLearningPathsTopicService]
    });
  });

  it('should ...', inject([AdminLearningPathsTopicService], (service: AdminLearningPathsTopicService) => {
    expect(service).toBeTruthy();
  }));
});
