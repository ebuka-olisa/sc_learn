/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AdminLoginService } from './admin-login.service';

describe('Service: AdminLogin', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminLoginService]
    });
  });

  it('should ...', inject([AdminLoginService], (service: AdminLoginService) => {
    expect(service).toBeTruthy();
  }));
});
