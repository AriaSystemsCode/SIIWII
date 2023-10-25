import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class FileDownloadService {

  constructor(
    private http: HttpClient) { }

  downloadFile(completeUrl: string, fileNameSaved: string, requireAuthorization: boolean) {
    this.http.get(`${completeUrl}`, {
      responseType: 'blob'
    }
    ).subscribe(response => this.downLoadFile(response, "application/octet-stream", fileNameSaved));

  }

  downLoadFile(data: any, type: string, fileName: string) {
    let blob = new Blob([data], { type: type });
    saveAs(blob, fileName);
  }

  download(url, name) {

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';
    xhr.onload = function (this, event) {
        var blob = this.response;
        saveAs(blob, name);
    }
    xhr.send();
  }

}
