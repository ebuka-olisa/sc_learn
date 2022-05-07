/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AdminLearningPathSubjectsAddTopicComponent } from './admin-learning-path-subjects-add-topic.component';

describe('AdminLearningPathSubjectssAddTopicComponent', () => {
  let component: AdminLearningPathSubjectsAddTopicComponent;
  let fixture: ComponentFixture<AdminLearningPathSubjectsAddTopicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminLearningPathSubjectsAddTopicComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminLearningPathSubjectsAddTopicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
