import { Component } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { Router } from '@angular/router';
import jwt_decode from 'jwt-decode';
import { ScoreService } from 'src/app/services/score.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent {
  error: string = '';
  email: string = '';
  password: string = '';
  btn: any;
  emailError: any;
  passwordError: any;
  emailInput: any;
  passwordInput: any;

  constructor(
    private authService: AuthenticationService,
    private scoreService: ScoreService,
    private router: Router
  ) {}

  ngOnInit() {
    this.btn = document.querySelector('#button');
    this.emailError = document.querySelector('#emailError');
    this.passwordError = document.querySelector('#passwordError');
    this.emailInput = <HTMLInputElement>document.querySelector('#emailInput');
    this.passwordInput = <HTMLInputElement>(
      document.getElementById('passwordInput')
    );

    this.emailInput!.addEventListener('keyup', () => {
      this.emailInput!.setAttribute('value', this.emailInput.value);
    });

    this.passwordInput!.addEventListener('keyup', () => {
      this.passwordInput!.setAttribute('value', this.passwordInput.value);
    });

    window.addEventListener(
      'popstate',
      (event) => {
        setTimeout(() => {
          this.router.navigate(['/']);
        });
      },
      false
    );
  }

  navigateToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }

  onClick() {
    this.btn.classList.add('onclic');
  }

  resetInnerText() {
    this.emailError.innerText = '';
    this.passwordError.innerText = '';
  }

  resetInputClass() {
    this.emailInput.classList.remove('inputError');
    this.passwordInput.classList.remove('inputError');
  }

  onSubmit() {
    this.error = '';
    this.resetInnerText();
    this.resetInputClass();

    this.authService
      .login(this.email, this.password)
      .then(async (data: any) => {
        this.btn!.classList.remove('onclic');
        this.btn!.classList.add('validate');
        this.resetInnerText();
        this.resetInputClass();

        this.authService.token.next(data.accessToken);
        const userData: any = jwt_decode(data.accessToken);
        this.authService.user.next(userData);

        try {
          const response: any = await this.scoreService.getUser(userData.id, 0);
          this.scoreService.inProgressScoreData.next(response.scores[0]);
        } catch (error) {}

        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1000);
      })
      .catch((error) => {
        this.error = error.error.type;
        if (this.error == 'email') {
          this.emailInput.classList.add('inputError');
          if (this.email == '') {
            this.emailError.innerText = 'Must enter an email';
          } else {
            this.emailError.innerText = 'This email does not exist';
          }
        } else if (this.error == 'password') {
          this.passwordInput.classList.add('inputError');
          if (this.password == '') {
            this.passwordError.innerText = 'Must enter a password';
          } else {
            this.passwordError.innerText = 'Incorrect password';
          }
        }
        setTimeout(() => {
          this.btn!.classList.remove('onclic');
        }, 800);
      });
  }
}
