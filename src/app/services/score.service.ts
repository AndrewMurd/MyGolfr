import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ROOT_URL } from '../utilities/enviroment';

@Injectable({
  providedIn: 'root',
})
export class ScoreService {
  selectedScoreData = new BehaviorSubject<any>(null);
  inProgressScoreData = new BehaviorSubject<any>(null);

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

  async getCourse(courseId: string, status: number = 2) {
    return await new Promise((resolve, reject) => {
      this.http
        .get(ROOT_URL + 'scores/score_status', {
          params: new HttpParams().set('courseId', courseId).set('status', status),
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

  async getUser(userId: any, status: number = 2) {
    return await new Promise((resolve, reject) => {
      this.http
        .get(ROOT_URL + 'scores/score_user', {
          params: new HttpParams().set('userId', userId).set('status', status),
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

  async update(scoreData: string, type: string) {
    return await new Promise((resolve, reject) => {
      this.http
        .post(ROOT_URL + 'scores/update', {
          scoreData: scoreData,
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
    hdcpType: string,
    startTime: any
  ) {
    return await new Promise((resolve, reject) => {
      this.http
        .post(ROOT_URL + 'scores/add', {
          userId: userId,
          courseId: courseId,
          teeData: teeData,
          hdcpType: hdcpType,
          startTime: startTime
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

  async delete(scoreId: any) {
    return await new Promise((resolve, reject) => {
      this.http
        .post(ROOT_URL + 'scores/delete', {
          id: scoreId,
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
