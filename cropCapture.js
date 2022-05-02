const { desktopCapturer } = require('electron')
const fs = require('fs');
const folderName = 'cropCapture';

module.exports = function cropCapture (CropPosition, CropSize) {
    desktopCapturer.getSources({
      types: [ 'screen' ],
      thumbnailSize: {
        width: 1280,
        height: 720
      } 
  
    }).then(async sources => {
      for (const [idx, source] of sources.entries()) {
        let fileName = `screen_${idx}`;
        const rect ={
          x: CropPosition[0] - 10,
          y: CropPosition[1] - 20,
          width: Math.ceil(CropSize[0] - (CropSize[0] * 0.21)),
          height: Math.ceil(CropSize[1] - (CropSize[1] * 0.165))
        }
  
        const cropImg = source.thumbnail.crop(rect);
        const cropBuffer = cropImg.toPNG();
        const isExists = fs.existsSync( `./${folderName}` );
        if(!isExists) {
            createImg(cropBuffer, fileName);
        } else {
            fs.rmdir(`./${folderName}`, { recursive: true }, (err) => {
              if (err) {
                  throw err;
              }
              createImg(cropBuffer, fileName);
            }
            );
        }
      }
    })
  }

  function createImg(cropBuffer, fileName) {
    fs.mkdirSync( `./${folderName}`, { recursive: true } );
    setTimeout(() => {
      fs.writeFile(`${folderName}/${fileName}c.png`, cropBuffer, (err) => {
        if (err) throw err
        console.log('cropBuffer Saved');
      })
    },400)
  }
