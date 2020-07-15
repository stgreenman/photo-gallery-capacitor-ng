import {Component} from '@angular/core';
import { PhotoService } from '../services/photo.service';
import { ActionSheetController } from '@ionic/angular';
import { Action } from 'rxjs/internal/scheduler/Action';

@Component ({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page{
  constructor(
    public photoService: PhotoService, 
    public actionSheet: ActionSheetController
    ){}

  ngOnInit(){
    this.photoService.loadPhotosFromStorage();
  }  
  
  async showActionController(photo, position: number){
    const actionSheet = await this.actionSheet.create({
      header: photo.path,
      //cssClass: 'my-custom-class',
      buttons: [{
        text: 'Delete',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
          this.photoService.deletePhoto(photo, position);
          console.log('Delete clicked');
        }
      }, {
        text: 'Cancel',
        role: 'cancel',
        icon: 'close',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    })
    await actionSheet.present();
  }


}