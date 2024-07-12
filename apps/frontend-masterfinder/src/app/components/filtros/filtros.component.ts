import { Component, OnInit, ViewChild, ElementRef, OnDestroy, HostListener } from '@angular/core';
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
  intervalId: any;
  combinedPostings: any[] = [];

  public postings: any[] = [];
  public selectedJobType: string = '';
  public selectedLocation: string = '';
  public jobTypes: string[] = ['Carpintería', 'Electricidad', 'Gasfitería'];
  public locations: string[] = ['Maipú', 'Pudahuel', 'Cerrillos']
  activeAccordion: string | null = null;
  postingspremium: any[] = [];
  errorMessage: string = 'errooor!';

  constructor(private postingService: FiltrosService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.loadPostings();
    this.loadPostingsPremium();
  }

  ngOnDestroy() {
    this.pauseCarousel();
  }

  @HostListener('window:resize')
  onResize() {
    this.resetCarousel();
  }

  getTransform() {
    const width = document.querySelector('.carousel-item')?.clientWidth || 0;
    return `translateX(-${this.currentIndex * (width + 58)}px)`; // Ajustar según el margen entre las tarjetas
  }

  prevSlide() {
    if (this.currentIndex === 0) {
      this.currentIndex = this.postingspremium.length;
    } else {
      this.currentIndex--;
    }
  }

  nextSlide() {
    if (this.currentIndex === this.postingspremium.length) {
      this.currentIndex = 0;
    } else {
      this.currentIndex++;
    }
  }

  startCarousel() {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 5000); // Desplazamiento automático cada 5 segundos
  }

  pauseCarousel() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  resumeCarousel() {
    this.startCarousel();
  }

  resetCarousel() {
    this.pauseCarousel();
    this.currentIndex = 0;
    this.resumeCarousel();
  }

  loadPostingsPremium(): void {
    this.postingService.getPostingsBySubscribedWorkers().subscribe({
      next: (data) => {
        this.postingspremium = this.getRecentPostings(data, 20);
        this.combinedPostings = [...this.postingspremium, ...this.postingspremium];
        this.startCarousel();
      },
      error: (error) => {
        console.error('Error fetching premium postings:', error);
      }
    });
  }

  onFilterSubmit(): void {
    this.loadPostings(this.selectedJobType, this.selectedLocation);
  }

  // Función para obtener como máximo 20 postings más recientes
  getRecentPostings(data: any[], count: number): any[] {
    const sortedData = data.sort((a, b) => {
      return new Date(b.created_date).getTime() - new Date(a.created_date).getTime();
    });
    return sortedData.slice(0, Math.min(count, 20));
  }

  loadPostings(jobType?: string, location?: string): void {
    this.postingService.getAllPostings().subscribe({
      next: (data) => { 
        data.sort((a, b) => {
          return new Date(b.created_date).getTime() - new Date(a.created_date).getTime();
        });

        if (jobType) {
          data = data.filter(posting => posting.job_type === jobType);
        }

        if (location) {
          data = data.filter(posting => posting.location === location);
        }

        this.postings = data;
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