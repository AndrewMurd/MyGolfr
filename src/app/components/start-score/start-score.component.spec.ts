import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartScoreComponent } from './start-score.component';

describe('StartScoreComponent', () => {
  let component: StartScoreComponent;
  let fixture: ComponentFixture<StartScoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StartScoreComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StartScoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
