import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),  // Enables routing
    provideHttpClient(),    // Enables HTTP requests
    provideAnimations(),    // Required for ngx-toastr
    provideToastr()         // Required for ToastrService
  ]
}).catch((err) => console.error(err));
