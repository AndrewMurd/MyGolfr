import { Component } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';
import { ROOT_URL } from '../../utilities/enviroment';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent {
  search!: string;
  courses: any = [
    {
      icon: 'https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/golf-71.png',
      name: 'Timber Ridge Golf Course',
      types: ['restaurant', 'food', 'point_of_interest', 'establishment'],
      photos: [
        {
          width: 4000,
          height: 3000,
          photo_reference:
            'AfLeUgN08P0RsEyHZXH-Ypa8vYzFmRHigQWm8gOu5M4i7qAluNA7I3zZ-2r3c0MF9WAgJEqf_YHi5fT0XoFxLcWKn-r4P3Np3luTrPpnr0esVHWtLRuCxUJT6yuou0q9wWVBlUyF_ZLRRWEeTwXGdKkb3wMVP_qK4KEhAHNISg-uGNmL3Z73',
          html_attributions: [Array],
        },
      ],
      rating: 4.4,
      geometry: {
        location: { lat: 44.0751152, lng: -77.7006225 },
        viewport: { northeast: [Object], southwest: [Object] },
      },
      place_id: 'ChIJp0zRKawT1okRPPUONYrhrqU',
      plus_code: {
        global_code: '87P437GX+2Q',
        compound_code: '37GX+2Q Brighton, Ontario',
      },
      reference: 'ChIJp0zRKawT1okRPPUONYrhrqU',
      opening_hours: { open_now: false },
      business_status: 'OPERATIONAL',
      formatted_address: '19 Timber Ridge Dr, Brighton, ON K0K 1H0, Canada',
      icon_mask_base_uri:
        'https://maps.gstatic.com/mapfiles/place_api/icons/v2/golf_pinlet',
      user_ratings_total: 281,
      icon_background_color: '#13B5C7',
    },
  ];
  sessionToken: any = null;
  src: any = '../../../assets/check.png';

  constructor(private http: HttpClient) {}

  resetSession() {
    this.sessionToken = null;
  }

  async searchCourses() {
    this.courses = [];
    if (this.sessionToken == null) {
      this.sessionToken = uuidv4();
    }

    if (this.search.length > 3) {
      try {
        const res: any = await this.getCourses();
        this.courses = res.results.filter((course: any) => {
          return (
            !course.name.toLowerCase().includes('mini') &&
            !course.name.toLowerCase().includes('disc') &&
            course.name.toLowerCase().includes('golf')
          );
        });
        this.courses = this.courses.slice(0, 5);

        this.http
          .post(ROOT_URL + 'courses/add', {
            courses: this.courses,
          })
          .subscribe(() => {});
      } catch (error) {
        console.log(error);
      }
    }
  }

  getCourses() {
    return new Promise((resolve, reject) => {
      this.http
        .get(ROOT_URL + 'google/courses', {
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
