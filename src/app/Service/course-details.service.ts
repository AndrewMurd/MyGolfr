import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CourseDetailsService {
  private course$ = new BehaviorSubject<any>({});
  selectedCourse$ = this.course$.asObservable();
  constructor() {}

  setCourse(course: any) {
    this.course$.next(course);
  }
}
