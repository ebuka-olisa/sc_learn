/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PreloaderService } from './preloader.service';

describe('Service: Preloader', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PreloaderService]
    });
  });

  it('should ...', inject([PreloaderService], (service: PreloaderService) => {
    expect(service).toBeTruthy();
  }));
});
