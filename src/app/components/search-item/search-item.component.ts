import { Component, Input } from '@angular/core';
import { CourseDetailsService } from '../../Service/course-details.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-item',
  templateUrl: './search-item.component.html',
  styleUrls: ['./search-item.component.scss'],
})
export class SearchItemComponent {
  @Input() data!: any;
  src: string =
    '../../../assets/Golf-ball-isolated-on-transparent-background-PNG.png';
  name!: string;
  addressInfo!: string;
  disable: boolean = false;

  constructor(
    private courseService: CourseDetailsService,
    private router: Router
  ) {}

  ngOnInit() {
    // this.src = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${this.data.photos[0].photo_reference}&key=AIzaSyDHAJ-eAyboUANCQ9e3oRBOzf5alfXp6_U`;
    this.name = this.data.name;
    this.addressInfo = this.data.formatted_address;
  }

  clickItem() {
    if (this.disable) return;
    // store data for selected course in course service so other components can access it
    this.courseService.setCourse(this.data);
    this.router.navigate(['/course']);
  }

  startRound() {
    this.disable = true;
    // store data for selected course in course service so other components can access it
    this.courseService.setCourse(this.data);
    this.router.navigate(['/start_round']); // not implemented yet
    // setTimeout(() => {
    //   this.disable = false;
    // }, 100);
  }
}
