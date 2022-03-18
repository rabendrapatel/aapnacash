import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferToFfmcComponent } from './transfer-to-ffmc.component';

describe('TransferToFfmcComponent', () => {
  let component: TransferToFfmcComponent;
  let fixture: ComponentFixture<TransferToFfmcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransferToFfmcComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferToFfmcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
