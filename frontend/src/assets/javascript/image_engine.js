import sha1 from "sha1"
import {createCanvas} from "canvas"
import loadImage from "p5"


const description = "Dope Dinos";
const baseUri = "https://gateway.pinata.cloud/ipfs/QmSE5bs1HUQ7pfKzxNmYbgfv9Wg7TXtfXzX76XoxaT9ujp";

const layerConfigurations = [
  {
    growEditionSizeTo: 1,
    layersOrder: [
      { name: "body" },
    ],
  },
  {
    growEditionSizeTo: 2,
    layersOrder: [
      { name: "special" },
    ],
  },
];

const shuffleLayerConfigurations = false;

const format = {
  width: 256,
  height: 256,
};


const extraMetadata = {};

const uniqueDnaTorrance = 10000;

const preview = {
  thumbPerRow: 5,
  thumbWidth: 50,
  imageRatio: format.width / format.height,
  imageName: "preview.png",
};


var metadataList = [];
var attributesList = [];
var dnaList = [];

const cleanDna = (_str) => {
  var dna = Number(_str.split(":").shift());
  return dna;
};


// const getElements = (path) => {
//   return ELEMENTS
//     .map((i, index) => {
//       return {
//         id: index,
//         name: i.name,
//         filename: i,
//         path: `${path}${i}`,
//         weight: i.rarity,
//       };
//     });
// };


const layersSetup = (layersOrder) => {
  const layers = layersOrder.map((layerObj, index) => ({
    id: index,
    name: layerObj.name,
    elements: [
      {
        id: 0,
        name: "eye",
        filename: "https://i.imgur.com/cntzd0H.png",
        path: `eye`,
        weight: 5,
      },
      {
        id: 1,
        name: "eye1",
        filename: "https://i.imgur.com/t64zPCU.png",
        path: `eye1`,
        weight: 5,
      },
      { id: 2,
        name: "hello",
        filename: "https://i.imgur.com/Pz1eu5C.png",
        path: "afdasd",
        weight: 6,
      }
    ],
    blendMode: "source-over",
    opacity: 1,
  }));
  return layers;
};

const addMetadata = (_dna, _edition) => {
  let dateTime = Date.now();
  let tempMetadata = {
    dna: sha1(_dna.join("")),
    name: `#${_edition}`,
    description: description,
    image: `${baseUri}/${_edition}.png`,
    edition: _edition,
    date: dateTime,
    ...extraMetadata,
    attributes: attributesList,
    compiler: "nft-maker",
  };
  metadataList.push(tempMetadata);
  attributesList = [];
};

const addAttributes = (_element) => {
  let selectedElement = _element.layer.selectedElement;
  attributesList.push({
    trait_type: _element.layer.name,
    value: selectedElement.name,
  });
};

const loadLayerImg = (_layer) => {
  const img = new Image(100, 200); // width, height
  img.src = _layer.selectedElement.filename;
  return { layer: _layer, loadedImage: img }
}

const drawElement = (_renderObject, ctx) => {
  ctx.globalAlpha = _renderObject.layer.opacity;
  ctx.globalCompositeOperation = _renderObject.layer.blendMode;
  _renderObject.loadedImage.onload = function () {
      ctx.drawImage(_renderObject.loadedImage, 0, 0, format.width, format.height);
  }
  addAttributes(_renderObject);
};

const constructLayerToDna = (_dna = [], _layers = []) => {
  let mappedDnaToLayers = _layers.map((layer, index) => {
    let selectedElement = layer.elements.find(
      (e) => e.id == cleanDna(_dna[index])
    );
    return {
      name: layer.name,
      blendMode: layer.blendMode,
      opacity: layer.opacity,
      selectedElement: selectedElement,
    };
  });
  return mappedDnaToLayers;
};

const isDnaUnique = (_DnaList = [], _dna = []) => {
  let foundDna = _DnaList.find((i) => i.join("") === _dna.join(""));
  return foundDna == undefined ? true : false;
};

const createDna = (_layers) => {
  let randNum = [];
  _layers.forEach((layer) => {
    var totalWeight = 0;
    layer.elements.forEach((element) => {
      totalWeight += element.weight;
    });
    // number between 0 - totalWeight
    let random = Math.floor(Math.random() * totalWeight);
    for (var i = 0; i < layer.elements.length; i++) {
      // subtract the current weight from the random weight until we reach a sub zero value.
      random -= layer.elements[i].weight;
      if (random < 0) {
        return randNum.push(
          `${layer.elements[i].id}:${layer.elements[i].filename}`
        );
      }
    }
  });
  return randNum;
};

// const writeMetaData = (_data) => {
//   fs.writeFileSync(`${buildDir}/json/_metadata.json`, _data);
// };

// const saveMetaDataSingleFile = (_editionCount) => {
//   let metadata = metadataList.find((meta) => meta.edition == _editionCount);
//   debugLogs
//     ? console.log(
//         `Writing metadata for ${_editionCount}: ${JSON.stringify(metadata)}`
//       )
//     : null;
//   fs.writeFileSync(
//     `${buildDir}/json/${_editionCount}.json`,
//     JSON.stringify(metadata, null, 2)
//   );
// };

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}

// export createPreview = (elements, format, canvasIds=[], layerOrder) => {
//  // layersOrder = [{ name: "body" }];
//   canvasIds.forEach(id => {
//   })

// }

export const startCreating = async (canvasId) => {
  let canvases = [];
  let layerConfigIndex = 0;
  let editionCount = 1;
  let failedCount = 0;
  let abstractedIndexes = [];
  for (
    let i = 0;
    i <= layerConfigurations[layerConfigurations.length - 1].growEditionSizeTo;
    i++
  ) {
    abstractedIndexes.push(i);
  }
  if (shuffleLayerConfigurations) {
    abstractedIndexes = shuffle(abstractedIndexes);
  }
  while (layerConfigIndex < layerConfigurations.length) {
    const layers = layersSetup(
      layerConfigurations[layerConfigIndex].layersOrder
    );
    while (
      editionCount <= layerConfigurations[layerConfigIndex].growEditionSizeTo
    ) {
      let newDna = createDna(layers);
      if (isDnaUnique(dnaList, newDna)) {
        let results = constructLayerToDna(newDna, layers);
        let loadedElements = [];

        results.forEach((layer) => {
          loadedElements.push(loadLayerImg(layer));
        });

          const canvas = document.getElementById(canvasId);
          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, format.width, format.height);
          loadedElements.forEach((renderObject) => {
            drawElement(renderObject, ctx);
          });
          canvases.push(ctx);
          // addMetadata(newDna, abstractedIndexes[0]);
          // saveMetaDataSingleFile(abstractedIndexes[0]);

        dnaList.push(newDna);
        editionCount++;
        abstractedIndexes.shift();
      } else {
        console.log("DNA exists!");
        failedCount++;
        if (failedCount >= uniqueDnaTorrance) {
          console.log(
            `You need more layers or elements to grow your edition to ${layerConfigurations[layerConfigIndex].growEditionSizeTo} artworks!`
          );
          return canvases
        }
      }
    }
    layerConfigIndex++;
  }
  return canvases
  // writeMetaData(JSON.stringify(metadataList, null, 2));
};
