import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TrendingPostsComponent } from './trending-posts.component';

describe('TrendingPostsComponent', () => {
  let component: TrendingPostsComponent;
  let fixture: ComponentFixture<TrendingPostsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TrendingPostsComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrendingPostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
