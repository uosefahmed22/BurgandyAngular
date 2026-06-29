import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef, NgZone, PLATFORM_ID, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HeaderComponent } from '@shared/components/header.component';
import { FooterComponent } from '@shared/components/footer.component';
import { WhatsappFabComponent } from '@shared/components/whatsapp-fab.component';
import { ProductService } from '@core/services';
import { Product } from '@core/models';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner.component';
import { CloudinaryPipe } from '@shared/pipes/cloudinary.pipe';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HeaderComponent,
    FooterComponent,
    WhatsappFabComponent,
    LoadingSpinnerComponent,
    CloudinaryPipe
  ],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css',
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  private platformId = inject(PLATFORM_ID);
  private destroy$ = new Subject<void>();

  product: Product | null = null;
  loading = true;
  error = '';
  selectedImageIndex = 0;

  // Selection state
  selectedSize: string = '';
  selectedColor: string = '';
  showValidation = false;

  // Carousel state
  private autoSlideInterval: any = null;
  private autoSlideSpeed = 4000; // 4 seconds
  private isAutoSlidePaused = false;

  // Lightbox state
  lightboxOpen = false;

  get sizesArray(): string[] {
    return (
      this.product?.sizes
        ?.split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => !!s) || []
    );
  }

  get colorsArray(): string[] {
    return (
      this.product?.colors
        ?.split(',')
        .map((c: string) => c.trim())
        .filter((c: string) => !!c) || []
    );
  }

  get canReserve(): boolean {
    return !!this.selectedSize && !!this.selectedColor;
  }

  // Keyboard support for lightbox
  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {
    if (!this.lightboxOpen) return;

    switch (event.key) {
      case 'Escape':
        this.closeLightbox();
        break;
      case 'ArrowLeft':
        this.nextImage(); // RTL: left = next
        break;
      case 'ArrowRight':
        this.prevImage(); // RTL: right = prev
        break;
    }
  }

  ngOnInit(): void {
    const id = +this.route.snapshot.params['id'];

    if (!id || isNaN(id)) {
      this.error = 'معرف المنتج غير صحيح';
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    this.productService
      .getProductById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (product: Product): void => {
          this.ngZone.run(() => {
            this.product = product;
            this.loading = false;
            this.cdr.markForCheck();
            this.cdr.detectChanges();
            this.startAutoSlide();
          });
        },
        error: (error: any): void => {
          this.ngZone.run(() => {
            this.error = error?.message || 'فشل تحميل تفاصيل المنتج';
            this.loading = false;
            this.cdr.markForCheck();
            this.cdr.detectChanges();
          });
        },
      });
  }

  // ==================== CAROUSEL METHODS ====================

  nextImage(): void {
    if (!this.product || this.product.images.length <= 1) return;
    this.selectedImageIndex = (this.selectedImageIndex + 1) % this.product.images.length;
    this.cdr.detectChanges();
  }

  prevImage(): void {
    if (!this.product || this.product.images.length <= 1) return;
    this.selectedImageIndex = this.selectedImageIndex === 0
      ? this.product.images.length - 1
      : this.selectedImageIndex - 1;
    this.cdr.detectChanges();
  }

  goToImage(index: number): void {
    this.selectedImageIndex = index;
    this.cdr.detectChanges();
  }

  startAutoSlide(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.product || this.product.images.length <= 1) return;

    this.stopAutoSlide();
    this.autoSlideInterval = setInterval(() => {
      if (!this.isAutoSlidePaused && !this.lightboxOpen) {
        this.nextImage();
      }
    }, this.autoSlideSpeed);
  }

  stopAutoSlide(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  pauseAutoSlide(): void {
    this.isAutoSlidePaused = true;
  }

  resumeAutoSlide(): void {
    this.isAutoSlidePaused = false;
  }

  // ==================== LIGHTBOX METHODS ====================

  openLightbox(): void {
    if (!this.product || this.product.images.length === 0) return;
    this.lightboxOpen = true;
    this.pauseAutoSlide();
    // Prevent body scroll
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden';
    }
    this.cdr.detectChanges();
  }

  closeLightbox(): void {
    this.lightboxOpen = false;
    this.resumeAutoSlide();
    // Restore body scroll
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
    this.cdr.detectChanges();
  }

  // ==================== PRODUCT METHODS ====================

  selectSize(size: string): void {
    this.selectedSize = size;
    this.showValidation = false;
  }

  selectColor(color: string): void {
    this.selectedColor = color;
    this.showValidation = false;
  }

  goToReserve(): void {
    if (!this.canReserve) {
      this.showValidation = true;
      return;
    }
    this.router.navigate(['/reserve', this.product!.id], {
      queryParams: {
        size: this.selectedSize,
        color: this.selectedColor,
      },
    });
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
    // Ensure body scroll is restored
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
    this.destroy$.next();
    this.destroy$.complete();
  }
}
