import {Component, OnInit} from '@angular/core';
import {UserService} from './shared/services/user.service';
import {AuthenticationService} from './shared/services/authentication.service';
import {ShowProgressService} from './shared/services/show-progress.service';
import {Router} from '@angular/router';
import {APIInfoService, UserDataService} from './shared/services/data.service';
import {APIInfo} from './models/APIInfo';
import {isNullOrUndefined} from 'util';
import {RavenErrorHandler} from './shared/services/raven-error-handler.service';
import {SnackBarService} from './shared/services/snack-bar.service';
import {ThemeService} from './shared/services/theme.service';
import {TranslateService} from '@ngx-translate/core';

const md5 = require('blueimp-md5');

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    title = 'app works!';
    showProgressBar = false;
    apiInfo: APIInfo;
    actualProfilePicturePath: any;

    constructor(private router: Router,
                private authenticationService: AuthenticationService,
                public userService: UserService,
                private showProgress: ShowProgressService,
                private apiInfoService: APIInfoService,
                private ravenErrorHandler: RavenErrorHandler,
                private snackBar: SnackBarService,
                private themeService: ThemeService,
                public translate: TranslateService) {
        translate.setDefaultLang('en');

        showProgress.toggleSidenav$.subscribe(
            toggle => {
                this.toggleProgressBar();
            }
        );
    }

    ngOnInit(): void {
        const lang = localStorage.getItem('lang') || this.translate.getBrowserLang() || this.translate.getDefaultLang();
        this.translate.use(lang);

        this.authenticationService.reloadUser();

        this.apiInfoService.readAPIInfo()
            .then((info: any) => {
                this.ravenErrorHandler.setup(info.sentryDsn);
                this.apiInfo = info;
            })
            .catch((err) => {
                this.snackBar.open('Could not connect to backend', null);
            });

        this.updateCurrentUser();

        this.userService.data.subscribe(actualProfilePicturePath => {
            this.actualProfilePicturePath = actualProfilePicturePath;

            if (this.actualProfilePicturePath === undefined && this.userService.user.profile.picture) {
                this.actualProfilePicturePath = this.userService.user.profile.picture.path;
            }
        });
    }

    updateCurrentUser() {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            this.userService.setUser(storedUser);
        }
    }

    changeLanguage(lang: string) {
        localStorage.setItem('lang', lang);
        this.translate.use(lang);
    }

    hasWarning() {
        return !isNullOrUndefined(this.apiInfo) && !isNullOrUndefined(this.apiInfo.nonProductionWarning);
    }

    isLoggedIn() {
        return this.authenticationService.isLoggedIn;
    }

    logout() {
        this.actualProfilePicturePath = '';
        this.authenticationService.logout();
    }

    toggleProgressBar() {
        this.showProgressBar = !this.showProgressBar;
    }

    isAdmin(): boolean {
        return this.userService.isAdmin();
    }

    isStudent(): boolean {
        return this.userService.isStudent();
    }

    specialContainerStyle(): string {
        const routeTest = /^(\/|\/login|\/register|\/reset|\/activation-resend)$/.test(this.router.url);

        return (routeTest && !this.isLoggedIn()) ? 'special-style' : '';
    }
}
