import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const currentUserEmail = sessionStorage.getItem('current_user_email'); // Changed from localStorage to sessionStorage

    if (currentUserEmail) {
      try {
        const user = JSON.parse(sessionStorage.getItem(`user_${currentUserEmail}`) || '{}');

        if (user && user.email) {
          console.log(`✅ AuthGuard: Access granted for ${user.email}`);
          return true;
        }
      } catch (error) {
        console.error("❌ AuthGuard: Error parsing user data", error);
      }
    }

    console.warn("🚨 AuthGuard: No active session found. Redirecting to login.");
    this.router.navigate(['']); // Redirect to login page
    return false;
  }
}
