import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ROOT_URL } from '../utilities/enviroment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

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

  update(user: string) {
    return new Promise((resolve, reject) => {
      this.http
        .post(ROOT_URL + 'users/update', {
          user: user,
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

  updateName(name: string, id: string) {
    return new Promise((resolve, reject) => {
      this.http
        .post(ROOT_URL + 'users/name', {
          name: name,
          id: id,
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

  updateEmail(email: string, id: string) {
    return new Promise((resolve, reject) => {
      this.http
        .post(ROOT_URL + 'users/email', {
          email: email,
          id: id,
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

  updatePassword(password: string, confirmPass: string, id: string) {
    return new Promise((resolve, reject) => {
      this.http
        .post(ROOT_URL + 'users/password', {
          password: password,
          confirmPass: confirmPass,
          id: id,
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

  forgotPassword(email: string) {
    return new Promise((resolve, reject) => {
      this.http
        .post(ROOT_URL + 'users/forgot_password', {
          email: email,
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

  resetPassword(password: string, confirmPass: string, token: string) {
    return new Promise((resolve, reject) => {
      this.http
        .post(ROOT_URL + 'users/reset_password', {
          password: password,
          confirmPass: confirmPass,
          token: token,
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
