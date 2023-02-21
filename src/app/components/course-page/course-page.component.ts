import { Component } from '@angular/core';
import { CourseDetailsService } from '../../Service/course-details.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-course-page',
  templateUrl: './course-page.component.html',
  styleUrls: ['./course-page.component.scss'],
})
export class CoursePageComponent {
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
