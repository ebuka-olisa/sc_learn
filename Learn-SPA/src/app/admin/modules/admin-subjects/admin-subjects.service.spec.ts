/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AdminSubjectsService } from './admin-subjects.service';

describe('Service: AdminSubjects', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminSubjectsService]
    });
  });

  it('should ...', inject([AdminSubjectsService], (service: AdminSubjectsService) => {
    expect(service).toBeTruthy();
  }));
});
