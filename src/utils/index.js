export const getHeight = (element) => (element ? element.offsetHeight : 0);

export const getWidth = (element) => (element ? element.offsetWidth : 0);

export const getSize = (element) => {
    if (element) {
        return {
            width: element.offsetWidth,
            height: element.offsetHeight,
        };
    }

    return {};
};
