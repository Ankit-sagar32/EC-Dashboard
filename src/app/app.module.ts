import { NgModule, APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA  } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StartUpService } from './helpers/services/core/startup.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from './modules/shared/header/header.component';
import { LoginHeaderComponent } from './modules/shared/login-header/login-header/login-header.component';
import { EncryptDecryptService } from './helpers/services/encrpyt-decrypt-service.service';
import { ToastrModule } from 'ngx-toastr';
import { AuthGuard } from './helpers/guards';

export function init_app(appLoadService: StartUpService) {
  return () => appLoadService.getUrlSettings();
}

@NgModule({
  declarations: [
    AppComponent,
    // HeaderComponent,
    LoginHeaderComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ToastrModule.forRoot(),
  ],
  providers: [AuthGuard, { provide: APP_INITIALIZER, useFactory: init_app, multi: true, deps: [StartUpService] }, EncryptDecryptService],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
