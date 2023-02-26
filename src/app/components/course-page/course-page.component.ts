import { Component } from '@angular/core';
import { CourseDetailsService } from '../../Service/course-details.service';
import { Subject } from 'rxjs';
import { LoadingService } from 'src/app/Service/loading.service';

@Component({
  selector: 'app-course-page',
  templateUrl: './course-page.component.html',
  styleUrls: ['./course-page.component.scss'],
})
export class CoursePageComponent {
  selectedCourse: any;

  constructor(
    private courseService: CourseDetailsService,
    private loadingService: LoadingService
  ) {}

  async ngOnInit() {
    this.loadingService.loading.next(true);
    this.selectedCourse = JSON.parse(localStorage.getItem('selectedCourse')!);

    const response: any = await this.courseService.get(
      this.selectedCourse.reference
    );
    this.courseService.courseData.next(response.course);
    this.loadingService.loading.next(false);
  }
}
