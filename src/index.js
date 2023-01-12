import { getWidth } from "./utils";
import debounce from "./utils/debounced";

export const invertValue = (value) => {
    if (value < 0) return Math.abs(value);
    return -value;
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
    constructor({ container, touchContainer, options }) {
        // duplicateChildren(container);
        this.options = {
            fps: Math.ceil(1000 / 60),
            scrollVelocityRatio: 1,
            debounceWaitTime: 500,
            ...options,
        };
        this.container = container;
        this.touchContainer = touchContainer;
        this.totalWidth = (getWidth(container) / 2);
        this.playing = false;
        this.offset = 0;
        this.touchStartPosition = 0;
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
        this.connectObserver();
    }

    trackDragAndTouchEvents() {
        this.listenTouchEvents();
        this.listenDragEvents();
    }

    play() {
        this.playing = true;
        this.autoPlayDraw();
    }

    stop() {
        this.playing = false;
    }

    connectObserver() {
        if (window.ResizeObserver) {
            const onResize = debounce(this.update.bind(this), this.options.debounceWaitTime);
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
        this.totalWidth = (getWidth(this.container) / 2);
    }

    onTouchStart(e) {
        this.stop()
        this.touchInProgress = true;
        e.preventDefault();
        e.stopPropagation();
        const touch = e.touches[0];
        this.touchStartPosition = touch.clientX;
    }

    onTouchMove(e) {
        e.preventDefault();
        e.stopPropagation();
        var t,
            r = null === (t = e.touches) || void 0 === t ? void 0 : t[0].clientX;
        const nextPosition = this.offset + invertValue(this.touchStartPosition - r);
        this.touchStartPosition = r;
        this.setPosition(nextPosition)
        this.movePlayDraw();
    }

    onTouchEnd(e) {
        e.preventDefault();
        e.stopPropagation();
        this.touchInProgress = false;
        this.play();
    }

    onDragStart(e) {
        this.stop();
        e.preventDefault();
        e.stopPropagation();
        this.dragInProgress = true;
        this.dragStartPosition = e.pageX;
    }

    onDragMove(e) {
        e.preventDefault();
        e.stopPropagation();
        if (this.dragInProgress) {
            const diffX = e.pageX - this.dragStartPosition;
            const nextPosition = this.offset + diffX;
            this.dragStartPosition = e.pageX;
            this.setPosition(nextPosition)
            this.movePlayDraw();
        }
    }

    onDragEnd(e) {
        e.preventDefault();
        e.stopPropagation();
        this.dragInProgress = false;
        this.play();
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

    setPosition(nextPosition) {
        if (this.isMinOffset(nextPosition)) {
            return (this.offset = nextPosition - this.totalWidth);
        } else if (this.isMaxOffset(nextPosition)) {
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

    scroll(offset) {
        const nextPosition = this.offset + offset * this.options.scrollVelocityRatio;
        this.setPosition(nextPosition);
    }

    calcNextPosition() {
        const nextPosition = this.offset - this.offsetPerTick;
        this.setPosition(nextPosition);
    }

    autoPlayDraw() {
        if (this.playing) {
            this.timer = setTimeout(() => {
                this.tickID = requestAnimationFrame(this.autoPlayDraw.bind(this));
                this.container.style = `transform: translate3d(${this.offset}px, 0px, 0px);`;
                this.calcNextPosition();
            }, this.options.fps);
        }
    }

    movePlayDraw() {
        if (this.dragInProgress || this.touchInProgress) {
            this.timer = setTimeout(() => {
                this.tickID = requestAnimationFrame(this.movePlayDraw.bind(this));
                this.container.style = `transform: translate3d(${this.offset}px, 0px, 0px);`;
            }, this.options.fps);
        }
    }

    destroy() {
        this.removeTouchEventsListener();
        this.removeDragEventsListener();
        this.playing = false;
        this.disconnectObserver();
        // removeDuplicateChildren(this.container);
        if (this.timer) {
            cancelAnimationFrame(this.tickID);
            clearTimeout(this.timer);
        }
    }
}

export default MediaCarousel;
