import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundPageComponent } from './round-page.component';

describe('RoundPageComponent', () => {
  let component: RoundPageComponent;
  let fixture: ComponentFixture<RoundPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoundPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoundPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
