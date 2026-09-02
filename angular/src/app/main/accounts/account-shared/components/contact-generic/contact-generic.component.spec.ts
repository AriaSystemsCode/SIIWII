import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactGenericComponent } from './contact-generic.component';

describe('ContactGenericComponent', () => {
  let component: ContactGenericComponent;
  let fixture: ComponentFixture<ContactGenericComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContactGenericComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactGenericComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
