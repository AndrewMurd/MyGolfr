import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorecardInputComponent } from './scorecard-input.component';

describe('ScorecardInputComponent', () => {
  let component: ScorecardInputComponent;
  let fixture: ComponentFixture<ScorecardInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScorecardInputComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScorecardInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
