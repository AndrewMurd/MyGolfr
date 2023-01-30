import { Component } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent {
  search!: string;
  courses: any;

  readonly ROOT_URL = 'http://localhost:3000/';

  constructor(private http: HttpClient) {}

  async searchCourses() {
    if (this.search.length > 3) {
      const res: any = await this.getCourses();
      
      this.courses = res.results.filter((course: any) => {
        return !course.name.toLowerCase().includes('mini');
      })
      console.log(this.courses);
    }
  }

  getCourses() {
    return new Promise((resolve, reject) => {
      this.http
        .get(this.ROOT_URL + 'courses', {
          params: new HttpParams().set('search', this.search),
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
