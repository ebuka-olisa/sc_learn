/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AdminLearningPathsLessonPhotoUploadComponent } from './admin-learning-paths-lesson-photo-upload.component';

describe('AdminLearningPathsLessonPhotoUploadComponent', () => {
  let component: AdminLearningPathsLessonPhotoUploadComponent;
  let fixture: ComponentFixture<AdminLearningPathsLessonPhotoUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminLearningPathsLessonPhotoUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminLearningPathsLessonPhotoUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
