/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { VisitorService } from './visitor.service';

describe('Service: Visitor', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VisitorService]
    });
  });

  it('should ...', inject([VisitorService], (service: VisitorService) => {
    expect(service).toBeTruthy();
  }));
});
