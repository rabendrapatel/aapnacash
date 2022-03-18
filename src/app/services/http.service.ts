import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ReqMethod } from '../shared/function/method';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) { }

  callApi(url, request, method): Observable<any> {
      if (method == ReqMethod.POST) {
        return this.http.post<any>(environment.backEndUrl + url, request);
      }else if (method == ReqMethod.PUT) {
        return this.http.put<any>(environment.backEndUrl + url, request);
      } else if (method == ReqMethod.GET) {
        return this.http.get<any>(environment.backEndUrl + url);
      }
  }

  callAuthApi(url, request,method): Observable<any> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'jwt-token'
      })
    };
    let  token = this.authService.getAccessToken();
    httpOptions.headers = httpOptions.headers.set('Authorization',token);

    if (method == ReqMethod.POST) {
      return this.http.post<any>(environment.backEndUrl + url, request,httpOptions);
    }else if (method == ReqMethod.PUT) {
      return this.http.put<any>(environment.backEndUrl + url, request,httpOptions);
    } else if (method == ReqMethod.GET) {
      return this.http.get<any>(environment.backEndUrl + url,httpOptions);
    }

  }


}
