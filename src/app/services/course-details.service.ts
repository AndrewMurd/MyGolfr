import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ROOT_URL } from '../utilities/enviroment';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CourseDetailsService {
  courseData = new BehaviorSubject<any>(null);
  editingScoreCard = new BehaviorSubject<any>(false);
  
  constructor(private http: HttpClient) {}

  async searchCourses(searchString: string) {
    return await new Promise((resolve, reject) => {
      this.http
        .get(ROOT_URL + 'courses/search_courses', {
          params: new HttpParams().set('searchQuery', searchString),
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

  async updateColumn(courseId: string, data: any, type: string) {
    return await new Promise((resolve, reject) => {
      this.http
        .post(ROOT_URL + 'courses/update_column', {
          id: courseId,
          data: data,
          type: type,
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

  async update(data: any) {
    return await new Promise((resolve, reject) => {
      this.http
        .post(ROOT_URL + 'courses/update', {
          data: data
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

  async get(id: string) {
    return await new Promise((resolve, reject) => {
      this.http
        .get(ROOT_URL + 'courses/course', {
          params: new HttpParams().set('id', id),
        })
        .subscribe({
          next: (data: any) => {
            return resolve(data);
          },
          error: (error) => {
            return reject(error);
          },
        });
    });
  }

  async getCourses(ids: any) {
    return await new Promise((resolve, reject) => {
      this.http
        .post(ROOT_URL + 'courses/courses', {
          ids: ids
        })
        .subscribe({
          next: (data: any) => {
            return resolve(data);
          },
          error: (error) => {
            return reject(error);
          },
        });
    });
  }

  async getCoursesByClicks(limit: number) {
    return await new Promise((resolve, reject) => {
      this.http
        .post(ROOT_URL + 'courses/courses_clicks', {
          limit: limit
        })
        .subscribe({
          next: (data: any) => {
            return resolve(data);
          },
          error: (error) => {
            return reject(error);
          },
        });
    });
  }

  async setScorecardValue(courseId: string, data: any) {
    return await new Promise((resolve, reject) => {
      this.http
        .post(ROOT_URL + 'courses/set_scorecard_value', {
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

  async addClick(courseId: string) {
    return await new Promise((resolve, reject) => {
      this.http
        .post(ROOT_URL + 'courses/add_click', {
          id: courseId,
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

  // not going to use but its there :| use setScorecard instead
  async deleteTee(courseId: string, teeId: any) {
    return await new Promise((resolve, reject) => {
      this.http
        .delete(ROOT_URL + 'courses/delete_tee', {
          params: new HttpParams()
            .set('courseId', courseId)
            .set('teeId', teeId),
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
