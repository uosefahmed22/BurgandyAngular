import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cloudinary',
  standalone: true
})
export class CloudinaryPipe implements PipeTransform {
  transform(url: string, params: string = 'f_auto,q_auto'): string {
    if (!url) return '';
    if (url.includes('/upload/')) {
      return url.replace('/upload/', `/upload/${params}/`);
    }
    return url;
  }
}
