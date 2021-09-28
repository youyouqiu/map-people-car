export const switchSkin = (className: string) => {
  window.document.getElementsByTagName('body')[0].className = className;
};