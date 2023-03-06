import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ScoreService } from 'src/app/services/score.service';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  subscriptions: Subscription = new Subscription();
  signedIn: boolean = false;
  userDropdown: boolean = false;
  userData: any = { name: 'Guest' };
  scoreData: any;
  isPhone!: boolean;
  isChecked: boolean = false;

  constructor(
    private authService: AuthenticationService,
    private scoreService: ScoreService,
    private router: Router
  ) {}

  ngOnInit() {
    if (window.innerWidth < 830) {
      this.isPhone = true;
    } else {
      this.isPhone = false;
    }

    this.subscriptions.add(this.authService.token.asObservable().subscribe((value) => {
      if (value) {
        this.signedIn = true;
      } else {
        this.signedIn = false;
      }
    }));

    this.subscriptions.add(this.authService.user.asObservable().subscribe(async (value) => {
      if (value) {
        this.userData = value;
      }
    }));

    this.subscriptions.add(this.scoreService.inProgressScoreData.asObservable().subscribe((value) => {
      if (value) {
        this.scoreData = value;
      }
    }));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  signOut() {
    this.signedIn = false;
    this.authService.token.next(null);
    this.authService.user.next(null);
    this.router.navigate(['/login']);
    this.authService.logout();
  }

  setDropdownUser(set: boolean) {
    this.userDropdown = set;
    if (this.userDropdown) {
      document.getElementById('userArrow')!.className = 'arrow up';
      document.getElementById('selectUserDropdown')!.style.height = '40px';
    } else {
      document.getElementById('userArrow')!.className = 'arrow down';
      document.getElementById('selectUserDropdown')!.style.height = '0px';
    }
  }

  navigateToStartRound() {
    this.router.navigate(['/start_round', this.scoreData.id]);
  }

  closeBox() {
    this.isChecked = false;
    this.setDropdownUser(false);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (window.innerWidth < 830) {
      this.isPhone = true;
    } else {
      this.isPhone = false;
    }
  }
}
