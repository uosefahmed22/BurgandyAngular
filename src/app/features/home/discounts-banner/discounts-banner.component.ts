import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CloudinaryPipe } from '../../../shared/pipes/cloudinary.pipe';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models';

@Component({
  selector: 'app-discounts-banner',
  standalone: true,
  imports: [CommonModule, RouterLink, CloudinaryPipe],
  template: `
    @if (loading) {
      <section class="discounts-section" style="min-height: 400px; display: flex; align-items: center; justify-content: center;">
        <div style="color: #722f37; font-weight: 600;">جاري تحميل العروض...</div>
      </section>
    } @else if (discountedProducts.length > 0) {
      <section class="discounts-section">
        <div class="discounts-container">
          <!-- Header -->
          <div class="discounts-header">
            <h2 class="discounts-title">🔥 عروض هذا الأسبوع</h2>
            <p class="discounts-subtitle">خصومات حصرية لفترة محدودة</p>
          </div>

          <!-- Products Grid -->
          <div class="discounts-grid">
            @for (product of discountedProducts; track product.id) {
              <article>
                <a [routerLink]="['/products', product.id]" class="discount-card" [attr.aria-label]="'عرض تفاصيل ' + product.name">
                  <!-- Discount Badge -->
                <div class="discount-badge">{{ product.discountPercentage }}%−</div>

                <!-- Image -->
                <div class="discount-image-wrapper">
                  @if (product.images && product.images.length > 0) {
                    <img
                      [src]="product.images[0].imageUrl | cloudinary"
                      [alt]="product.name"
                      class="discount-image"
                      width="240"
                      height="260"
                      loading="lazy"
                    />
                  } @else {
                    <div class="discount-image-placeholder">
                      <span>📷</span>
                    </div>
                  }
                </div>

                <!-- Info -->
                <div class="discount-info">
                  <h3 class="discount-product-name">{{ product.name }}</h3>
                  <div class="discount-prices">
                    <span class="discount-original-price">{{ product.price }} ج.م</span>
                    <span class="discount-sale-price">{{ product.salePrice }} ج.م</span>
                  </div>
                  <div class="discount-timer">
                    ⏰
                    @if (product.discountRemainingDays === 0) {
                      ينتهي اليوم!
                    } @else if (product.discountRemainingDays === 1) {
                      باقي يوم واحد
                    } @else {
                      باقي {{ product.discountRemainingDays }} أيام
                    }
                  </div>
                  </div>
                </a>
              </article>
            }
          </div>

          <!-- CTA -->
          <div class="discounts-cta">
            <a routerLink="/products" class="discounts-cta-btn"> شاهدي كل المنتجات ← </a>
          </div>
        </div>
      </section>
    }
  `,
  styles: [
    `
      .discounts-section {
        padding: 3rem 1rem;
        background: linear-gradient(135deg, #fdf8f6 0%, #fff5f5 50%, #fdf8f6 100%);
      }

      .discounts-container {
        max-width: 1200px;
        margin: 0 auto;
      }

      .discounts-header {
        text-align: center;
        margin-bottom: 2rem;
      }

      .discounts-title {
        font-size: 1.8rem;
        font-weight: 700;
        color: #722f37;
        margin-bottom: 0.5rem;
      }

      .discounts-subtitle {
        color: #8b6f6f;
        font-size: 1rem;
      }

      .discounts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
      }

      .discount-card {
        background: white;
        border-radius: 16px;
        overflow: hidden;
        position: relative;
        text-decoration: none;
        color: inherit;
        box-shadow: 0 2px 12px rgba(114, 47, 55, 0.08);
        transition:
          transform 0.3s ease,
          box-shadow 0.3s ease;
      }

      .discount-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(114, 47, 55, 0.15);
      }

      .discount-badge {
        position: absolute;
        top: 12px;
        right: 12px;
        background: #dc3545;
        color: white;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 700;
        z-index: 2;
      }

      .discount-image-wrapper {
        width: 100%;
        height: 260px;
        overflow: hidden;
      }

      .discount-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }

      .discount-card:hover .discount-image {
        transform: scale(1.05);
      }

      .discount-image-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f5f0f0;
        font-size: 2rem;
      }

      .discount-info {
        padding: 1rem;
        text-align: center;
      }

      .discount-product-name {
        font-size: 1rem;
        font-weight: 600;
        color: #333;
        margin-bottom: 0.5rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .discount-prices {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        margin-bottom: 0.5rem;
      }

      .discount-original-price {
        text-decoration: line-through;
        color: #999;
        font-size: 0.9rem;
      }

      .discount-sale-price {
        color: #198754;
        font-weight: 700;
        font-size: 1.15rem;
      }

      .discount-timer {
        font-size: 0.8rem;
        color: #fd7e14;
        font-weight: 500;
      }

      .discounts-cta {
        text-align: center;
      }

      .discounts-cta-btn {
        display: inline-block;
        padding: 10px 28px;
        background: #722f37;
        color: white;
        border-radius: 30px;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.95rem;
        transition:
          background 0.3s ease,
          transform 0.2s ease;
      }

      .discounts-cta-btn:hover {
        background: #5a252c;
        color: white;
        transform: scale(1.03);
      }

      @media (max-width: 768px) {
        .discounts-section {
          padding: 2rem 0.75rem;
        }

        .discounts-title {
          font-size: 1.4rem;
        }

        .discounts-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .discount-image-wrapper {
          height: 180px;
        }
      }

      @media (max-width: 480px) {
        .discounts-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        .discount-image-wrapper {
          height: 150px;
        }

        .discount-info {
          padding: 0.6rem;
        }

        .discount-product-name {
          font-size: 0.85rem;
        }
      }
    `,
  ],
})
export class DiscountsBannerComponent implements OnInit {
  private productService = inject(ProductService);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  discountedProducts: Product[] = [];
  loading = true;

  ngOnInit(): void {
    // Only fetch on the browser — SSR can't reach the API via proxy
    if (isPlatformBrowser(this.platformId)) {
      this.productService.getDiscountedProducts().subscribe({
        next: (products) => {
          this.discountedProducts = products.slice(0, 8);
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.discountedProducts = [];
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
    } else {
      this.loading = false;
    }
  }
}
