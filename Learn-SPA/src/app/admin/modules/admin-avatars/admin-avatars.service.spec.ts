/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AdminAvatarsService } from './admin-avatars.service';

describe('Service: AdminAvatars', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminAvatarsService]
    });
  });

  it('should ...', inject([AdminAvatarsService], (service: AdminAvatarsService) => {
    expect(service).toBeTruthy();
  }));
});
