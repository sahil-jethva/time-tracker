import { Component } from '@angular/core';
import { LocalStorageService } from '../../Services/localStorage.service';
import { MessageService } from 'primeng/api';
import { RouterLink } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-logout',
  imports: [SharedModule,RouterLink],
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
