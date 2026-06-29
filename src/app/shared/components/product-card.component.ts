import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '@core/models';

import { CloudinaryPipe } from '../pipes/cloudinary.pipe';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, CloudinaryPipe],
  templateUrl: './product-card.component.html'
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  
  get mainImage(): string {
    return this.product.images?.[0]?.imageUrl || 'https://via.placeholder.com/300x400?text=No+Image';
  }
}
