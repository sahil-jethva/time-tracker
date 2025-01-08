import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Toast } from 'primeng/toast';
import { LocalStorageService } from '../../Services/localStorage.service';
import { MessageService } from 'primeng/api';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-logout',
  imports: [Toast, ButtonModule,RouterLink],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.scss',
  providers: [MessageService]
})
export class LogoutComponent {
  constructor(private localStorage: LocalStorageService){}
  logout() {
    this.localStorage.removeToken()
    console.log('user logged out');

  }
}
