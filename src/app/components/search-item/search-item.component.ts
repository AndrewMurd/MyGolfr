import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { UserService } from 'src/app/services/user.service';
import { Subscription } from 'rxjs';
import { ScoreService } from 'src/app/services/score.service';

@Component({
  selector: 'app-search-item',
  templateUrl: './search-item.component.html',
  styleUrls: ['./search-item.component.scss'],
})
export class SearchItemComponent {
  subscriptions: Subscription = new Subscription();
  signedIn: boolean = false;
  userData: any;
  scoreData: any;
  @Input() data!: any;
  @Output() onClickItem: EventEmitter<any> = new EventEmitter();
  src: string =
    '../../../assets/Golf-ball-isolated-on-transparent-background-PNG.png';
  name!: string;
  addressInfo!: string;
  disable: boolean = false;
  isPhone: boolean = false;

  constructor(
    private scoreService: ScoreService,
    private authService: AuthenticationService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.data.photos) {
      // this.src = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${this.data.photos[0].photo_reference}&key=${apiKey}`;
    }
    this.name = this.data.name;

    this.subscriptions.add(this.authService.token.asObservable().subscribe((value) => {
      if (value) {
        this.signedIn = true;
      } else {
        this.signedIn = false;
      }
    }));

    this.subscriptions.add(this.authService.user.asObservable().subscribe((value) => {
      if (value) {
        this.userData = value;
      }
    }));

    this.subscriptions.add(this.scoreService.inProgressScoreData.asObservable().subscribe((value) => {
      if (value) {
        this.scoreData = value;
      }
    }));

    let stringArray = this.data.plus_code.compound_code.split(/(\s+)/);
    this.addressInfo = '';

    for (let i = 1; i < stringArray.length; i++) {
      this.addressInfo += stringArray[i];
    }
  }
  
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  clickItem() {
    if (this.disable) return;
    this.onClickItem.emit(this.data);
    this.router.navigate(['/course', this.data.reference]);
    this.addClickToUser();
  }

  startRound() {
    if (!this.signedIn) {
      this.router.navigate(['/login']);
      return;
    }
    this.disable = true;
    this.onClickItem.emit(this.data);
    this.router.navigate(['/start-round', this.data.reference]);
    this.addClickToUser();
  }

  async addClickToUser() {
    if (!this.userData) return;
    if (this.userData.favCourses[this.data.reference]) {
      this.userData.favCourses[this.data.reference] += 1;
    } else {
      this.userData.favCourses[this.data.reference] = 1;
    }
    this.authService.user.next(this.userData);
    await this.userService.update(this.userData);
  }
}
