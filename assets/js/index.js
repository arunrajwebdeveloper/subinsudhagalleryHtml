(function () {
  // SIDE NAVIGATION

  const navMenuToggle = document.getElementById("nav-menu-toggle");
  const navMenuClose = document.getElementById("nav-menu-close");
  const mainNavigation = document.getElementById("main-navigation");
  const menuOverlay = document.getElementById("menu-overlay");

  navMenuToggle.addEventListener("click", function () {
    if (!mainNavigation.classList.contains("active")) {
      menuOverlay.classList.add("active");
      mainNavigation.classList.add("active");
    } else {
      menuOverlay.classList.remove("active");
      mainNavigation.classList.remove("active");
    }
  });

  navMenuClose.addEventListener("click", function () {
    if (mainNavigation.classList.contains("active")) {
      menuOverlay.classList.remove("active");
      mainNavigation.classList.remove("active");
    }
  });

  // Close the sidebar when clicking outside of it
  document.addEventListener("click", function (event) {
    const navMenuToggle = document.getElementById("nav-menu-toggle");
    const mainNavigation = document.getElementById("main-navigation");

    if (
      event &&
      event.target !== navMenuToggle &&
      event.target !== mainNavigation &&
      !navMenuToggle.contains(event.target) &&
      !mainNavigation.contains(event.target)
    ) {
      menuOverlay.classList.remove("active");
      mainNavigation.classList.remove("active");
    }
  });

  // HEADER SHOW / HIDE ON SCROLL

  let didScroll;
  let lastScrollTop = 0;
  const delta = 5;
  const navbar = $(".main-header");
  const navbarHeight = navbar.outerHeight();

  $(window).scroll(function (event) {
    didScroll = true;
  });

  setInterval(function () {
    if (didScroll) {
      hasScrolled();
      didScroll = false;
    }
  }, 250);

  function hasScrolled() {
    var st = $(this).scrollTop();
    if (Math.abs(lastScrollTop - st) <= delta) return;
    if (st > lastScrollTop && st > navbarHeight) {
      navbar.css("top", -navbarHeight + "px");
    } else {
      if (st + $(window).height() < $(document).height()) {
        navbar.css("top", "0px");
      }
    }

    lastScrollTop = st;
  }

  // SCROLL TO TOP

  var scrollButton = $("#scroll-to-top");

  $(window).scroll(function () {
    if ($(window).scrollTop() > 500) {
      scrollButton.addClass("show");
    } else {
      scrollButton.removeClass("show");
    }
  });

  scrollButton.on("click", function (e) {
    e.preventDefault();
    $("html, body").animate({ scrollTop: 0 }, "300");
  });
})();

// THEME TOGGLE

// const toggleButton = document.getElementById("theme-toggle");
// toggleButton.addEventListener("click", () => {
//   const element = document.body;
//   element.classList.toggle("dark-mode");

//   if (element.classList.contains("dark-mode")) {
//     localStorage.setItem("dark-mode", "enabled");
//     toggleButton.innerText = "Light mode";
//   } else {
//     localStorage.setItem("dark-mode", "disabled");
//     toggleButton.innerText = "Dark mode";
//   }
// });

// document.addEventListener("DOMContentLoaded", () => {
//   if (localStorage.getItem("dark-mode") === "enabled") {
//     document.body.classList.add("dark-mode");
//     toggleButton.innerText = "Light mode";
//   }
// });
