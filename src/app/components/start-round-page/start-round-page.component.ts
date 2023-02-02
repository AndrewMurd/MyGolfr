import { Component } from '@angular/core';
import { CourseDetailsService } from '../../Service/course-details.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-start-round-page',
  templateUrl: './start-round-page.component.html',
  styleUrls: ['./start-round-page.component.scss']
})

export class StartRoundPageComponent {
  data: any;

  constructor(
    private courseService: CourseDetailsService,
    private router: Router
  ) {}

  ngOnInit() {
    // this.courseService.selectedCourse$.subscribe((value) => {
    //   this.data = value;
    // }).unsubscribe();
    this.data = localStorage.getItem('selectedCourse');
    this.data = JSON.parse(this.data);
    console.log(this.data);
  }
}
