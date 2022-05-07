/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AdminSharedService } from './admin-shared.service';

describe('Service: AdminShared', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminSharedService]
    });
  });

  it('should ...', inject([AdminSharedService], (service: AdminSharedService) => {
    expect(service).toBeTruthy();
  }));
});
