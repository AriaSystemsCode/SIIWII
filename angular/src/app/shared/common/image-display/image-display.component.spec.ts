import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ImageDisplayComponent } from './image-display.component';

describe('ImageDisplayComponent', () => {
  let component: ImageDisplayComponent;
  let fixture: ComponentFixture<ImageDisplayComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
