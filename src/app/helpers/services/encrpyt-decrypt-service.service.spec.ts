import { TestBed } from '@angular/core/testing';

import { EncrpytDecryptServiceService } from './encrpyt-decrypt-service.service';

describe('EncrpytDecryptServiceService', () => {
  let service: EncrpytDecryptServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EncrpytDecryptServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
