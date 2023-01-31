import { Component } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent {
  search!: string;
  courses: any;
  sessionToken: any = null;
  src: any = '../../../assets/check.png';

  readonly ROOT_URL = 'http://localhost:3000/';

  constructor(private http: HttpClient) {}

  async searchCourses() {
    if (this.sessionToken == null) {
      this.sessionToken = uuidv4();
    }

    if (this.search.length > 3) {
      try {
        const res: any = await this.getCourses();
        this.courses = res.results.filter((course: any) => {
          return !course.name.toLowerCase().includes('mini');
        });
      } catch (error) {
        console.log(error);
      }

      console.log(this.courses);
    }
  }

  getCourses() {
    return new Promise((resolve, reject) => {
      this.http
        .get(this.ROOT_URL + 'courses', {
          headers: new HttpHeaders({ 'Content-Type': 'image/jpeg' }),
          params: new HttpParams()
            .set('search', this.search)
            .set('sessionToken', this.sessionToken),
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

  getPhoto() {
    return new Promise((resolve, reject) => {
      this.http
        .get(this.ROOT_URL + 'photo', {
          params: new HttpParams()
            .set('width', 400)
            .set(
              'reference',
              'AfLeUgN5kQ9b372JQvAzNZIj8vRA9KI1SFa8D1KVQyySa3aJatrrolBkbbwHTZ6fDzXgyhW6pNluinYvBKteAgNeE3YBTufnwEazWII4z-Cb2_X58BNj5aWCNz-Ad-TYRdEsO75AwL6JqARVMf3wyU_QcnllMjj5UlUPmaEg3MkD7luBY6sp'
            ),
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
