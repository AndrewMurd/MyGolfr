import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveTeeComponent } from './active-tee.component';

describe('ActiveTeeComponent', () => {
  let component: ActiveTeeComponent;
  let fixture: ComponentFixture<ActiveTeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActiveTeeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveTeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
