import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorecardTeeComponent } from './scorecard-tee.component';

describe('ScorecardTeeComponent', () => {
  let component: ScorecardTeeComponent;
  let fixture: ComponentFixture<ScorecardTeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScorecardTeeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScorecardTeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
