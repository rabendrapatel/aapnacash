import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
  ) { }

  getUserDetails() {
    return JSON.parse(localStorage.getItem('userDetails'));
  }

  getLoginDetails() {
    return JSON.parse(localStorage.getItem('loginDetails'));
  }

  isLogin() {
    let userDetails = this.getLoginDetails();
    let isLogin = (userDetails && userDetails.accessToken) ? true : false;
    return isLogin;
  }

  getAccessToken() {
    let userDetails = this.getLoginDetails();
    let accessToken = "";
    if(userDetails && userDetails.accessToken){
      accessToken =  userDetails.tokenType + " " + userDetails.accessToken;
    }
    return accessToken;
  }


  getPermission() {
    let userDetails = this.getUserDetails();
    let assignPermission = new Array();
    if(userDetails && userDetails.id){
      let permission =  userDetails.permission;
      assignPermission = permission.split(',');
      assignPermission = assignPermission.filter(function (el) {
        return el != '';
      });
    }
    return assignPermission;
  }


  checkPermission(permissionId) {
    let userDetails = this.getUserDetails();
    let assignPermission = new Array();
    if(userDetails && userDetails.id){
      let permission =  userDetails.permission;
      assignPermission = permission.split(',');
      
    }
    return (assignPermission.indexOf(permissionId) > -1) ? true : false;
  }


}
