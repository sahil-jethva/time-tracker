import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-register',
  imports: [
    SharedModule,
    RouterLink,
    FormsModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  providers: [MessageService]
})
export class RegisterComponent {
  password!: string
  email!: string
  name!: string

  constructor(private httpclient: HttpClient, private messageService: MessageService){}

  register() {
    const url = `http://localhost:3000/register`
    const requestbody = {
      email: this.email,
      password: this.password,
      name: this.name
    }
    this.httpclient.post(url, requestbody).subscribe(
      (res) => {
        console.log(res);
        this.email=''
        this.name = ''
        this.password = ''
        this.showSuccess()
      }
    )
  }
  showSuccess() {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Registration successfully!! Please login!',life:3000 });
  }
}
