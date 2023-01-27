import { Component } from '@angular/core';
import { AuthenticationService } from '../../Service/authentication.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent {
  email: string = '';
  password: string = '';
  error!: string;

  constructor(private authService: AuthenticationService) {}

  ngOnInit() {
    let emailInput = <HTMLInputElement>document.querySelector('#emailInput');
    let passwordInput = <HTMLInputElement>(
      document.getElementById('passwordInput')
    );

    emailInput!.addEventListener('keyup', () => {
      emailInput!.setAttribute('value', emailInput!.value);
    });

    passwordInput!.addEventListener('keyup', () => {
      passwordInput!.setAttribute('value', passwordInput!.value);
    });
  }

  onSubmit() {
    const res = this.authService.login(this.email, this.password);
    res
      .then((data) => {
        console.log(data);
        // set jwt access token
      })
      .catch((error) => {
        console.log(error.error);
        this.error = error.error;
      });
  }
}
