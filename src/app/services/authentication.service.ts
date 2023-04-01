import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { ROOT_URL } from '../utilities/enviroment';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  // if token exists user is logged in otherwise user is not logged in and token is null
  // when user exits app the refresh token remain in cookie storage
  // when opens app the refresh token is used to log user back in automatically if it has not expired
  token = new BehaviorSubject<any>(null); // refresh token
  user = new BehaviorSubject<any>(null); // logged in user data

  constructor(private http: HttpClient) {}
  // login a user
  login(email: string, password: string) {
    return new Promise((resolve, reject) => {
      this.http
        .post(
          ROOT_URL + 'auth/login',
          {
            email: email,
            password: password,
          },
          {
            withCredentials: true,
          }
        )
        .subscribe({
          next: (data) => {
            this.token.next(data);
            return resolve(data);
          },
          error: (error) => {
            return reject(error);
          },
        });
    });
  }
  // logout a user
  logout() {
    return new Promise((resolve, reject) => {
      this.http
        .post(
          ROOT_URL + 'auth/logout',
          {},
          {
            withCredentials: true,
          }
        )
        .subscribe({
          next: (data) => {
            this.token.next('');
            return resolve(data);
          },
          error: (error) => {
            return reject(error);
          },
        });
    });
  }
  // refresh the refresh token 
  refresh() {
    return new Promise((resolve, reject) => {
      this.http
        .get(ROOT_URL + 'auth/refresh', {
          withCredentials: true,
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
  // register user with new account
  signUp(name: string, email: string, password: string, confirmPass: string) {
    return new Promise((resolve, reject) => {
      this.http
        .post(ROOT_URL + 'users/signup', {
          name: name,
          email: email,
          password: password,
          confirmPass: confirmPass,
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
