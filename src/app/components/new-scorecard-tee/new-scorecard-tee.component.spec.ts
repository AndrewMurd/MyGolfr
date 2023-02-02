import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewScorecardTeeComponent } from './new-scorecard-tee.component';

describe('NewScorecardTeeComponent', () => {
  let component: NewScorecardTeeComponent;
  let fixture: ComponentFixture<NewScorecardTeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewScorecardTeeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewScorecardTeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
