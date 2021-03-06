const designActivitySwiper = new Swiper(".designActivityList", {
  slidesPerView: 1,
  spaceBetween: 30,
  centeredSlides: true,
  breakpoints: {
    992: {
      slidesPerView: 3,
    },
    768: {
      slidesPerView: 2,
    },
  },
});

const artTypeSwiper = new Swiper(".artTypeList", {
  slidesPerView: 5,
  spaceBetween: 18,
  breakpoints: {
    992: {
      slidesPerView: document.querySelectorAll(".artTypeList .swiper-slide").length,
    },

  },
});
