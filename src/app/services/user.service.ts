import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ROOT_URL } from '../utilities/enviroment';

// interface for manipulating user data
@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  // get a user
  async get(id: number) {
    return await new Promise((resolve, reject) => {
      this.http
        .get(ROOT_URL + 'users/get', {
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

  // get array of users
  async getUsers(ids: any) {
    return await new Promise((resolve, reject) => {
      this.http
        .post(ROOT_URL + 'users/getUsers', {
          ids: ids,
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

  // get users status
  async getStatus() {
    return await new Promise((resolve, reject) => {
      this.http.get(ROOT_URL + 'users/getStatus').subscribe({
        next: (data: any) => {
          return resolve(data);
        },
        error: (error) => {
          return reject(error);
        },
      });
    });
  }

  // search users
  async search(query: string) {
    return await new Promise((resolve, reject) => {
      this.http
        .get(ROOT_URL + 'users/search', {
          params: new HttpParams().set('query', query),
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

  // register user for new account
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
  // update user data
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
  // update user's name
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
  // update user's email
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
  // update user's follows
  updateFollows(follows: string, id: string) {
    return new Promise((resolve, reject) => {
      this.http
        .post(ROOT_URL + 'users/follows', {
          follows: follows,
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
  // update user's followers
  updateFollowers(followers: string, id: string) {
    return new Promise((resolve, reject) => {
      this.http
        .post(ROOT_URL + 'users/followers', {
          followers: followers,
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
  // update user's password
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
  // send email for password reset
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
  // reset password if token is valid
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
