/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AdminLearningPathsLessonsAddComponent } from './admin-learning-paths-lessons-add.component';

describe('AdminLearningPathsLessonsAddComponent', () => {
  let component: AdminLearningPathsLessonsAddComponent;
  let fixture: ComponentFixture<AdminLearningPathsLessonsAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminLearningPathsLessonsAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminLearningPathsLessonsAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
