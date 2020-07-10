import { Injectable } from '@angular/core';

import { Plugins, CameraResultType, Capacitor, FilesystemDirectory, 
  CameraPhoto, CameraSource } from '@capacitor/core';

import { Platform } from '@ionic/angular';
import { Console } from 'console';
import { resolve } from 'path';

const { Camera, Filesystem, Storage } = Plugins;


@Injectable({
  providedIn: 'root'
})

export class PhotoService {
  constructor(){};

  public photos: Photo [] = [];

  public format: string

  async TakePhoto () {
    this.OpenCameraAndTakePhoto()
    .then(this.FetchPhoto)
    .then(this.ConvertPhotoToBase64)
    .then(this.WritePhotoToLocalStorage)
    .catch(this.LogError)
  }

  async OpenCameraAndTakePhoto(){
    // Opens Camera; only returns once user takes and selects photo
    const photoMetadata = await Camera.getPhoto({
      quality: 100,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera
    })
    this.format = photoMetadata.format;
    console.log('photoMetadata:' + JSON.stringify(photoMetadata))
    return photoMetadata.webPath;
  }

  async FetchPhoto(webPath: string){
    const responseObj = await fetch(webPath);
    
    // Print out  fetch results. To do so, we need to re-fetch so we don't lock the body stream (?)
    await fetch(webPath).then(response => {
      response.text()
        .then(text=> {
          console.log("fetched response: " + text)
        })
    })
    return responseObj;
  }

  async ConvertPhotoToBase64(responseObj: Response){
    //convert to blob (binary large object)
    const photoBlob = await responseObj.blob();
    console.log('photoBlob:' + JSON.stringify(photoBlob))
    const base64Photo = await this.convertBlobToBase64(photoBlob) as string;

    return base64Photo;
  }

  async WritePhotoToLocalStorage(base64Photo){
    // Write photo to browser local storage
    const date = new Date();
    const time = date.getTime();
    const path = time + this.format;

    Filesystem.writeFile({
      path: path,
      data: base64Photo
    })

    console.log("File Written: " + JSON.stringify(path),
      JSON.stringify(base64Photo)
    )
    // if hybrid, readFile instead of fetch DataURL(?)
  }
  
  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result);
    };
    reader.readAsDataURL(blob);

  });

  LogError(error){
    console.log('Error Occurred: ' + error);
  }



    // someVar.finally((success) => {
    //   console.log("success: " + success)
    // })
   // error => console.log ("error: " + error)
    

    //console.log('1');
    
    //   .then(result => {
    //     console.log("result: " + JSON.stringify(result));
    //     let date = new Date();
    //     Filesystem.writeFile({
    //       path: date.getTime() + ".jpeg",
    //       data: "ldkjfld" //result.path
    //     });
    // })
    // .then(photo => {
    //     console.log("photo: " + JSON.stringify(photo));
    //   },(error) => {
    //     console.log(error);
    //   })
      
      
      // Fetch the photo, read as a blob, then convert to base64 format
   // console.log("starting fetched response")
    // const response = await fetch(somePath);
    // console.log("received fetched response")
    // // read fetch response
    // response.text().then(function (text){
    //   console.log ("fetched photo's webPath: "+ text);
    // })
    
    
    //this.photos.unshift(photo);

  

    saveToFileSystem(){

    }

    StorePhoto() {

    }

  }

class Photo {
  path: String  //hybrid only?
  webPath: String
  base64: String
}






