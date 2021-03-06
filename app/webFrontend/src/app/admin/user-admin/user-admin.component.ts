import {Component, OnInit} from '@angular/core';
import {UserDataService} from '../../shared/services/data.service';
import {Router} from '@angular/router';
import {ShowProgressService} from '../../shared/services/show-progress.service';
import {SnackBarService} from '../../shared/services/snack-bar.service';
import {IUser} from '../../../../../../shared/models/IUser';
import {DialogService} from '../../shared/services/dialog.service';
import {UserService} from '../../shared/services/user.service';

@Component({
  selector: 'app-user-admin',
  templateUrl: './user-admin.component.html',
  styleUrls: ['./user-admin.component.scss'],
})
export class UserAdminComponent implements OnInit {

  allUsers: IUser[];
  availableRoles: String[];

  constructor(private userDataService: UserDataService,
              private router: Router,
              private showProgress: ShowProgressService,
              public  snackBar: SnackBarService,
              public  dialogService: DialogService,
              private userService: UserService) {
  }

  ngOnInit() {
    this.getUsers();
    this.getRoles();
  }

  getAllUsers(): IUser[] {
    return this.allUsers;
  }

  getUsers() {
    this.userDataService.readItems<IUser>().then(users => {
      this.allUsers = users;
    });
  }

  getRoles() {
    this.userDataService.getRoles().then(roles => {
      this.availableRoles = roles;
    });
  }

  async updateRole(userIndex: number) {
    this.showProgress.toggleLoadingGlobal(true);
    try {
      const user = await this.userDataService.updateItem(this.allUsers[userIndex]);
      this.snackBar.open('Role of user ' + user.email + ' successfully updated to ' + user.role);
    } catch (err) {
      this.snackBar.open(err.error.message);
    }
    this.showProgress.toggleLoadingGlobal(false);
  }

  editUser(userIndex: number) {
    const link = `/profile/${this.allUsers[userIndex]._id}/edit`;
    this.router.navigate([link]);
  }

  deleteUser(userIndex: number) {
    this.dialogService.confirmDelete('user', this.allUsers[userIndex].email)
      .subscribe(async res => {
        if (!res) {
          return;
        }

        this.showProgress.toggleLoadingGlobal(true);
        const user = this.allUsers[userIndex];

        try {
          await this.userDataService.deleteItem(user);
          this.snackBar.open('User ' + user.email + ' was successfully deleted.');
        } catch (err) {
          this.snackBar.open(err.error.message);
        }

        this.getUsers();
        this.showProgress.toggleLoadingGlobal(false);
    });
  }
}
