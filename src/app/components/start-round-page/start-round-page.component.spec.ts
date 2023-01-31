import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartRoundPageComponent } from './start-round-page.component';

describe('StartRoundPageComponent', () => {
  let component: StartRoundPageComponent;
  let fixture: ComponentFixture<StartRoundPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StartRoundPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StartRoundPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
