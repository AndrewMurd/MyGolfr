import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundInProgressPageComponent } from './round-in-progress-page.component';

describe('RoundInProgressPageComponent', () => {
  let component: RoundInProgressPageComponent;
  let fixture: ComponentFixture<RoundInProgressPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoundInProgressPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoundInProgressPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
