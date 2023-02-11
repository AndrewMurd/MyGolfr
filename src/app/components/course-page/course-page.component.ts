import { Component } from '@angular/core';
import { CourseDetailsService } from '../../Service/course-details.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-course-page',
  templateUrl: './course-page.component.html',
  styleUrls: ['./course-page.component.scss'],
})
export class CoursePageComponent {
  selectedCourse: any;
  display: any;
  center: google.maps.LatLngLiteral = {
    lat: 0,
    lng: 0,
  };
  isNineHole: boolean = false;
  isPhone: boolean = false;

  constructor(
    private courseService: CourseDetailsService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.selectedCourse = JSON.parse(localStorage.getItem('selectedCourse')!);

    const response: any = await this.courseService.get(
      this.selectedCourse.reference
    );

    if (window.innerWidth < 830) {
      this.isPhone = true;
    }

    this.isNineHole = response.course.courseDetails.nineHoleGolfCourse;

    this.center.lat = this.selectedCourse.geometry.location.lat;
    this.center.lng = this.selectedCourse.geometry.location.lng;

    const map = new google.maps.Map(
      document.getElementById('map') as HTMLElement,
      {
        zoom: 16,
        center: this.center,
        mapTypeId: 'hybrid',
        minZoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        zoomControl: false,
        fullscreenControl: false,
      } as google.maps.MapOptions
    );
  }

  createRange(number: number) {
    // return new Array(number);
    return new Array(number).fill('').map((n, index) => index + 1);
  }
}
