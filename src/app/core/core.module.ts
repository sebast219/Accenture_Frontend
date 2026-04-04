import { NgModule } from '@angular/core';
import { IonicStorageModule } from '@ionic/storage-angular';
import { StorageService } from './services/storage.service';
import { TaskService } from './services/task.service';
import { CategoryService } from './services/category.service';
import { FirebaseService } from './services/firebase.service';

@NgModule({
  imports: [
    IonicStorageModule.forRoot({
      name: '__tododb',
      driverOrder: ['indexeddb', 'sqlite', 'websql', 'localstorage'],
      dbKey: '_ionickey',
      storeName: '_ionstoragedb'
    }),
  ],
  providers: [
    StorageService,
    TaskService,
    CategoryService,
    FirebaseService,
  ]
})
export class CoreModule {}
