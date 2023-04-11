import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialTabComponent } from './social-tab.component';

describe('SocialTabComponent', () => {
  let component: SocialTabComponent;
  let fixture: ComponentFixture<SocialTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SocialTabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocialTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
