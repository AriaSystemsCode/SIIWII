import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AdsSidebarComponent } from './ads-sidebar.component';

describe('AdsSidebarComponent', () => {
  let component: AdsSidebarComponent;
  let fixture: ComponentFixture<AdsSidebarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AdsSidebarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdsSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
