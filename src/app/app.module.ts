import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { appsOutline, addOutline, clipboardOutline } from 'ionicons/icons';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeScreenComponent } from './components/home-screen/home-screen.component';
import { NewTaskScreenComponent } from './components/new-task-screen/new-task-screen.component';
import { TaskDetailScreenComponent } from './components/task-detail-screen/task-detail-screen.component';

import { CoreModule } from './core/core.module';
import { DataModule } from './data/data.module';
import { PipesModule } from './presentation/pipes/pipes.module';
import { SharedComponentsModule } from './presentation/components/shared-components.module';

// Register icons
addIcons({
  'apps-outline': appsOutline,
  'add-outline': addOutline,
  'clipboard-outline': clipboardOutline
});

@NgModule({
  imports: [
    BrowserModule,
    IonicModule.forRoot({
      innerHTMLTemplatesEnabled: true
    }),
    CoreModule,
    DataModule,
    PipesModule,
    SharedComponentsModule,
    AppRoutingModule
  ],
  declarations: [],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ]
})
export class AppModule {}
