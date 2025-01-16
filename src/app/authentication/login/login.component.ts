import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Login } from '../../modals/modal';
import { LocalStorageService } from '../../Services/localStorage.service';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-login',
  imports: [
    SharedModule,
    RouterLink,
    FormsModule,
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
