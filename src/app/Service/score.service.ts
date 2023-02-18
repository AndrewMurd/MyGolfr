import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ROOT_URL } from '../utilities/enviroment';

@Injectable({
  providedIn: 'root',
})
export class ScoreService {
  constructor(private http: HttpClient) {}

  async get(id: string) {
    return await new Promise((resolve, reject) => {
      this.http
        .get(ROOT_URL + 'scores/score', {
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

  async getStatus(status: boolean) {
    return await new Promise((resolve, reject) => {
      this.http
        .get(ROOT_URL + 'scores/score_status', {
          params: new HttpParams().set('status', status),
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

  async newScore(userId: string, courseId: string, courseData: any) {
    return await new Promise((resolve, reject) => {
      this.http
        .post(ROOT_URL + 'scores/add', {
          userId: userId,
          courseId: courseId,
          courseData: courseData,
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
