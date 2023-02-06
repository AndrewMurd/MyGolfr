import { Component } from '@angular/core';
import { CourseDetailsService } from '../../Service/course-details.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-course-page',
  templateUrl: './course-page.component.html',
  styleUrls: ['./course-page.component.scss'],
})
export class CoursePageComponent {
  data: any;

  constructor(
    private courseService: CourseDetailsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.data = localStorage.getItem('selectedCourse');
    this.data = JSON.parse(this.data);
  }
}
