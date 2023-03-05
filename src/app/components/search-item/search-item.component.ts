import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CourseDetailsService } from '../../services/course-details.service';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-search-item',
  templateUrl: './search-item.component.html',
  styleUrls: ['./search-item.component.scss'],
})
export class SearchItemComponent {
  signedIn: boolean = false;
  userData: any;
  @Input() data!: any;
  @Output() onClickItem: EventEmitter<any> = new EventEmitter();
  src: string =
    '../../../assets/Golf-ball-isolated-on-transparent-background-PNG.png';
  name!: string;
  addressInfo!: string;
  disable: boolean = false;
  isPhone: boolean = false;

  constructor(
    private courseService: CourseDetailsService,
    private authService: AuthenticationService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.data.photos) {
      // this.src = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${this.data.photos[0].photo_reference}&key=${apiKey}`;
    }
    this.name = this.data.name;

    this.authService.token.asObservable().subscribe((value) => {
      if (value) {
        this.signedIn = true;
      } else {
        this.signedIn = false;
      }
    });

    this.authService.user.asObservable().subscribe((value) => {
      if (value) {
        this.userData = value;
      }
    });

    let stringArray = this.data.plus_code.compound_code.split(/(\s+)/);
    this.addressInfo = '';

    for (let i = 1; i < stringArray.length; i++) {
      this.addressInfo += stringArray[i];
    }
  }

  clickItem() {
    if (this.disable) return;
    this.onClickItem.emit(this.data);
    localStorage.setItem('selectedCourse', JSON.stringify(this.data));
    this.router.navigate(['/course']);
    this.addClickToUser();
  }

  startRound() {
    if (!this.signedIn) {
      this.router.navigate(['/login']);
      return;
    }
    this.disable = true;
    this.onClickItem.emit(this.data);
    localStorage.setItem('selectedCourse', JSON.stringify(this.data));
    this.router.navigate(['/start_round']);
    this.addClickToUser();
  }

  async addClickToUser() {
    if (this.userData.favCourses) {
      if (this.userData.favCourses[this.data.reference]) {
        this.userData.favCourses[this.data.reference] += 1;
      } else {
        this.userData.favCourses[this.data.reference] = 1;
      }
    } else {
      this.userData.favCourses = {};
      this.userData.favCourses[this.data.reference] = 1;
    }
    this.authService.user.next(this.userData);
    await this.userService.update(this.userData);
  }
}
