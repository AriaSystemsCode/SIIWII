import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppItemsBrowseModalComponent } from './app-items-browse-modal.component';

describe('AppItemsBrowseModalComponent', () => {
  let component: AppItemsBrowseModalComponent;
  let fixture: ComponentFixture<AppItemsBrowseModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppItemsBrowseModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppItemsBrowseModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
