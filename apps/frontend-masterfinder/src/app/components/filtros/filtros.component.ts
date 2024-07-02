import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FiltrosService } from '../../../services/filtros.service';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-filtros',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './filtros.component.html',
  styleUrls: ['./filtros.component.scss'],
})
export class FiltrosComponent implements OnInit, OnDestroy {

  @ViewChild('carouselContainer') carouselContainer!: ElementRef;
  currentIndex = 0;
  carouselInterval: any;
  visibleItems = 3;

  public postings: any[] = [];
  public selectedJobType: string = '';
  public jobTypes: string[] = ['Carpintería', 'Electricidad', 'Gasfitería'];
  activeAccordion: string | null = null;
  postingspremium: any[] = [];
  errorMessage: string = 'errooor!';

  constructor(private postingService: FiltrosService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.loadPostings();
    this.loadPostingsPremium();
    this.updateVisibleItems();
    window.addEventListener('resize', this.updateVisibleItems.bind(this));
    this.startCarousel();
  }

  ngOnDestroy() {
    this.clearCarouselInterval();
    window.removeEventListener('resize', this.updateVisibleItems.bind(this));
  }

  startCarousel() {
    this.carouselInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  clearCarouselInterval() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  pauseCarousel() {
    this.clearCarouselInterval();
  }

  resumeCarousel() {
    this.startCarousel();
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.postingspremium.length;
    this.updateCarousel();
  }

  prevSlide() {
    this.currentIndex = (this.currentIndex - 1 + this.postingspremium.length) % this.postingspremium.length;
    this.updateCarousel();
  }

  updateVisibleItems() {
    this.visibleItems = window.innerWidth <= 768 ? 2 : 3;
    this.updateCarousel();
  }

  getTransform() {
    return `translateX(-${this.currentIndex * (100 / this.visibleItems)}%)`;
  }

  updateCarousel() {
    const carouselInner = document.querySelector('.carousel-inner') as HTMLElement;
    const itemWidth = carouselInner.clientWidth / this.visibleItems;
    carouselInner.style.transform = `translateX(-${this.currentIndex * itemWidth}px)`;
  }



  loadPostingsPremium(): void {
    this.postingService.getPostingsBySubscribedWorkers().subscribe({
      next: (data) => {
        this.postingspremium = this.getRecentPostings(data, 20);
      },
      error: (error) => {
        console.error('Error fetching premium postings:', error);
      }
    });
  }



  onFilterSubmit(): void {
    this.loadPostings(this.selectedJobType);
  }








  // Función para obtener como máximo 20 postings más recientes

  getRecentPostings(data: any[], count: number): any[] {
    const sortedData = data.sort((a, b) => {
      return new Date(b.created_date).getTime() - new Date(a.created_date).getTime();
    });
    return sortedData.slice(0, Math.min(count, 20));
  }

  
  loadPostings(jobType?: string): void {
    this.postingService.getAllPostings().subscribe({
      next: (data) => { 
        data.sort((a, b) => {
          return new Date(b.created_date).getTime() - new Date(a.created_date).getTime();
        });

        if (jobType) {
          // Asegúrate de que 'job_type' es el nombre correcto del campo en los datos recibidos
          this.postings = data.filter(posting => posting.job_type === jobType);
        } else {
          this.postings = data;
        }
      },
      error: (error) => {
        console.error('Error fetching postings:', error);
      }
    });
  }

  toggleAccordion(accordionId: string): void {
    if (this.activeAccordion === accordionId) {
      this.activeAccordion = null;
    } else {
      this.activeAccordion = accordionId;
    }
  }

  goToDetail(id: string): void {
    this.router.navigate(['/detalle', id]);
  }
}

