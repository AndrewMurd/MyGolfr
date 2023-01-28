import { Component } from '@angular/core';
import { AuthenticationService } from '../../Service/authentication.service';
import { Router } from '@angular/router';

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
  btn: any;
  nameError: any;
  emailError: any;
  passwordError: any;
  nameInput: any;
  emailInput: any;
  passwordInput: any;

  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.btn = document.querySelector('#button');
    this.nameError = document.querySelector('#nameError');
    this.emailError = document.querySelector('#emailError');
    this.passwordError = document.querySelector('#passwordError');
    this.nameInput = <HTMLInputElement>document.querySelector('#nameInput');
    this.emailInput = <HTMLInputElement>document.querySelector('#emailInput');
    this.passwordInput = <HTMLInputElement>(
      document.getElementById('passwordInput')
    );

    this.nameInput.addEventListener('keyup', () => {
      this.nameInput.setAttribute('value', this.nameInput.value);
    });
    this.emailInput.addEventListener('keyup', () => {
      this.emailInput.setAttribute('value', this.emailInput.value);
    });
    this.passwordInput.addEventListener('keyup', () => {
      this.passwordInput.setAttribute('value', this.passwordInput.value);
    });
  }

  onClick() {
    this.btn.classList.add('onclic');
  }

  resetInnerText() {
    this.nameError.innerText = '';
    this.emailError.innerText = '';
    this.passwordError.innerText = '';
  }

  resetInputClass() {
    this.nameInput.classList.remove('inputError');
    this.emailInput.classList.remove('inputError');
    this.passwordInput.classList.remove('inputError');
  }

  onSubmit() {
    this.error = '';
    this.resetInnerText();
    this.resetInputClass();

    this.authService
      .signUp(this.name, this.email, this.password)
      .then((data) => {
        console.log(data);

        this.btn.classList.remove('onclic');
        this.btn.classList.add('validate');
        this.resetInnerText();
        this.resetInputClass();

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
        }
        setTimeout(() => {
          this.btn.classList.remove('onclic');
        }, 800);
      });
  }
}
