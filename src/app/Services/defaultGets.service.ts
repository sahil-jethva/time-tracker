import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Clients, UserLoginDetail } from "../modals/modal";
@Injectable({
  providedIn: 'root',
})
export class DefaultService {
  constructor(private httpClient: HttpClient) { }
  getCLient() {
    return this.httpClient.get<Clients[]>('http://localhost:3000/client')
  }
  getMe() {
    return this.httpClient.get<{ user: UserLoginDetail }>('http://localhost:3000/me')
  }
}
