import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewGolfCourseScoreCardComponent } from './edit-score-card.component';

describe('NewGolfCourseScoreCardComponent', () => {
  let component: NewGolfCourseScoreCardComponent;
  let fixture: ComponentFixture<NewGolfCourseScoreCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewGolfCourseScoreCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewGolfCourseScoreCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
