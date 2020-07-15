import { Injectable } from '@angular/core';

import { Plugins, CameraResultType, Capacitor, FilesystemDirectory, 
  CameraPhoto, CameraSource } from '@capacitor/core';

import { Platform } from '@ionic/angular';


const { Camera, Filesystem, Storage } = Plugins;


@Injectable({
  providedIn: 'root'
})

export class PhotoService {
  constructor(){};

  public photos: Photo [] = [];

  public format: string;
  public webPath: string;
  private PHOTO_STORAGE_KEY: string = "photo";

  JSONobj = {
    name: "mike",
    weight: 150
  }
  imageArray: object [] = [];


  Console(obj: string){
    console.log("Printing WebPath: " + obj);
  }

  async TakePhoto () { 
      const metadata = await this.OpenCameraAndTakePhoto();    
      const base64Photo = await this.FetchPhoto(metadata);
      const imageObj = await this.WritePhotoToLocalStorage(base64Photo);
      this.photos.unshift(imageObj);

      console.log("photos Array after I take picture: " +  JSON.stringify(this.photos))
      
      Storage.set({
        key: this.PHOTO_STORAGE_KEY,
        value: JSON.stringify(this.photos)
      })
  }

  async loadPhotosFromStorage(){
    console.log("JSONobj: " + this.JSONobj)
    console.log("stringify(JSONobj): " + JSON.stringify(this.JSONobj))
    
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
    console.log('photoMetadata:' + JSON.stringify(photoMetadata))
    console.log('photoMetadata.webPath:' + JSON.stringify(photoMetadata.webPath))
    return photoMetadata;
  } 

  async FetchPhoto(photoMetadata){
    const responseObj = await fetch(photoMetadata.webPath);
    //debugger;

    // if web, fetch DataURL(?)

    // Print out fetch results. To do so, we need to re-fetch so we don't lock the body stream (?)
    await fetch(photoMetadata.webPath).then(response => {
      response.text()
        .then(text=> {
          console.log("fetched response: " + text)
        })
    })

    // If hybrid, readFile (instead of fetch)
      // Todo
    
    const blob = await responseObj.blob();
    console.log('photoBlob:' + JSON.stringify(blob));
    return await this.convertBlobToBase64(blob) as string;

    //const base64Photo = await this.convertBlobToBase64(blobImage) as string;
    //return base64Photo;
  }

  // async ConvertPhotoToBase64(blob){
  //   //convert to blob (binary large object)
    
    
  // }

  async WritePhotoToLocalStorage(base64Photo){
    // Write photo to browser local storage
    const date = new Date();
    const time = date.getTime();
    const path = time + this.format;
    
    //debugger;

    Filesystem.writeFile({
      path: path,
      data: base64Photo,
      directory: FilesystemDirectory.Data
    })

    console.log("File Written: " + JSON.stringify(path),
      JSON.stringify(base64Photo)
    )
    return({
      path: path,
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

  LogError(err){
    console.error('%c Error Occurred: ', 'background: #FF0000; color: #00000' + err.stack);
  }
  
}

class Photo {
  path: String  //hybrid only?
  webPath: String
  base64?: String
}






