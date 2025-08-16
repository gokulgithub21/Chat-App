import { RouterModule, Routes } from '@angular/router';
import { SignupComponent } from './chat-app/signup/signup.component';
import { SigninComponent } from './chat-app/signin/signin.component';
import { ChatlistComponent } from './chat-app/chatlist/chatlist.component';
import { GroupchatComponent } from './chat-app/groupchat/groupchat.component';
import { ProfileComponent } from './chat-app/profile/profile.component';
import { StatuscodeErrorComponent } from './chat-app/statuscode-error/statuscode-error.component';
import { ForgotpasswordComponent } from './chat-app/forgotpassword/forgotpassword.component';
import { NgModule } from '@angular/core';
import { HttpClientModule, provideHttpClient, withFetch  } from '@angular/common/http';
import { AuthGuard } from './auth.guard';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; 
import { ToastrModule } from 'ngx-toastr';

export const routes: Routes = [

    
    {path:'',component:SigninComponent},
    {path:'signup',component:SignupComponent},
    {path:'chatlist',component:ChatlistComponent,canActivate: [AuthGuard]},
    {path:'groupchat',component:GroupchatComponent,canActivate: [AuthGuard]},
    {path:'profile',component:ProfileComponent,canActivate: [AuthGuard]},
    {path:'forgotpassword',component:ForgotpasswordComponent},
    {path:'**',redirectTo: ''},
    
    
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes), HttpClientModule,BrowserAnimationsModule, ToastrModule.forRoot()],
  providers: [
    provideHttpClient(withFetch()),
    AuthGuard

  ]
})
export class AppRoutingModule {}