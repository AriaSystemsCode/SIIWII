import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopCompanyComponent } from './top-company.component';

describe('TopCompanyComponent', () => {
  let component: TopCompanyComponent;
  let fixture: ComponentFixture<TopCompanyComponent>;

  beforeEach(async(() => {
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
