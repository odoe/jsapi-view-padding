import ArcGISMap from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import ImageryTileLayer from '@arcgis/core/layers/ImageryTileLayer';
import Legend from '@arcgis/core/widgets/Legend';
import Expand from '@arcgis/core/widgets/Expand';

import './style.css';

const defaultPadding = 20;
const btnExpand = document.getElementById('btnExpand');
const slider = document.getElementById('slider') as HTMLElement;

const layer = new ImageryTileLayer({
  url: 'https://tiledimageservices.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/NLDAS_Hourly_8_30_2021/ImageServer',
  title: 'Winds',
  renderer: {
    type: 'flow',
    trailWidth: '2px',
    // color: [50, 120, 240, 1],
    density: 1,
    visualVariables: [
      {
        type: 'color',
        field: 'Magnitude',
        stops: [
          { color: [40, 146, 199, 1], value: 0 },
          { color: [160, 194, 155, 1], value: 5 },
          { color: [218, 230, 119, 1], value: 10 }
        ]
      } as any
    ]
  },
  effect: 'bloom(1.5, 0.5px, 0)'
});

const map = new ArcGISMap({
  basemap: 'dark-gray-vector',
  layers: [layer]
});

const view = new MapView({
  container: 'viewDiv',
  map: map,
  zoom: 4,
  center: [-98, 39],
  padding: {
    left: defaultPadding
  }
});
const legendExpand = new Expand({
  view: view,
  content: new Legend({ view: view }),
  expanded: true
});
view.ui.add(legendExpand, 'top-left');

// const controlsExpand = new Expand({
//   view: view,
//   content: document.getElementById('controls') as HTMLElement,
//   expandIconClass: 'esri-icon-sliders-horizontal'
// });
// view.ui.add(controlsExpand, 'top-right');

const sliderProps = [
  'trailWidth',
  'density',
  'maxPathLength',
  'flowSpeed',
  'trailLength'
];
sliderProps.forEach((prop) => {
  document
    .getElementById(prop)
    ?.addEventListener('calciteSliderChange', updateRenderer);
});

document
  .getElementById('flowRepresentation')
  ?.addEventListener('calciteRadioGroupChange', updateRenderer);
document
  .getElementById('effectsEnabled')
  ?.addEventListener('calciteCheckboxChange', updateEffect);

function updateEffect(event: any) {
  let checkbox = event.target.checked ? 'bloom(1.5, 0.5px, 0)' : null;
  layer.effect = checkbox as any;
}

function updateRenderer(event: any) {
  let propName = event.target.id;
  let propValue;
  if (propName == 'flowRepresentation') {
    propValue = event.detail; // value is stored in event.detail for calcite radio group
  } else {
    propValue = event.target.value;
  }

  if (propName && propValue != null) {
    let tempRenderer = layer.renderer.clone();

    tempRenderer[propName] = propValue;
    layer.renderer = tempRenderer;
  }
}

const margin = -280;

const identity = ((a: any) => a);
const duration = 500;
function animate(options = {
  easing: identity,
  onProgress: identity,
  onComplete: identity,
  from: {},
  to: {}
}) {
  const {
    easing,
    onProgress,
    onComplete,
    from,
    to
  } = options;

  const startTime = Date.now();

  function update() {
    let deltaTime = Date.now() - startTime;
    let progress = Math.min(deltaTime / duration, 1);
    let factor = easing(progress);
    let values = {};
    
    for (let k in from) {
      if (k) {
        values[k] = from[k] + (to[k] - from[k]) * factor;
      }
    }

    onProgress(values);

    if (progress === 1) {
      onComplete(deltaTime);
    }
    else {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

function inSine(t: number) {
  return -Math.cos(t * Math.PI / 2) + 1;
}

function updatePadding(value: number) {
  return {
    left: value - margin + defaultPadding
  }
}

function expand() {
  animate({
  easing: inSine,
  onProgress({ a }: { a: number; }) {
    slider.style.marginLeft = `${a}px`;
    view.padding = updatePadding(a);
  },
  onComplete() {
    btnExpand?.removeEventListener('click', expand);
    btnExpand?.addEventListener('click', collapse);
  },
  from: {
    a: margin
  },
  to: {
    a: 0
  }
});
}

function collapse() {
  animate({
    easing: inSine,
    onProgress({a}: { a: number }) {
      slider.style.marginLeft = `${a}px`;
      view.padding = updatePadding(a);
    },
    onComplete() {
      btnExpand?.removeEventListener('click', collapse);
      btnExpand?.addEventListener('click', expand);
    },
    from: {
      a: 0
    },
    to: {
      a: margin
    }
  })
}

btnExpand?.addEventListener('click', expand);

// let toggle = true;

// btnExpand?.addEventListener('click', () => {
//   if (toggle) {
//     view.padding = {
//       left: 300
//     };
//     slider.style.marginLeft = `${0}px`;
//   }
//   else {
//     view.padding = {
//       left: defaultPadding
//     };
//     slider.style.marginLeft = `${-280}px`;
//   }

//   toggle = !toggle;
// });
