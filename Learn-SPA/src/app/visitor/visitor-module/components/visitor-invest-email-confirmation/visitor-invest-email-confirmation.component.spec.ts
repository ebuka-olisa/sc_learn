/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { VisitorInvestEmailConfirmationComponent } from './visitor-invest-email-confirmation.component';

describe('VisitorInvestEmailConfirmationComponent', () => {
  let component: VisitorInvestEmailConfirmationComponent;
  let fixture: ComponentFixture<VisitorInvestEmailConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisitorInvestEmailConfirmationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisitorInvestEmailConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
