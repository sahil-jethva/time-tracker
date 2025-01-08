import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Clients } from "../modals/modal";
@Injectable({
  providedIn: 'root',
})
export class DefaultService {
  constructor(private httpClient: HttpClient) { }
  getCLient() {
    return this.httpClient.get<Clients[]>('http://localhost:3000/client')
  }
}
