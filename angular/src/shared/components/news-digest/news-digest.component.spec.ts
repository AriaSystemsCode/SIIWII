import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NewsDigestComponent } from './news-digest.component';

describe('NewsDigestComponent', () => {
  let component: NewsDigestComponent;
  let fixture: ComponentFixture<NewsDigestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NewsDigestComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewsDigestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
