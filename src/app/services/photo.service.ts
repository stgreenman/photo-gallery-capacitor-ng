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

  public format: string

  async TakePhoto () { 
    try{
      const metadata = await this.OpenCameraAndTakePhoto();    
      const base64Photo = await this.FetchPhoto(metadata);
      this.WritePhotoToLocalStorage(base64Photo);
    }
    catch(error){
      this.LogError(error)
    }
    // Promise Chaining - I can't figure out how to get this work - it doesn't seem to be passing the values to each upcoming function
    // this.OpenCameraAndTakePhoto()
    // .then(this.FetchPhoto)
    // .then(this.WritePhotoToLocalStorage)
    // .catch(this.LogError)
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
    console.log('photoMetadata.webPath:' + JSON.stringify(photoMetadata.webPath))
    return photoMetadata;
  } 

  async FetchPhoto(photoMetadata){
    const responseObj = await fetch(photoMetadata.webPath);
    
    // Print out fetch results. To do so, we need to re-fetch so we don't lock the body stream (?)
    await fetch(photoMetadata.webPath).then(response => {
      response.text()
        .then(text=> {
          console.log("fetched response: " + text)
        })
    })
    
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
    console.log('%c Error Occurred: ', 'background: #FF0000; color: #00000' + error);
  }
  

}

class Photo {
  path: String  //hybrid only?
  webPath: String
  base64: String
}






