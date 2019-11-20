import WebGL from './modules/WebGL';

window.onload = () => {
  const $canvas = document.getElementById('canvas');
  var webgl = new WebGL($canvas);

  window.addEventListener('resize', webgl.resize.bind(webgl));
};