import { SettingService } from './setting.service';
import { Platform, AlertController } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Storage } from '@ionic/storage';
import { environment } from '../../environments/environment';
import { tap, catchError } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { UserData } from '../providers/user-data';

const TOKEN_KEY = 'access_token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  url = environment.url;
  user = null;
  authenticationState = new BehaviorSubject(false);
  syncserver: any;
  hasSettings =  new BehaviorSubject(false);

  constructor(
    private http: HttpClient,
    private helper: JwtHelperService,
    private storage: Storage,
    private plt: Platform,
    private alertController: AlertController,
    private settingservice: SettingService,
    public router: Router,
    public userData: UserData,
    ) {
      this.plt.ready().then(() => {
        this.checkToken();
        this.checkSyncServer();
    });
  }

  checkToken() {
    this.storage.get(TOKEN_KEY).then(token => {
      if (token) {
        let decoded = this.helper.decodeToken(token);
        let isExpired = this.helper.isTokenExpired(token);

        if (!isExpired) {
          this.user = decoded;
          this.authenticationState.next(true);
        } else {
          this.storage.remove(TOKEN_KEY).then(() => {
            this.authenticationState.next(false);
          });
        }
      }
    });
  }
  checkSyncServer() {
    this.settingservice.getItemByName('syncserver').then(item => {
      if (item) {
        this.syncserver = item.value;
        this.hasSettings.next(true);
      } else {
        this.hasSettings.next(false);
      }
  });
  }

  register(credentials) {
    return this.http.post(`${this.syncserver}/api/register`, credentials).pipe(
      tap( res => {
        // this.userData.signup(credentials.username);
        // this.router.navigateByUrl('/app/tabs/about');
        this.login(credentials).subscribe();
      }),
      catchError(e => {
        this.showAlert(e.error.msg);
        throw new Error(e);
      })
    );
  }

  changepassword(credentials) {
    return this.http.post(`${this.syncserver}/api/changepassword`, credentials).pipe(
      tap( res => {
        return res;
        // this.login(credentials).subscribe();
        // console.log(res);
        // this.storage.set(TOKEN_KEY, res['token']);
        // this.user = this.helper.decodeToken(res['token']);
        // this.authenticationState.next(true);
        // this.router.navigateByUrl('/app/tabs/about');
        // this.userData.signup(credentials.username);
        // this.router.navigateByUrl('/app/tabs/about');
      }),
      catchError(e => {
        this.showAlert(e.error.msg);
        throw new Error(e);
      })
    );
  }

  login(credentials) {
    return this.http.post(`${this.syncserver}/api/login`, credentials)
      .pipe(
        tap(res => {
          this.storage.set(TOKEN_KEY, res['token']);
          this.user = this.helper.decodeToken(res['token']);
          this.authenticationState.next(true);
          // this.userData.login(credentials);
          // this.router.navigateByUrl('/app/tabs/about');
        }),
        catchError(e => {
          this.showAlert(e.error.msg);
          throw new Error(e);
        })
      );
  }

  logout() {
    this.storage.remove(TOKEN_KEY).then(() => {
      this.authenticationState.next(false);
      // this.router.navigateByUrl('/login');
    });
  }

  getSpecialData() {
    return this.http.get(`${this.syncserver}/api/special`).pipe(
      catchError(e => {
        let status = e.status;
        if (status === 401) {
          this.showAlert('You are not authorized for this!');
          this.logout();
        }
        throw new Error(e);
      })
    )
  }


  isAuthenticated() {
    return this.authenticationState.value;
  }

  hasRole(roles: string[]): boolean {
    if (this.isAuthenticated && roles.includes(this.user.role.code.toLowerCase())) {
      return true;
    }
    return false;
  }

  showAlert(msg) {
    let alert = this.alertController.create({
      message: msg,
      header: 'Error',
      buttons: ['OK']
    });
    alert.then(alert => alert.present());
  }
}
