import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachmentUploaderComponent } from './attachment-uploader.component';

describe('AttachmentUploaderComponent', () => {
  let component: AttachmentUploaderComponent;
  let fixture: ComponentFixture<AttachmentUploaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttachmentUploaderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttachmentUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
