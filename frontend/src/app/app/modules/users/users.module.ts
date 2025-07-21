import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Componentes Standalone
import { UsersListComponent } from './components/users-list/users-list.component';
import { UserFormComponent } from './components/user-form/user-form.component';
import { UserDetailComponent } from './components/user-detail/user-detail.component';
import { UsersStatsComponent } from './components/users-stats/users-stats.component';

const routes: Routes = [
  { path: '', component: UsersListComponent },
  { path: 'create', component: UserFormComponent },
  { path: 'edit/:id', component: UserFormComponent },
  { path: 'view/:id', component: UserDetailComponent },
  { path: 'stats', component: UsersStatsComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ]
})
export class UsersModule { } 