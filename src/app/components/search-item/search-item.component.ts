import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CourseDetailsService } from '../../Service/course-details.service';
import { Router } from '@angular/router';
import { apiKey } from '../../utilities/enviroment';

@Component({
  selector: 'app-search-item',
  templateUrl: './search-item.component.html',
  styleUrls: ['./search-item.component.scss'],
})
export class SearchItemComponent {
  @Input() data!: any;
  @Output() onClickItem: EventEmitter<any> = new EventEmitter;
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
    // this.src = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${this.data.photos[0].photo_reference}&key=${apiKey}`;
    this.name = this.data.name;
    this.addressInfo = this.data.formatted_address;
  }

  clickItem() {
    if (this.disable) return;
    this.onClickItem.emit();
    // store data for selected course in course service so other components can access it
    // this.courseService.setCourse(this.data);
    localStorage.setItem('selectedCourse', JSON.stringify(this.data));
    this.router.navigate(['/course']);
  }

  startRound() {
    this.disable = true;
    this.onClickItem.emit();
    // store data for selected course in course service so other components can access it
    // this.courseService.setCourse(this.data);
    this.router.navigate(['/start_round']); // not implemented yet
    // setTimeout(() => {
    //   this.disable = false;
    // }, 100);
  }
}
