import { Component } from '@angular/core';
import { Router } from '@angular/router';
import jwt_decode from 'jwt-decode';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss'],
})
export class RegisterPageComponent {
  error: string = '';
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPass: string = '';
  btn: any;
  nameError: any;
  emailError: any;
  passwordError: any;
  confirmPassError: any;
  nameInput: any;
  emailInput: any;
  passwordInput: any;
  confirmPassInput: any;

  constructor(
    private userService: UserService,
    private authService: AuthenticationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.btn = document.querySelector('#registerBtn');
    this.nameError = document.querySelector('#nameError');
    this.emailError = document.querySelector('#email2Error');
    this.passwordError = document.querySelector('#password2Error');
    this.confirmPassError = document.querySelector('#confirmPassError');
    this.nameInput = document.querySelector('#nameInput');
    this.emailInput = document.querySelector('#email2Input');
    this.passwordInput = document.querySelector('#password2Input');
    this.confirmPassInput = document.querySelector('#confirmPassInput');

    this.nameInput.addEventListener('keyup', () => {
      this.nameInput.setAttribute('value', this.nameInput.value);
    });
    this.emailInput.addEventListener('keyup', () => {
      this.emailInput.setAttribute('value', this.emailInput.value);
    });
    this.passwordInput.addEventListener('keyup', () => {
      this.passwordInput.setAttribute('value', this.passwordInput.value);
    });
    this.confirmPassInput.addEventListener('keyup', () => {
      this.confirmPassInput.setAttribute('value', this.confirmPassInput.value);
    });
  }

  onClick() {
    this.btn.classList.add('onclic');
  }

  resetInnerText() {
    this.nameError.innerText = '';
    this.emailError.innerText = '';
    this.passwordError.innerText = '';
    this.confirmPassError.innerText = '';
  }

  resetInputClass() {
    this.nameInput.classList.remove('inputError');
    this.emailInput.classList.remove('inputError');
    this.passwordInput.classList.remove('inputError');
    this.confirmPassInput.classList.remove('inputError');
  }

  onSubmit() {
    this.error = '';
    this.resetInnerText();
    this.resetInputClass();

    this.userService
      .signUp(this.name, this.email, this.password, this.confirmPass)
      .then((data) => {
        this.btn.classList.remove('onclic');
        this.btn.classList.add('validate');
        this.resetInnerText();
        this.resetInputClass();

        this.authService.login(this.email, this.password).then((data: any) => {
          this.authService.token.next(data.accessToken);
          const userData: any = jwt_decode(data.accessToken);
          this.authService.user.next(userData);
        });

        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1000);
      })
      .catch((error) => {
        this.error = error.error.errors[0].param;
        if (this.error == 'name') {
          this.nameInput.classList.add('inputError');
          this.nameError.innerText = error.error.errors[0].msg;
        } else if (this.error == 'email') {
          this.emailInput.classList.add('inputError');
          this.emailError.innerText = error.error.errors[0].msg;
        } else if (this.error == 'password') {
          this.passwordInput.classList.add('inputError');
          this.passwordError.innerText = error.error.errors[0].msg;
        } else if (this.error == 'confirmPass') {
          this.passwordInput.classList.add('inputError');
          this.confirmPassInput.classList.add('inputError');
          this.confirmPassError.innerText = error.error.errors[0].msg;
        }
        setTimeout(() => {
          this.btn.classList.remove('onclic');
        }, 800);
      });
  }
}
