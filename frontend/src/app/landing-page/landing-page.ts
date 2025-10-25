import { Component, OnInit, OnDestroy, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  imports: [],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css'
})
export class LandingPage implements OnInit, OnDestroy {
  isMobileMenuOpen = false;
  isHeaderVisible = true;
  currentYear = new Date().getFullYear();
  private lastScrollY = 0;
  private scrollThreshold = 50;
  private observer: IntersectionObserver | null = null;
  isModalOpen = false;
  selectedRole: string | null = null;

  constructor(private router: Router, private elementRef: ElementRef) {}

  ngOnInit() {
    this.setupScrollLogic();
    this.setupIntersectionObserver();
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const currentScrollY = window.pageYOffset;

    if (currentScrollY > this.scrollThreshold) {
      if (currentScrollY > this.lastScrollY && this.isHeaderVisible) {
        this.isHeaderVisible = false;
      } else if (currentScrollY < this.lastScrollY && !this.isHeaderVisible) {
        this.isHeaderVisible = true;
      }
    } else if (currentScrollY <= this.scrollThreshold && !this.isHeaderVisible) {
      this.isHeaderVisible = true;
    }
    this.lastScrollY = currentScrollY;
  }

  private setupScrollLogic() {
    // Header visibility logic is handled by HostListener
  }

  private setupIntersectionObserver() {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        console.log('Intersection observed:', entry.target.className, 'isIntersecting:', entry.isIntersecting);
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        } else {
          // Optional: Uncomment to reset animation on scroll out
          // entry.target.classList.remove('is-visible');
        }
      });
    }, observerOptions);

    // Observe elements after view init
    setTimeout(() => {
      const elementsToAnimate = this.elementRef.nativeElement.querySelectorAll('.fade-in-on-scroll');
      elementsToAnimate.forEach((el: Element) => {
        this.observer?.observe(el);
      });
    });
  }

  // Candidate Portal - Login
  goToCandidateSignIn() {
    this.router.navigate(['/candidate/sign-in']);
  }

  // Candidate Portal - Demo (Direct to Dashboard)
  goToCandidateDemo() {
    this.router.navigate(['/candidate/dashboard']);
  }

  // Recruiter Portal - Login
  goToRecruiterSignIn() {
    this.router.navigate(['/recruiter/sign-in']);
  }

  // Recruiter Portal - Demo (Direct to Dashboard)
  goToRecruiterDemo() {
    this.router.navigate(['/recruiter/dashboard']);
  }

  // Admin Portal - Login (unchanged)
  goToAdminSignIn() {
    this.router.navigate(['/admin/sign-in']);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedRole = null;
  }

  selectRole(role: string) {
    this.selectedRole = role;
    this.closeModal();
    if (role === 'student') {
      this.goToCandidateSignIn();
    } else if (role === 'recruiter') {
      this.goToRecruiterSignIn();
    }
  }
}
