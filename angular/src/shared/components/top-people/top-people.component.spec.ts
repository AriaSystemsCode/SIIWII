import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopPeopleComponent } from './top-people.component';

describe('TopPeopleComponent', () => {
  let component: TopPeopleComponent;
  let fixture: ComponentFixture<TopPeopleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopPeopleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopPeopleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
