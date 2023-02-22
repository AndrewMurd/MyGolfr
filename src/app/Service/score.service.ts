import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ROOT_URL } from '../utilities/enviroment';

@Injectable({
  providedIn: 'root',
})
export class ScoreService {
  scoreData = new BehaviorSubject<any>(null);

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

  async update(scoreId: string, data: any, type: string) {
    return await new Promise((resolve, reject) => {
      this.http
        .post(ROOT_URL + 'scores/update', {
          id: scoreId,
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

  async newScore(
    userId: string,
    courseId: string,
    teeData: any,
    dateTime: any
  ) {
    return await new Promise((resolve, reject) => {
      this.http
        .post(ROOT_URL + 'scores/add', {
          userId: userId,
          courseId: courseId,
          teeData: teeData,
          dateTime: dateTime,
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
