import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subject } from 'rxjs';
import { ROOT_URL } from '../utilities/enviroment';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  // if token exists user is logged in otherwise user is not logged in and token is null
  // when user exits app the refresh token is remains is secure cookie storage.
  // when user logs back in app will use refresh token from cookies to log user back in automatically if refresh token has not expired
  token = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return new Promise((resolve, reject) => {
      this.http
        .post(ROOT_URL + 'auth/login', {
          email: email,
          password: password,
        })
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

  logout() {
    return new Promise((resolve, reject) => {
      this.http.post(ROOT_URL + 'auth/logout', {}).subscribe({
        next: (data) => {
          this.token.next(null);
          return resolve(data);
        },
        error: (error) => {
          return reject(error);
        },
      });
    });
  }

  refresh() {
    return new Promise((resolve, reject) => {
      this.http.get(ROOT_URL + 'auth/refresh').subscribe({
        next: (data) => {
          return resolve(data);
        },
        error: (error) => {
          return reject(error);
        },
      });
    });
  }

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
