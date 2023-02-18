import { Component, HostListener } from '@angular/core';
import { CourseDetailsService } from '../../Service/course-details.service';
import { Router } from '@angular/router';
import { faMapPin, faFlag } from '@fortawesome/free-solid-svg-icons';
import { Subject } from 'rxjs';
import { AuthenticationService } from 'src/app/Service/authentication.service';

@Component({
  selector: 'app-course-page',
  templateUrl: './course-page.component.html',
  styleUrls: ['./course-page.component.scss'],
})
export class CoursePageComponent {
  rBackNine: Subject<any> = new Subject<any>();
  editedScorecard: Subject<any> = new Subject<any>();
  selectedCourse: any;
  loading: boolean = true;

  constructor(private courseService: CourseDetailsService) {}

  async ngOnInit() {
    this.selectedCourse = JSON.parse(localStorage.getItem('selectedCourse')!);

    const response: any = await this.courseService.get(
      this.selectedCourse.reference
    );
    this.courseService.courseData.next(response.course);
    this.loading = false;
  }
}
