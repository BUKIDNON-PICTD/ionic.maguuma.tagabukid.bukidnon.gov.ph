import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RolePageRoutingModule } from './role-routing.module';

import { RolePage } from './role.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RolePageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [RolePage]
})
export class RolePageModule {}
