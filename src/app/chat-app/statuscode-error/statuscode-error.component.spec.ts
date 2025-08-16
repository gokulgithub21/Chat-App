import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatuscodeErrorComponent } from './statuscode-error.component';

describe('StatuscodeErrorComponent', () => {
  let component: StatuscodeErrorComponent;
  let fixture: ComponentFixture<StatuscodeErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatuscodeErrorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatuscodeErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
