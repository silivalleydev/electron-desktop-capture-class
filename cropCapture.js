const { desktopCapturer } = require('electron')
const fs = require('fs');

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
        

        console.log('CropPosition[0]', CropPosition[0])
        console.log('CropPosition[1]', CropPosition[1])
        console.log('CropSize[0]', CropSize[0] - (CropSize[0] * 0.333))
        console.log('CropSize[1]', CropSize[1] - (CropSize[1]* 0.571))
        const rect ={
          x: CropPosition[0] - 35,
          y: CropPosition[1] - 20,
          width: Math.ceil(CropSize[0] - (CropSize[0] * 0.21)),
          height: Math.ceil(CropSize[1] - (CropSize[1] * 0.165))
        }
  
        const cropImg = source.thumbnail.crop(rect);
        console.log('cropImg', cropImg);
        const cropBuffer = cropImg.toPNG();
  
        const isExists = fs.existsSync( './capture' );
        if(!isExists) {
            createImg(cropBuffer, fileName);
        } else {
            fs.rmdir('./capture', { recursive: true }, (err) => {
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
    fs.mkdirSync( './capture', { recursive: true } );
    setTimeout(() => {
      fs.writeFile(`capture/${fileName}c.png`, cropBuffer, (err) => {
        if (err) throw err
        console.log('cropBuffer Saved');
      })
    },400)
  }
