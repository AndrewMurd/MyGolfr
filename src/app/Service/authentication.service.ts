import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({providedIn: "root"})
export class AuthenticationService {
  readonly ROOT_URL = "http://localhost:3000/users";

  constructor(private http: HttpClient) {
    
  }

  login(email: string, password: string) {
    // let headers = new HttpHeaders().set('Authorization', 'jwt token');

    const res = this.http.post(
      this.ROOT_URL + '/login',
      { 
        email: email, 
        password: password 
      }
    );
    console.log(res);
  }

  signUp(name: string, email: string, password: string) {
    const res = this.http.post(
      this.ROOT_URL + '/signup',
      { 
        name: name,
        email: email, 
        password: password
      }
    );
    console.log(res);
  }
}