import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleModificationComponent } from './role-modification.component';

describe('RoleModificationComponent', () => {
  let component: RoleModificationComponent;
  let fixture: ComponentFixture<RoleModificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoleModificationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleModificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
