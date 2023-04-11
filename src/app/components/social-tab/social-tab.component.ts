import { Component, Input } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CourseDetailsService } from 'src/app/services/course-details.service';
import { UserService } from 'src/app/services/user.service';
import {
  trigger,
  state,
  style,
  animate,
  stagger,
  query,
  transition,
} from '@angular/animations';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-social-tab',
  templateUrl: './social-tab.component.html',
  styleUrls: ['./social-tab.component.scss'],
  animations: [
    trigger('openCloseSocial', [
      state(
        'open',
        style({
          height: '*',
          'border-radius': '0px 0px 8px 8px',
          'border-bottom': '2px solid black',
          'border-right': '2px solid black',
          'border-left': '2px solid black',
        })
      ),
      state(
        'closed',
        style({
          height: '0px',
          border: 'none',
        })
      ),
      transition('open => closed', [animate('0.2s')]),
      transition('closed => open', [animate('0.2s')]),
    ]),
    trigger('listAnimation', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0 }),
            stagger(10, [animate('0.5s', style({ opacity: 1 }))]),
          ],
          { optional: true }
        ),
      ]),
    ]),
  ],
})
export class SocialTabComponent {
  subscriptions: Subscription = new Subscription();
  @Input() showSocialObs!: Observable<any>;
  userData: any;
  search!: string;
  isLoading: boolean = false;
  players: any = [];
  amountToDisplay: number = 5;
  disable: boolean = false;
  onlineUsers: any = [];
  follows: any = [];
  showSocial: boolean = false;

  constructor(
    private courseService: CourseDetailsService,
    private userService: UserService,
    private authService: AuthenticationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.subscriptions.add(
      this.authService.user.asObservable().subscribe(async (value) => {
        if (value) {
          this.userData = value;
          // getting detailed data for each of followed users
          const followsRes: any = await this.userService.getUsers(
            this.userData.follows
          );
          this.follows = followsRes.users;
        }
      })
    );

    this.subscriptions.add(
      this.showSocialObs.subscribe((value) => {
        this.showSocial = value;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  async searchPlayers() {
    this.players.length = 0;
    if (this.search.length > 0) {
      this.isLoading = true;
      this.setBorder();

      try {
        const response: any = await this.userService.search(this.search);
        if (this.userData.follows) {
          // filter out users
          for (const player of response.users) {
            let alreadyFollowed = false;
            for (const follow of this.follows) {
              // player is already followed
              if (player.id == follow.id) {
                alreadyFollowed = true;
              }
            }
            if (alreadyFollowed) player.state = 'followed';
            else player.state = 'inactive'; // player is not followed
            if (player.id != this.userData.id) this.players.push(player); // player is myself
          }
        } else {
          this.players = response.users.filter((player: any) => {
            return player.id != this.userData.id;
          });
        }

        this.isLoading = false;
        this.setBorder();
      } catch (error) {
        this.isLoading = false;
        this.setBorder();
      }
    } else {
      this.players.length = 0;
      this.isLoading = false;
      this.setBorder();
    }
  }

  async addFollow(player: any, event: any) {
    this.disable = true;
    setTimeout(() => {
      this.disable = false;
    });
    if (event.target.getAttribute('id') == 'followed') {
      event.target.setAttribute('id', 'inactive');
      let removal: any;
      // remove player from follows
      this.userData.follows = this.userData.follows.filter((user: any) => {
        if (player.id == user) removal = user;
        return player.id != user;
      });
      // filter follows array
      this.follows = this.follows.filter((user: any) => {
        return user.id != removal;
      });
      // update database with new follows
      await this.userService.updateFollows(
        this.userData.follows,
        this.userData.id
      );
      // update database with followers
      let playerFollowers = JSON.parse(JSON.stringify(player.followers));
      playerFollowers = playerFollowers.filter((user: any) => {
        return this.userData.id != user;
      });
      player.followers = playerFollowers;
      await this.userService.updateFollowers(playerFollowers, player.id);
    } else if (event.target.getAttribute('id') == 'inactive') {
      event.target.setAttribute('id', 'active');
      this.userData.follows.push(player.id);
      await this.userService.updateFollows(
        this.userData.follows,
        this.userData.id
      );
      const user: any = await this.userService.get(player.id);
      this.follows.push(user.user);
      const playerFollowers = JSON.parse(JSON.stringify(player.followers));
      playerFollowers.push(this.userData.id);
      player.followers.push(this.userData.id);
      await this.userService.updateFollowers(playerFollowers, player.id);
      setTimeout(() => {
        event.target.setAttribute('id', 'followed');
      }, 1000);
    }
  }

  navigateToProfile(player: any) {
    if (this.disable) return;
    this.router.navigate(['/profile', 'rounds', player.id]);
  }

  setBorder() {
    try {
      if (this.players.length > 0 || this.isLoading) {
        document.getElementById('socialSearch')!.style.borderRadius =
          '10px 10px 0px 0px';
      } else {
        document.getElementById('socialSearch')!.style.borderRadius = '10px';
      }
    } catch (error) {}
  }

  showMore() {
    if (this.amountToDisplay < this.players.length) this.amountToDisplay += 5;
  }
}
