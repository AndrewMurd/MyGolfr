import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveScorecardComponent } from './active-scorecard.component';

describe('ActiveScorecardComponent', () => {
  let component: ActiveScorecardComponent;
  let fixture: ComponentFixture<ActiveScorecardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActiveScorecardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveScorecardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
