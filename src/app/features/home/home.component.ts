import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HeaderComponent } from '../../shared/components/header.component';
import { FooterComponent } from '../../shared/components/footer.component';
import { WhatsappFabComponent } from '../../shared/components/whatsapp-fab.component';
import { CategoryService, Category } from '@core/services';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    HeaderComponent,
    FooterComponent,
    WhatsappFabComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  private categoryService = inject(CategoryService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  private destroy$ = new Subject<void>();

  categories: Category[] = [];
  searchTerm = '';
  loadingCategories = true;
  hasError = false;
  categoriesError = false;

  get filteredCategories(): Category[] {
    if (!this.searchTerm.trim()) {
      return this.categories;
    }
    return this.categories.filter((category) =>
      category.name.toLowerCase().includes(this.searchTerm.toLowerCase()),
    );
  }

  ngOnInit() {
    console.log('🏠 HomeComponent initialized');
    this.loadCategories();
  }

  loadCategories() {
    console.log('🔍 Loading categories...');
    this.loadingCategories = true;
    this.hasError = false;
    this.categoriesError = false;

    this.categoryService
      .getCategories(true)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories: Category[]) => {
          console.log('✅ HomeComponent received categories:', categories);

          // Ensure change detection works properly
          this.ngZone.run(() => {
            this.categories = [...categories]; // Create new array reference
            this.loadingCategories = false;
            this.hasError = false;
            this.categoriesError = false;
            this.cdr.markForCheck();
            this.cdr.detectChanges();
            console.log('✅ Categories rendered on page:', this.categories);
          });
        },
        error: (error: any) => {
          console.error('❌ HomeComponent failed to load categories:', error);

          this.ngZone.run(() => {
            this.hasError = true;
            this.categoriesError = true;
            this.loadingCategories = false;
            this.cdr.detectChanges();
          });
        },
      });
  }

  onImageError(event: Event) {
    console.log('Image failed to load, hiding:', event);
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  openWhatsApp() {
    window.open('https://wa.me/2001141841861', '_blank');
  }

  scrollToContact(): void {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  ngOnDestroy() {
    console.log('🏠 HomeComponent destroyed');
    this.destroy$.next();
    this.destroy$.complete();
  }
}
