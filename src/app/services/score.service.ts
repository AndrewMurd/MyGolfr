import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ROOT_URL } from '../utilities/enviroment';

// interface for manipulating round/score info in database
@Injectable({
  providedIn: 'root',
})
export class ScoreService {
  selectedScoreData = new BehaviorSubject<any>(null); // currently selected course/round
  inProgressScoreData = new BehaviorSubject<any>(null); // in progress score/round

  constructor(private http: HttpClient) {}
  // get score
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
  // get scores from a course
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
  // get scores for a user
  async getUser(userId: any, status: number = 2, limit: number = 20) {
    return await new Promise((resolve, reject) => {
      this.http
        .get(ROOT_URL + 'scores/score_user', {
          params: new HttpParams().set('userId', userId).set('status', status).set('limit', limit),
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
  // update a score
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
  // add new score to database
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
  // delete a score
  async delete(scoreData: any) {
    return await new Promise((resolve, reject) => {
      this.http
        .post(ROOT_URL + 'scores/delete', {
          scoreData: scoreData,
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
