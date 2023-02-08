import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CourseDetailsService } from '../../Service/course-details.service';
import { Router } from '@angular/router';

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
  isPhone: boolean = false;

  constructor(
    private courseService: CourseDetailsService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.data.photos) {
      // this.src = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${this.data.photos[0].photo_reference}&key=${apiKey}`;
    }
    this.name = this.data.name;
    
    let stringArray = this.data.plus_code.compound_code.split(/(\s+)/);
    this.addressInfo = '';

    for (let i = 1; i < stringArray.length; i++) {
      this.addressInfo += stringArray[i];
    }
  }

  clickItem() {
    if (this.disable) return;
    this.onClickItem.emit();
    localStorage.setItem('selectedCourse', JSON.stringify(this.data));
    this.router.navigate(['/course']);
  }

  startRound() {
    this.disable = true;
    this.onClickItem.emit();
    localStorage.setItem('selectedCourse', JSON.stringify(this.data));
    this.router.navigate(['/start_round']); // not implemented yet
  }
}