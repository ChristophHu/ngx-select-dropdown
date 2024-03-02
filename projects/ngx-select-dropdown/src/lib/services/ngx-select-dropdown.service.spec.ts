import { TestBed } from '@angular/core/testing';

import { NgxSelectDropdownService } from './ngx-select-dropdown.service';

describe('NgxSelectDropdownService', () => {
  let service: NgxSelectDropdownService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxSelectDropdownService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
