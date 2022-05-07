/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AdminLearningPathsTopicAddExistingComponent } from './admin-learning-paths-topic-add-existing.component';

describe('AdminLearningPathsTopicAddExistingComponent', () => {
  let component: AdminLearningPathsTopicAddExistingComponent;
  let fixture: ComponentFixture<AdminLearningPathsTopicAddExistingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminLearningPathsTopicAddExistingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminLearningPathsTopicAddExistingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
