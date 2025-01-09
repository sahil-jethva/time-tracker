import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MegaMenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { MegaMenu } from 'primeng/megamenu';
import { Tooltip } from 'primeng/tooltip';
import { UserLoginDetail } from '../../modals/modal';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-navbar',
  imports: [ButtonModule, MegaMenu, CommonModule, AvatarModule, Tooltip,RouterLink],
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  items: MegaMenuItem[] | undefined;
  details: UserLoginDetail  | undefined | null = null;
  constructor(
    private httpClient: HttpClient
  ) {}
  ngOnInit() {
    this.items = [
      {
        label: 'Home',
        icon: 'pi pi-home',
        root: true,
        routerLink: '/Home'
      },
      {
        label: 'Time-Tracker',
        icon: 'pi pi-clock',
        root: true,
        routerLink:'/timeTracker'
      }
    ];
    this.userLoggedInDetail()
  }
  userLoggedInDetail() {
    const url = 'http://localhost:3000/me'
    this.httpClient.get<{ user: UserLoginDetail }>(url).subscribe(
      (res) => {
        this.details = res.user
      }
    )
  }
  gi(para: string | undefined) {
    const img = `https://avatar.iran.liara.run/public/boy?username=${para}`
    return img
  }
}
