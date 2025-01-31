import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Clients, UserLoginDetail } from "../modals/modal";
import { apiURL } from "../../env";
@Injectable({
  providedIn: 'root',
})
export class DefaultService {
  constructor(private httpClient: HttpClient) { }
  getCLient() {
    return this.httpClient.get<Clients[]>(`${apiURL}/client`)
  }
  getMe() {
    return this.httpClient.get<{ user: UserLoginDetail }>(`${apiURL}/me`)
  }
}
