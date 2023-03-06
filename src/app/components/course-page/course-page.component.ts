import { Component } from '@angular/core';
import { CourseDetailsService } from '../../services/course-details.service';
import { ActivatedRoute } from '@angular/router';
import { LoadingService } from 'src/app/services/loading.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-course-page',
  templateUrl: './course-page.component.html',
  styleUrls: ['./course-page.component.scss'],
})
export class CoursePageComponent {
  subscriptions: Subscription = new Subscription();

  constructor(
    private courseService: CourseDetailsService,
    private loadingService: LoadingService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.loadingService.loading.next(true);
    this.subscriptions.add(this.route.params.subscribe(async (params) => {
      const response: any = await this.courseService.get(
        params['id']
      );
      this.courseService.courseData.next(response.course);
      this.loadingService.loading.next(false);
    }));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
