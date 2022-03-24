import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  public userData:any = new Object();

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.getUserData();
  }

  getUserData() {
    this.userData = this.authService.getUserDetails();
    this.userData = (this.userData) ? this.userData :
    { userPhoto: "", name: "", mobile: "" ,email:""};
  }

}
