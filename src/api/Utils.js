
export const localhost = window.location.hostname.indexOf('localhost') !== -1;

export const getFileNameFromUrl = (url) => {
    return url.match(/\/([^\/]+)\/?$/)[1];
}