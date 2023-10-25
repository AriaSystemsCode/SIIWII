import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TopCompanyComponent } from './top-company.component';

describe('TopCompanyComponent', () => {
  let component: TopCompanyComponent;
  let fixture: ComponentFixture<TopCompanyComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TopCompanyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
