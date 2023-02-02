import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorecardHeaderComponent } from './scorecard-header.component';

describe('ScorecardHeaderComponent', () => {
  let component: ScorecardHeaderComponent;
  let fixture: ComponentFixture<ScorecardHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScorecardHeaderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScorecardHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
