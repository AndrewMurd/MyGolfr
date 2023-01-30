import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  readonly ROOT_URL = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    // let headers = new HttpHeaders().set('Authorization', 'jwt token');

    return new Promise((resolve, reject) => {
      this.http
        .post(this.ROOT_URL + '/login', {
          email: email,
          password: password,
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

  signUp(name: string, email: string, password: string, confirmPass: string) {
    return new Promise((resolve, reject) => {
      this.http
        .post(this.ROOT_URL + '/signup', {
          name: name,
          email: email,
          password: password,
          confirmPass: confirmPass
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
