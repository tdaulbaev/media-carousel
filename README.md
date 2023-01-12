## Getting Started

To install

```bash
npm install @timdaulbaev/media-carousel
```

To import

```bash
import MediaCarousel from "@timdaulbaev/media-carousel";
```

To startup and destroy

```bash
  const carousel = new MediaCarousel({
    container: container,
    touchContainer: touchListener,
    options: {}
  });
  
  carousel.play();
  
  // destroy callback
  return () => {
    carousel.destroy();
  }
```