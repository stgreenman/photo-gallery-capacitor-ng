import { Injectable } from '@angular/core';

import { Plugins, CameraResultType, Capacitor, FilesystemDirectory, 
  CameraPhoto, CameraSource } from '@capacitor/core';

import { Platform } from '@ionic/angular';

const { Camera, Filesystem, Storage } = Plugins;


@Injectable({
  providedIn: 'root'
})

export class PhotoService {


  public photos: Photo [] = [];
  public format: string;
  public webPath: string;
  private PHOTO_STORAGE_KEY: string = "photo";
  private platform: Platform

  constructor(platform: Platform){
    this.platform = platform;
  };

  async TakePhoto () { 
      const metadata = await this.OpenCameraAndTakePhoto();    
      const base64Photo = await this.FetchPhoto(metadata);
      const imageObj = await this.WritePhotoToFileServer(base64Photo);
      this.photos.unshift(imageObj);
      await this.AddImageToStorage();
  }

  async AddImageToStorage(){
    // Image gets saved to each device's [Key, Value] DB for application defaults. 
    // Web: Local Storage DB 
    // iOS: User Default DB
    // Android: Shared Prefences DB

    console.log("photos Array (after user-taken photo is added): " +  JSON.stringify(this.photos))
    
    // Update storage with entire photos array; ToDo: Determine if updating entire array is necessary-- could optimize by only updating only new photo
    Storage.set({
      key: this.PHOTO_STORAGE_KEY,
      value: JSON.stringify(this.photos)
    })
  }

  async loadPhotosFromStorage(){
    const photos = await Storage.get({
      key: this.PHOTO_STORAGE_KEY
    });
    console.log("photos.value: " + JSON.parse(photos.value));
    
    this.photos = JSON.parse(photos.value) || [];
  }

  async OpenCameraAndTakePhoto(){
    // Opens Camera; only returns once user takes and selects photo
    const photoMetadata = await Camera.getPhoto({
      quality: 100,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera
    })
    this.format = photoMetadata.format;
    this.webPath = photoMetadata.webPath;
    console.log ('Filesystem Directory.Data: ' + FilesystemDirectory.Data)
    console.log('photoMetadata:' + JSON.stringify(photoMetadata))
    console.log('photoMetadata.webPath:' + JSON.stringify(photoMetadata.webPath))
    return photoMetadata;
  } 


  async FetchPhoto(photoMetadata){
  //Grab the image from cache

    // if mobile
    if (this.platform.is("hybrid")){
      let file = await Filesystem.readFile({
        path: photoMetadata.webPath,
        directory: FilesystemDirectory.Data
      })
      console.log("(Mobile) File.data: " + file.data)
      return (file).data; // I believe this returns base64 data
    }

    // if web
    else{
      const responseObj = await fetch(photoMetadata.webPath);
      // Print out fetch results. To do so, we need to re-fetch so we don't lock the body stream (?)
      await fetch(photoMetadata.webPath).then(response => {
        response.text()
          .then(text=> {
            console.log("(Web) Fetch Response: " + text)
          })
      })
      const blob = await responseObj.blob();
      console.log('photoBlob:' + JSON.stringify(blob));
      return await this.convertBlobToBase64(blob) as string;
    }
  }


  async WritePhotoToFileServer(base64Photo: string){
    // Write photo to browser local storage
    const date = new Date();
    const time = date.getTime();
    const fileName = time + "." + this.format;

    Filesystem.writeFile({
      path: fileName,
      data: base64Photo,
      directory: FilesystemDirectory.Data
    })

    console.log("File Written: " + JSON.stringify(fileName),
      JSON.stringify(base64Photo)
    )
    return({
      fileName: fileName,
      webPath: this.webPath
    })
  }

  
  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });


  async deletePhoto (photo, position: number){
    this.photos.splice(position, 1);

    Storage.set({
      key: this.PHOTO_STORAGE_KEY,
      value: JSON.stringify(this.photos)

    })

    const fileName = photo.fileName.substr(photo.fileName.lastIndexOf('/') + 1);
    await Filesystem.deleteFile({
      path: fileName,
      directory: FilesystemDirectory.Data
    })
  }

  LogError(err){
    console.error('%c Error Occurred: ', 'background: #FF0000; color: #00000' + err.stack);
  }

  Console(obj: string){
    console.log("Printing WebPath: " + obj);
  }
}

class Photo {
  fileName: String  //hybrid only?
  webPath: String
  base64?: String
}






