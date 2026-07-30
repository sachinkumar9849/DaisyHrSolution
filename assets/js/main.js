/**
 * ==========================================================================
 * DAISY H.R. SOLUTION PVT. LTD. — Main JavaScript
 * --------------------------------------------------------------------------
 * Every behaviour lives in its own small module with an `init()` method, so
 * a module can be removed or reused on another page without side effects.
 * Modules exit early when their target markup is absent, which means this
 * single file can safely be loaded on every page of the site.
 *
 * Dependencies: jQuery 3.x, Bootstrap 4 bundle, Slick Carousel 1.8, AOS 2.3
 *
 * CONTENTS
 *   01. Config
 *   02. Preloader
 *   03. Sticky navigation
 *   04. Mobile navigation
 *   05. Hero slider
 *   06. Content sliders (jobs, testimonials, partners)
 *   07. Animated counters
 *   08. Back to top
 *   09. Smooth scrolling
 *   10. Form validation
 *   11. Newsletter
 *   12. Lazy images
 *   13. Misc (current year, external links)
 *   14. Boot
 * ==========================================================================
 */

(function ($) {
    'use strict';

    /* ======================================================================
       01. CONFIG
       Shared values referenced by more than one module.
       ====================================================================== */

    const CONFIG = {
        stickyOffset: 120,      // px scrolled before the header becomes sticky
        backToTopOffset: 500,   // px scrolled before the back-to-top button shows
        counterDuration: 2000,  // ms for a counter to run from 0 to its target
        scrollDuration: 700     // ms for smooth in-page scrolling
    };

    const SELECTORS = {
        header: '.js-header',
        heroSlider: '.js-hero-slider',
        jobsSlider: '.js-jobs-slider',
        testimonialSlider: '.js-testimonial-slider',
        partnerSlider: '.js-partner-slider',
        counter: '.js-counter',
        backToTop: '.js-back-to-top',
        validatedForm: '.js-validate',
        newsletterForm: '.js-newsletter'
    };

    // Arrow markup reused by every Slick instance
    const ARROWS = {
        prev: '<button type="button" class="slick-arrow-daisy slick-prev-daisy" aria-label="Previous slide"><i class="fa-solid fa-angle-left" aria-hidden="true"></i></button>',
        next: '<button type="button" class="slick-arrow-daisy slick-next-daisy" aria-label="Next slide"><i class="fa-solid fa-angle-right" aria-hidden="true"></i></button>'
    };


    /* ======================================================================
       02. PRELOADER
       Hidden on window load; a timeout guarantees it never traps the user
       if a third-party asset stalls.
       ====================================================================== */

    const Preloader = {
        init() {
            const $loader = $('.js-preloader');
            if (!$loader.length) return;

            const hide = () => $loader.addClass('is-hidden');

            $(window).on('load', hide);
            setTimeout(hide, 4000); // failsafe
        }
    };


    /* ======================================================================
       03. STICKY NAVIGATION
       Adds `.is-stuck` past the scroll threshold. Headers that sit in the
       document flow (inner pages) get a spacer so the page does not jump
       when the header switches to `position: fixed`.
       ====================================================================== */

    const StickyNav = {
        init() {
            this.$header = $(SELECTORS.header);
            if (!this.$header.length) return;

            this.isInFlow = this.$header.hasClass('site-header--solid');
            this.$spacer = null;

            if (this.isInFlow) {
                this.$spacer = $('<div class="header-spacer" aria-hidden="true"></div>')
                    .css('display', 'none')
                    .insertAfter(this.$header);
            }

            this.onScroll();
            $(window).on('scroll', this.onScroll.bind(this));
            $(window).on('resize', this.onScroll.bind(this));
        },

        onScroll() {
            const stuck = $(window).scrollTop() > CONFIG.stickyOffset;

            this.$header.toggleClass('is-stuck', stuck);

            if (this.$spacer) {
                this.$spacer
                    .height(stuck ? this.$header.outerHeight() : 0)
                    .css('display', stuck ? 'block' : 'none');
            }
        }
    };


    /* ======================================================================
       04. MOBILE NAVIGATION
       Bootstrap 4 opens dropdowns on click by default. On desktop the CSS
       already reveals them on hover, so here we only make sure a parent
       link's dropdown can be toggled on touch devices, and we close the
       collapsed menu after a real navigation tap.
       ====================================================================== */

    const MobileNav = {
        init() {
            const $navbar = $('.js-navbar');
            if (!$navbar.length) return;

            // Close the collapsed menu when a non-dropdown link is tapped
            $navbar.on('click', '.navbar-nav .nav-link:not(.dropdown-toggle), .dropdown-item', function () {
                if (window.innerWidth < 992) {
                    $navbar.find('.navbar-collapse').collapse('hide');
                }
            });

            // Close the menu when tapping outside of it
            $(document).on('click', function (event) {
                const $collapse = $navbar.find('.navbar-collapse');
                if (!$collapse.hasClass('show')) return;
                if ($(event.target).closest('.js-navbar').length) return;
                $collapse.collapse('hide');
            });
        }
    };


    /* ======================================================================
       05. HERO SLIDER
       Full-screen fade slider. `slick-current` drives the CSS text
       animations and the slow background zoom.
       ====================================================================== */

    const HeroSlider = {
        init() {
            const $slider = $(SELECTORS.heroSlider);
            if (!$slider.length) return;

            $slider.slick({
                slidesToShow: 1,
                slidesToScroll: 1,
                fade: true,
                speed: 1100,
                autoplay: true,
                autoplaySpeed: 6500,
                pauseOnHover: false,
                pauseOnFocus: true,
                infinite: true,
                arrows: true,
                dots: true,
                appendArrows: $('.js-hero-arrows'),
                prevArrow: ARROWS.prev,
                nextArrow: ARROWS.next,
                cssEase: 'cubic-bezier(.25,.8,.35,1)',
                waitForAnimate: false,
                accessibility: true
            });

            // Re-trigger the entrance animation on every slide change by
            // briefly detaching the animation class.
            $slider.on('beforeChange', function (event, slick, current, next) {
                const $target = $(slick.$slides.get(next)).find('.hero__anim');
                $target.css('animation', 'none');
                // Force a reflow so the animation can restart cleanly
                void $target[0]?.offsetWidth;
                $target.css('animation', '');
            });
        }
    };


    /* ======================================================================
       06. CONTENT SLIDERS
       Jobs, testimonials and partner logos. Each carousel keeps its arrows
       in a dedicated container so they can be placed inside a section head.
       ====================================================================== */

    const ContentSliders = {
        init() {
            this.jobs();
            this.testimonials();
            this.partners();
        },

        jobs() {
            const $slider = $(SELECTORS.jobsSlider);
            if (!$slider.length) return;

            $slider.slick({
                slidesToShow: 3,
                slidesToScroll: 1,
                infinite: true,
                autoplay: true,
                autoplaySpeed: 5000,
                speed: 700,
                arrows: true,
                dots: false,
                appendArrows: $('.js-jobs-arrows'),
                prevArrow: ARROWS.prev,
                nextArrow: ARROWS.next,
                responsive: [
                    { breakpoint: 1200, settings: { slidesToShow: 3 } },
                    { breakpoint: 992,  settings: { slidesToShow: 2 } },
                    { breakpoint: 768,  settings: { slidesToShow: 1, dots: true } }
                ]
            });
        },

        testimonials() {
            const $slider = $(SELECTORS.testimonialSlider);
            if (!$slider.length) return;

            $slider.slick({
                slidesToShow: 3,
                slidesToScroll: 1,
                infinite: true,
                autoplay: true,
                autoplaySpeed: 6000,
                speed: 800,
                arrows: false,
                dots: true,
                responsive: [
                    { breakpoint: 1200, settings: { slidesToShow: 3 } },
                    { breakpoint: 992,  settings: { slidesToShow: 2 } },
                    { breakpoint: 768,  settings: { slidesToShow: 1 } }
                ]
            });
        },

        partners() {
            const $slider = $(SELECTORS.partnerSlider);
            if (!$slider.length) return;

            $slider.slick({
                slidesToShow: 5,
                slidesToScroll: 1,
                infinite: true,
                autoplay: true,
                autoplaySpeed: 2600,
                speed: 900,
                arrows: false,
                dots: false,
                pauseOnHover: true,
                responsive: [
                    { breakpoint: 1200, settings: { slidesToShow: 4 } },
                    { breakpoint: 992,  settings: { slidesToShow: 3 } },
                    { breakpoint: 768,  settings: { slidesToShow: 2 } },
                    { breakpoint: 480,  settings: { slidesToShow: 1 } }
                ]
            });
        }
    };


    /* ======================================================================
       07. ANIMATED COUNTERS
       Counts up once, when the element first enters the viewport.
       Uses requestAnimationFrame with an ease-out curve.
       ====================================================================== */

    const Counters = {
        init() {
            const nodes = document.querySelectorAll(SELECTORS.counter);
            if (!nodes.length) return;

            // Graceful fallback where IntersectionObserver is unavailable
            if (!('IntersectionObserver' in window)) {
                nodes.forEach((node) => this.run(node));
                return;
            }

            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    this.run(entry.target);
                    obs.unobserve(entry.target);
                });
            }, { threshold: 0.4 });

            nodes.forEach((node) => observer.observe(node));
        },

        run(node) {
            const target = parseFloat(node.dataset.target || '0');
            const decimals = parseInt(node.dataset.decimals || '0', 10);
            const start = performance.now();

            const step = (now) => {
                const progress = Math.min((now - start) / CONFIG.counterDuration, 1);
                const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
                const value = target * eased;

                node.textContent = value.toLocaleString('en-US', {
                    minimumFractionDigits: decimals,
                    maximumFractionDigits: decimals
                });

                if (progress < 1) requestAnimationFrame(step);
            };

            requestAnimationFrame(step);
        }
    };


    /* ======================================================================
       08. BACK TO TOP
       ====================================================================== */

    const BackToTop = {
        init() {
            this.$btn = $(SELECTORS.backToTop);
            if (!this.$btn.length) return;

            $(window).on('scroll', this.toggle.bind(this));

            this.$btn.on('click', (event) => {
                event.preventDefault();
                $('html, body').animate({ scrollTop: 0 }, CONFIG.scrollDuration);
            });

            this.toggle();
        },

        toggle() {
            this.$btn.toggleClass('is-visible', $(window).scrollTop() > CONFIG.backToTopOffset);
        }
    };


    /* ======================================================================
       09. SMOOTH SCROLLING
       Handles in-page anchors only; the sticky header height is subtracted
       so the target heading is never hidden behind the navbar.
       ====================================================================== */

    const SmoothScroll = {
        init() {
            $(document).on('click', 'a[href^="#"]:not([href="#"]):not([data-toggle])', function (event) {
                const hash = $(this).attr('href');
                const $target = $(hash);
                if (!$target.length) return;

                event.preventDefault();

                const headerHeight = $(SELECTORS.header).outerHeight() || 0;
                const top = $target.offset().top - headerHeight - 16;

                $('html, body').animate({ scrollTop: top }, CONFIG.scrollDuration, function () {
                    // Keep the URL and keyboard focus in sync with the jump
                    if (history.replaceState) history.replaceState(null, '', hash);
                    $target.attr('tabindex', '-1').trigger('focus');
                });
            });
        }
    };


    /* ======================================================================
       10. FORM VALIDATION
       Client-side checks only — always re-validate on the server once these
       forms are wired to Laravel controllers.
       ====================================================================== */

    const FormValidation = {
        // Nepal mobile numbers plus common international formats
        patterns: {
            email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
            phone: /^[+]?[\d\s().-]{7,20}$/
        },

        init() {
            const $forms = $(SELECTORS.validatedForm);
            if (!$forms.length) return;

            $forms.each((_, form) => this.bind($(form)));
        },

        bind($form) {
            const self = this;

            // Clear the error state as soon as the user corrects a field
            $form.on('input change', '.form-control-daisy', function () {
                $(this).removeClass('is-invalid-daisy');
            });

            $form.on('submit', function (event) {
                event.preventDefault();

                const $fields = $form.find('.form-control-daisy');
                let firstInvalid = null;

                $fields.each(function () {
                    const $field = $(this);
                    if (!self.isValid($field)) {
                        $field.addClass('is-invalid-daisy');
                        if (!firstInvalid) firstInvalid = $field;
                    }
                });

                if (firstInvalid) {
                    firstInvalid.trigger('focus');
                    return;
                }

                self.onSuccess($form);
            });
        },

        isValid($field) {
            const value = ($field.val() || '').toString().trim();
            const type = $field.data('validate');
            const required = $field.prop('required');

            if (required && !value) return false;
            if (!value) return true; // optional and empty is fine

            if (type === 'email') return this.patterns.email.test(value);
            if (type === 'phone') return this.patterns.phone.test(value);
            if (type === 'name') return value.length >= 2;
            if (type === 'message') return value.length >= 10;

            return true;
        },

        /**
         * Front-end placeholder for the submit step.
         * In Laravel, remove this and let the form POST to a route with
         * @csrf, then render the confirmation from the session flash bag.
         */
        onSuccess($form) {
            const $btn = $form.find('button[type="submit"]');
            const original = $btn.html();

            $btn.prop('disabled', true)
                .html('<i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i> Sending…');

            setTimeout(() => {
                $form.find('.form-feedback').addClass('is-visible');
                $form.find('.form-control-daisy').val('');
                $btn.prop('disabled', false).html(original);
            }, 900);
        }
    };


    /* ======================================================================
       11. NEWSLETTER
       ====================================================================== */

    const Newsletter = {
        init() {
            const $form = $(SELECTORS.newsletterForm);
            if (!$form.length) return;

            $form.on('submit', function (event) {
                event.preventDefault();

                const $input = $(this).find('input[type="email"]');
                const value = ($input.val() || '').trim();

                if (!FormValidation.patterns.email.test(value)) {
                    $input.css('border-color', 'var(--danger)').trigger('focus');
                    return;
                }

                $input.css('border-color', 'var(--success)')
                      .val('')
                      .attr('placeholder', 'Thank you — you are subscribed.');

                setTimeout(() => {
                    $input.css('border-color', '')
                          .attr('placeholder', 'Your email address');
                }, 4000);
            });
        }
    };


    /* ======================================================================
       12. LAZY IMAGES
       Native lazy-loading covers modern browsers (loading="lazy" in the
       markup). This adds a light fade-in once each image has decoded.
       ====================================================================== */

    const LazyImages = {
        init() {
            document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
                if (img.complete) return;
                img.style.opacity = '0';
                img.style.transition = 'opacity .5s ease';
                img.addEventListener('load', () => { img.style.opacity = '1'; }, { once: true });
                img.addEventListener('error', () => { img.style.opacity = '1'; }, { once: true });
            });
        }
    };


    /* ======================================================================
       12b. JOB FILTER
       Client-side filtering for the Jobs listing page. Cards carry
       `data-country` and `data-category`; chips carry `data-filter`.
       In Laravel this is best replaced by a server-side query string.
       ====================================================================== */

    const JobFilter = {
        init() {
            const $bar = $('.js-filter-bar');
            if (!$bar.length) return;

            const $items = $('.js-job-item');
            const $empty = $('.js-filter-empty');

            $bar.on('click', '.filter-chip', function () {
                const $chip = $(this);
                const filter = $chip.data('filter');

                $bar.find('.filter-chip').removeClass('is-active');
                $chip.addClass('is-active');

                let visible = 0;

                $items.each(function () {
                    const $item = $(this);
                    const match = filter === 'all' ||
                        $item.data('country') === filter ||
                        $item.data('category') === filter;

                    $item.toggleClass('is-hidden', !match);
                    if (match) visible++;
                });

                $empty.toggleClass('is-visible', visible === 0);

                if (window.AOS) AOS.refresh();
            });
        }
    };


    /* ======================================================================
       13. MISC
       ====================================================================== */

    const Misc = {
        init() {
            // Footer copyright year
            const year = new Date().getFullYear();
            document.querySelectorAll('.js-year').forEach((el) => { el.textContent = year; });

            // Harden any external links against reverse-tabnabbing
            document.querySelectorAll('a[target="_blank"]').forEach((link) => {
                const rel = link.getAttribute('rel') || '';
                if (!rel.includes('noopener')) {
                    link.setAttribute('rel', (rel + ' noopener noreferrer').trim());
                }
            });
        }
    };


    /* ======================================================================
       14. BOOT
       ====================================================================== */

    $(function () {
        Preloader.init();
        StickyNav.init();
        MobileNav.init();
        HeroSlider.init();
        ContentSliders.init();
        Counters.init();
        BackToTop.init();
        SmoothScroll.init();
        FormValidation.init();
        Newsletter.init();
        LazyImages.init();
        JobFilter.init();
        Misc.init();

        // Scroll animations. `once: true` keeps long pages calm on scroll-up.
        if (window.AOS) {
            AOS.init({
                duration: 850,
                easing: 'ease-out-cubic',
                once: true,
                offset: 90,
                disable: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
            });
        }

        // Slick changes element heights after init; recalculate AOS positions
        $(window).on('load', () => {
            if (window.AOS) AOS.refresh();
        });
    });

})(jQuery);
