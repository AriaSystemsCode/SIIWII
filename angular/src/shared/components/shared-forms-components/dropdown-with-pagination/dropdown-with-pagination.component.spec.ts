import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownWithPaginationComponent } from './dropdown-with-pagination.component';

describe('DropdownWithPaginationComponent', () => {
  let component: DropdownWithPaginationComponent;
  let fixture: ComponentFixture<DropdownWithPaginationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DropdownWithPaginationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DropdownWithPaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
