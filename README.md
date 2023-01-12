## Getting Started

To install

```bash
npm install @tdaulbaev/media-carousel
```

To import

```bash
import MediaCarousel from "@tdaulbaev/media-carousel";
```

To startup and destroy

```bash
  const carousel = new MediaCarousel({
    container: container,
    touchContainer: touchListener,
    options: {}
  });
  
  carousel.trackDragAndTouchEvents();
  carousel.play();
  
  // destroy callback
  return () => {
    carousel.stop();
    carousel.destroy();
  }
```