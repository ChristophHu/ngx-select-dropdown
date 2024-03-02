import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxSelectDropdownComponent } from './ngx-select-dropdown.component';

describe('NgxSelectDropdownComponent', () => {
  let component: NgxSelectDropdownComponent;
  let fixture: ComponentFixture<NgxSelectDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxSelectDropdownComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NgxSelectDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
