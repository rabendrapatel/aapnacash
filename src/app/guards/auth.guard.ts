import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private authService:AuthService
  ) {}

  canActivate() {
    if(this.authService.isLogin()){
        this.router.navigate(['dashboard']);
        return true;
    }else {
      console.log(111)
        this.router.navigate(['login']);
        return false;
    }
  }
}
