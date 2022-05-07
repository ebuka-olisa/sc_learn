/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AdminLearningPathsService } from './admin-learning-paths.service';

describe('Service: AdminLearningPaths', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminLearningPathsService]
    });
  });

  it('should ...', inject([AdminLearningPathsService], (service: AdminLearningPathsService) => {
    expect(service).toBeTruthy();
  }));
});
