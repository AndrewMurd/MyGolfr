import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundsPageComponent } from './rounds-page.component';

describe('RoundsPageComponent', () => {
  let component: RoundsPageComponent;
  let fixture: ComponentFixture<RoundsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoundsPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoundsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
