import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { Ripple } from 'primeng/ripple';
import { Toast } from 'primeng/toast';
import { Login } from '../../modals/modal';
import { LocalStorageService } from '../../Services/localStorage.service';

@Component({
  selector: 'app-login',
  imports: [
    CardModule,
    InputTextModule,
    ButtonModule,
    PasswordModule,
    FormsModule,
    InputMaskModule,
    Toast,
    Ripple,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers: [MessageService]
})
export class LoginComponent {

  password!: string
  email!: string
  constructor(private httpclient: HttpClient, private messageService: MessageService,
    private router: Router,
    private localService: LocalStorageService
  ) { }

  login() {
    const url = `http://localhost:3000/login`
    const requestbody = {
      email: this.email,
      password: this.password
    }
    this.httpclient.post<Login>(url, requestbody).subscribe(
      (res: Login) => {
        this.localService.setToken(res.token)
        this.email = ''
        this.password = ''
        this.showSuccess()
        this.router.navigate(['/Home'])
      },
      (error) => {
        if (error.status === 401) {
          this.showError()
          this.email = ''
          this.password = ''
        }
      }
    )
  }
  showSuccess() {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Login successfully', life: 3000 });
  }
  showError() {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Unauthorized! Please check your email or password', life:3000 });
  }
}
