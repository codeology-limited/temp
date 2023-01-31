import { TestBed } from '@angular/core/testing';

import { BackendService } from './backend.service';
import {AppComponent} from "../app.component";
import {HttpClient, HttpClientModule} from "@angular/common/http";

describe('BackendService', () => {
  let service: BackendService;

  beforeEach(() => {

    TestBed.configureTestingModule({
      providers:[
        HttpClient
      ],
      imports: [
        HttpClientModule
      ]
    }).compileComponents();

    service = TestBed.inject(BackendService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
