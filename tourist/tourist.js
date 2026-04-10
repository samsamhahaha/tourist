const { useEffect, useRef, useState } = React;
const h = React.createElement;

const SHIFT_DURATION = 860;
const VIEW_TRANSITION_DURATION = 920;
const WHEEL_THRESHOLD = 40;
const SWIPE_THRESHOLD = 48;

const DESTINATIONS = [
  {
    id: "pinto",
    name: "Pinto Art Museum",
    image: "images/pinto1.jpg",
    info: "Pinto Art Museum is one of Antipolo's best-known stops for travelers who want art, architecture, and a relaxed hillside setting in one visit. Its galleries, gardens, and bright courtyards make it easy to spend a half day walking, taking photos, and slowing down away from the city.",
  },
  {
    id: "taktak",
    name: "Hinulugang Taktak",
    image: "images/taktak.jpg",
    info: "Hinulugang Taktak is the classic Antipolo nature stop and remains one of the city's most recognizable landmarks. It works well for a light sightseeing break, especially if you want a quick waterfall view and a place with strong local familiarity.",
  },
  {
    id: "cathedral",
    name: "Antipolo Cathedral",
    image: "images/cathedral1.jpg",
    info: "Antipolo Cathedral, also known as the National Shrine of Our Lady of Peace and Good Voyage, is one of the city's most important pilgrimage destinations. Many visitors stop here for prayer, heritage value, and a central starting point before exploring the rest of Antipolo.",
  },
  {
    id: "cloud9",
    name: "Cloud 9",
    image: "images/c9.jpg",
    info: "Cloud 9 is one of the easiest places in Antipolo to catch elevated city views, especially near sunset when the skyline begins to glow. It suits casual dates, barkada stops, and short scenic visits where the main draw is the overlook itself.",
  },
  {
    id: "luljetta",
    name: "Luljetta's Hanging Gardens",
    image: "images/garden.jpg",
    info: "Luljetta's Hanging Gardens Spa offers one of Antipolo's more relaxing hillside experiences, combining spa facilities with broad views over the surrounding landscape. It is a strong pick if you want your Antipolo trip to feel restorative rather than packed with many stops.",
  },
];

const shortenDescription = (text) => {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return "";

  const sentences = normalized.match(/[^.!?]+[.!?]+/g);
  if (sentences && sentences.length) {
    return sentences.slice(0, 2).join(" ").trim();
  }

  if (normalized.length <= 210) return normalized;
  return `${normalized.slice(0, 207).trim()}...`;
};

function App() {
  const [currentView, setCurrentView] = useState("hero");
  const [slides, setSlides] = useState(DESTINATIONS);
  const [isShifting, setIsShifting] = useState(false);
  const shiftTimerRef = useRef(null);
  const viewTimerRef = useRef(null);
  const isViewTransitioningRef = useRef(false);
  const pointerStartRef = useRef(null);

  useEffect(() => {
    return () => {
      window.clearTimeout(shiftTimerRef.current);
      window.clearTimeout(viewTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleWheel = (event) => {
      if (Math.abs(event.deltaY) < WHEEL_THRESHOLD) return;

      event.preventDefault();

      if (event.deltaY > 0 && currentView === "hero") {
        switchView("slider");
        return;
      }

      if (event.deltaY < 0 && currentView === "slider") {
        switchView("hero");
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [currentView]);

  const switchView = (view) => {
    if (view === currentView || isViewTransitioningRef.current) return;

    isViewTransitioningRef.current = true;
    setCurrentView(view);
    window.clearTimeout(viewTimerRef.current);
    viewTimerRef.current = window.setTimeout(() => {
      isViewTransitioningRef.current = false;
    }, VIEW_TRANSITION_DURATION);
  };

  const runShift = (direction) => {
    if (isShifting || slides.length < 2) return;

    setIsShifting(true);

    window.requestAnimationFrame(() => {
      React.startTransition(() => {
        setSlides((currentSlides) => {
          if (direction === "prev") {
            return [
              currentSlides[currentSlides.length - 1],
              ...currentSlides.slice(0, currentSlides.length - 1),
            ];
          }

          return [...currentSlides.slice(1), currentSlides[0]];
        });
      });
    });

    window.clearTimeout(shiftTimerRef.current);
    shiftTimerRef.current = window.setTimeout(() => {
      setIsShifting(false);
    }, SHIFT_DURATION);
  };

  const handleSliderPointerDown = (event) => {
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
  };

  const handleSliderPointerUp = (event) => {
    if (!pointerStartRef.current) return;

    const deltaX = event.clientX - pointerStartRef.current.x;
    const deltaY = event.clientY - pointerStartRef.current.y;
    pointerStartRef.current = null;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaX) < Math.abs(deltaY)) {
      return;
    }

    runShift(deltaX < 0 ? "next" : "prev");
  };

  const handleSliderPointerCancel = () => {
    pointerStartRef.current = null;
  };

  return h(
    "main",
    {
      className: currentView === "slider" ? "page-shell view-slider" : "page-shell",
    },
    [
      h(
        "section",
        { className: "hero", key: "hero" },
        [
          h(
            "div",
            { className: "hero-copy", key: "hero-copy" },
            [
              h("p", { className: "hero-kicker", key: "hero-kicker" }, "Cinematic Routes"),
              h("h1", { key: "hero-title" }, "See Antipolo like a weekend worth taking."),
              h(
                "p",
                { className: "hero-text", key: "hero-text" },
                "From hilltop views and pilgrimage landmarks to art spaces and waterfalls, explore Antipolo tourist spots that feel close, scenic, and easy to turn into a day trip."
              ),
              h(
                "button",
                {
                  className: "hero-cta",
                  type: "button",
                  onClick: () => switchView("slider"),
                  key: "hero-cta",
                },
                "Travel?"
              ),
            ]
          ),
          h(
            "div",
            { className: "hero-stack", "aria-hidden": "true", key: "hero-stack" },
            [
              h("article", { className: "hero-card hero-card-main", key: "main-card" }),
              h("article", { className: "hero-card hero-card-side hero-card-top", key: "top-card" }),
              h("article", { className: "hero-card hero-card-side hero-card-bottom", key: "bottom-card" }),
            ]
          ),
        ]
      ),
      h(
        "section",
        { className: "slider-section", id: "destinations", key: "slider" },
        [
          h(
            "div",
            { className: "section-topbar", key: "topbar" },
            [
              h(
                "button",
                {
                  className: "back-button",
                  type: "button",
                  "aria-label": "Back to hero",
                  onClick: () => switchView("hero"),
                  key: "back-button",
                },
                "Back"
              ),
              h(
                "div",
                { className: "section-heading", key: "heading" },
                [
                  h("p", { className: "section-kicker", key: "section-kicker" }, "Destination Slider"),
                  h("h2", { key: "section-title" }, "Move through Antipolo."),
                ]
              ),
            ]
          ),
          h(
            "div",
            {
              className: "container",
              onPointerDown: handleSliderPointerDown,
              onPointerUp: handleSliderPointerUp,
              onPointerCancel: handleSliderPointerCancel,
              onPointerLeave: handleSliderPointerCancel,
              key: "container",
            },
            [
              h(
                "div",
                { className: isShifting ? "slide is-shifting" : "slide", key: "slide" },
                slides.map((destination) =>
                  h(
                    "div",
                    {
                      className: "item",
                      "data-info": destination.info,
                      style: {
                        backgroundImage: `url('${destination.image}')`,
                      },
                      key: destination.id,
                    },
                    h(
                      "div",
                      { className: "content" },
                      [
                        h("div", { className: "name", key: `${destination.id}-name` }, destination.name),
                        h(
                          "div",
                          { className: "des", key: `${destination.id}-description` },
                          shortenDescription(destination.info)
                        ),
                      ]
                    )
                  )
                )
              ),
              h(
                "div",
                { className: "button", key: "controls" },
                h(
                  "button",
                  {
                    className: "next cta-next",
                    type: "button",
                    "aria-label": "Next destination",
                    onClick: () => runShift("next"),
                  },
                  "Travel?"
                )
              ),
            ]
          ),
        ]
      ),
    ]
  );
}

const rootElement = document.getElementById("app");

if (rootElement) {
  if (typeof ReactDOM.createRoot === "function") {
    ReactDOM.createRoot(rootElement).render(h(App));
  } else {
    ReactDOM.render(h(App), rootElement);
  }
}
