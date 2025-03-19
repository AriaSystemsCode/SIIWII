import { Component } from '@angular/core';
import { Router } from '@node_modules/@angular/router';

@Component({
  selector: 'app-public',
  templateUrl: './public.component.html',
  styleUrls: ['./public.component.scss']
})
export class PublicComponent {

  constructor(private router: Router) {}


  
  redirectToLogin() {
    this.router.navigate(['/account/login']);  // ✅ Change to your actual login route
  }
}
