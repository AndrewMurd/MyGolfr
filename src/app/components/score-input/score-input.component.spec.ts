import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreInputComponent } from './score-input.component';

describe('ScoreInputComponent', () => {
  let component: ScoreInputComponent;
  let fixture: ComponentFixture<ScoreInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScoreInputComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
