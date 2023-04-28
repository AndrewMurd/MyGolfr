import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AggregateSelectComponent } from './aggregate-select.component';

describe('AggregateSelectComponent', () => {
  let component: AggregateSelectComponent;
  let fixture: ComponentFixture<AggregateSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AggregateSelectComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AggregateSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
