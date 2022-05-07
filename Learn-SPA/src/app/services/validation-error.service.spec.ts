/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ValidationErrorService } from './validation-error.service';

describe('Service: ValidationError', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ValidationErrorService]
    });
  });

  it('should ...', inject([ValidationErrorService], (service: ValidationErrorService) => {
    expect(service).toBeTruthy();
  }));
});
