import { Component } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent {
  search!: string;
  courses: any = [{
    name: 'Timber Ridge Golf Course',
    formatted_address: 'shithole',
  },
  {
    name: 'Barcovan Golf Course',
    formatted_address: 'brighton',
  }
  ];
  sessionToken: any = null;
  src: any = '../../../assets/check.png';

  readonly ROOT_URL = 'http://localhost:3000/';

  constructor(private http: HttpClient) {}
  
  resetSession() {
    this.sessionToken = null;
  }

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
}
