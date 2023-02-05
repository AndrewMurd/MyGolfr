import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ROOT_URL } from '../utilities/enviroment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CourseDetailsService {
  // private course$ = new BehaviorSubject<any>({});
  // selectedCourse$ = this.course$.asObservable();
  
  constructor(private http: HttpClient) {}

  // setCourse(course: any) {
  //   this.course$.next(course);
  // }

  async getScorecard(id: string) {
    return await new Promise((resolve, reject) => {
      this.http
        .get(ROOT_URL + 'courses/scorecard', {
          params: new HttpParams().set('id', id),
        })
        .subscribe({
          next: (data) => {
            return resolve(data);
          },
          error: (error) => {
            return reject(error);
          },
        });
    });
  }

  async setScorecard(courseId: string, data: any) {
    return await new Promise((resolve, reject) => {
      this.http
      .post(ROOT_URL + 'courses/set_scorecard', {
        id: courseId,
        data: data,
      })
      .subscribe({
        next: (data) => {
          return resolve(data);
        },
        error: (error) => {
          return reject(error);
        },
      });
    });
  }
}
