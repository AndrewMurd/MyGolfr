import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  loading = new BehaviorSubject<any>(false); // turn on and off loading for entire app

  constructor() {}
}
