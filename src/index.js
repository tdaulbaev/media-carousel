import { getWidth } from "./utils";
import debounce from "./utils/debounced";

const interpretEvent = (e) => {
    e.preventDefault();
    e.stopPropagation();
};

const getMaxOffsetValue = (x, y, max) => {
    const posX = Math.abs(x);
    const poxY = Math.abs(y);
    if (posX >= max || poxY >= max) {
        return posX >= poxY ? (max * x) / max : (max * y) / max;
    }
    return posX >= poxY ? x : y;
};

// const duplicateChildren = (container) => {
//   Array.from(container.children).forEach((child) => {
//     const copyChild = child.cloneNode(true);
//     addClassName(copyChild, "duplicate");
//     container.appendChild(copyChild);
//   });
// };
//
// const removeDuplicateChildren = (container) => {
//   const duplicateChildren = container.querySelectorAll(".duplicate");
//   Array.from(duplicateChildren).forEach((child) => {
//     child.remove();
//   });
// };

class MediaCarousel {
    constructor({ container, touchContainer, options = {} }) {
        // duplicateChildren(container);
        const { fps = 60, ...otherOptions } = options;
        this.options = {
            fps: Math.ceil(1000 / fps),
            scrollVelocityRatio: 1,
            maxScrollMovement: 250,
            debounceWaitTime: 500,
            ...otherOptions,
        };
        this.container = container;
        this.touchContainer = touchContainer;
        this.totalWidth = getWidth(container) / 2;
        this.animating = false;
        this.autoPlay = false;
        this.offset = 0;
        this.touchStartPosition = [0, 0];
        this.dragStartPosition = 0;
        this.dragInProgress = false;
        this.touchInProgress = false;
        this.offsetPerTick = 0.5;
        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);
        this.onDragStart = this.onDragStart.bind(this);
        this.onDragMove = this.onDragMove.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.onWheel = this.onWheel.bind(this);
        this.connectObserver();
    }

    trackDragAndTouchEvents() {
        this.listenTouchEvents();
        this.listenDragEvents();
        this.listenWheelEvent();
    }

    play() {
        this.animating = true;
        this.autoPlay = true;
        this.draw();
    }

    stop() {
        this.animating = false;
        this.autoPlay = false;
    }

    restoreAutoPlay = debounce(this.autoPlayStart.bind(this), 300);

    autoPlayStart() {
        this.autoPlay = true;
    }

    autoPlayStop() {
        this.autoPlay = false;
    }

    connectObserver() {
        if (window.ResizeObserver) {
            const onResize = debounce(
                this.update.bind(this),
                this.options.debounceWaitTime
            );
            this.resizeObserver = new ResizeObserver(onResize);
            this.resizeObserver.observe(this.container);
        }
    }

    disconnectObserver() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }

    update() {
        this.totalWidth = getWidth(this.container) / 2;
    }

    onTouchStart(e) {
        interpretEvent(e);
        this.autoPlayStop();
        this.touchInProgress = true;
        const t = e.touches[0];
        this.touchStartPosition = [t.pageX, t.pageY];
    }

    onTouchMove(e) {
        interpretEvent(e);
        if (this.touchInProgress) {
            const t = e.touches[0];
            const diffX = t.pageX - this.touchStartPosition[0];
            const diffY = t.pageY - this.touchStartPosition[1];
            this.touchStartPosition = [t.pageX, t.pageY];
            const nextPosition = this.offset + diffX + diffY;
            this.setPosition(nextPosition);
        }
    }

    onTouchEnd(e) {
        interpretEvent(e);
        if (this.touchInProgress) {
            this.touchInProgress = false;
            this.autoPlayStart();
        }
    }

    onDragStart(e) {
        interpretEvent(e);
        this.autoPlayStop();
        this.dragInProgress = true;
        this.dragStartPosition = e.pageX;
    }

    onDragMove(e) {
        interpretEvent(e);
        if (this.dragInProgress) {
            const diffX = e.pageX - this.dragStartPosition;
            const nextPosition = this.offset + diffX;
            this.dragStartPosition = e.pageX;
            this.setPosition(nextPosition);
        }
    }

    onDragEnd(e) {
        interpretEvent(e);
        if (this.dragInProgress) {
            this.dragInProgress = false;
            this.autoPlayStart();
        }
    }

    onWheel(e) {
        interpretEvent(e);
        this.autoPlayStop();
        const { deltaX, deltaY } = e;
        const offset =
            getMaxOffsetValue(deltaX, deltaY, this.options.maxScrollMovement) *
            this.options.scrollVelocityRatio;
        const nextPosition = this.offset - offset;
        this.setPosition(nextPosition);
        this.restoreAutoPlay();
    }

    listenTouchEvents() {
        this.touchContainer.addEventListener("touchstart", this.onTouchStart);
        this.touchContainer.addEventListener("touchmove", this.onTouchMove);
        this.touchContainer.addEventListener("touchend", this.onTouchEnd);
    }

    removeTouchEventsListener() {
        this.touchContainer.removeEventListener("touchstart", this.onTouchStart);
        this.touchContainer.removeEventListener("touchmove", this.onTouchMove);
        this.touchContainer.removeEventListener("touchend", this.onTouchEnd);
    }

    listenDragEvents() {
        this.touchContainer.addEventListener("mousedown", this.onDragStart);
        this.touchContainer.addEventListener("mousemove", this.onDragMove);
        this.touchContainer.addEventListener("mouseup", this.onDragEnd);
        this.touchContainer.addEventListener("mouseleave", this.onDragEnd);
    }

    removeDragEventsListener() {
        this.touchContainer.removeEventListener("mousedown", this.onDragStart);
        this.touchContainer.removeEventListener("mousemove", this.onDragMove);
        this.touchContainer.removeEventListener("mouseup", this.onDragEnd);
        this.touchContainer.removeEventListener("mouseleave", this.onDragEnd);
    }

    listenWheelEvent() {
        this.touchContainer.addEventListener("wheel", this.onWheel);
    }

    removeWheelEventListener() {
        this.touchContainer.removeEventListener("wheel", this.onWheel);
    }

    setPosition(nextPosition) {
        if (this.isMinOffset(nextPosition)) {
            return (this.offset = nextPosition - this.totalWidth);
        }
        if (this.isMaxOffset(nextPosition)) {
            return (this.offset = -(this.totalWidth + nextPosition));
        }
        return (this.offset = nextPosition);
    }

    isMinOffset(nextPosition) {
        return nextPosition >= 0;
    }

    isMaxOffset(nextPosition) {
        return Math.abs(nextPosition) >= this.totalWidth;
    }

    calcNextPosition() {
        const nextPosition = this.offset - this.offsetPerTick;
        this.setPosition(nextPosition);
    }

    draw() {
        if (this.animating) {
            this.timer = setTimeout(() => {
                this.tickID = requestAnimationFrame(this.draw.bind(this));
                this.container.style = `transform: translate3d(${this.offset}px, 0px, 0px);`;
                if (this.autoPlay) this.calcNextPosition();
            }, this.options.fps);
        }
    }

    destroy() {
        this.removeTouchEventsListener();
        this.removeDragEventsListener();
        this.removeWheelEventListener();
        this.stop();
        this.disconnectObserver();
        // removeDuplicateChildren(this.container);
        if (this.timer) {
            cancelAnimationFrame(this.tickID);
            clearTimeout(this.timer);
        }
    }
}

export default MediaCarousel;
