const { desktopCapturer, screen } = require('electron')
const fs = require('fs');
const folderName = 'cropCapture';
const os = require('os');
const SOURCE_WIDTH = 1280;
const SOURCE_HEIGHT = 720;


module.exports = function cropCapture (CropPosition, CropSize) {
    desktopCapturer.getSources({
      types: [ 'screen' ],
      thumbnailSize: {
        width: SOURCE_WIDTH,
        height: SOURCE_HEIGHT
      } 
  
    }).then(async sources => {
      for (const [idx, source] of sources.entries()) {
        let fileName = `screen_${idx}`;
        const screenWidth = screen;
        // const screenHeight = screen.height;

        const rect ={
          x: CropPosition[0] - (os.platform() === 'win32' ? 16 : 10),
          y: CropPosition[1] - (os.platform() === 'win32' ? 8 : 20),
          width: Math.round(CropSize[0] * SOURCE_WIDTH / screenWidth.getPrimaryDisplay().bounds.width),
          height: Math.round(CropSize[1] * SOURCE_HEIGHT / screenWidth.getPrimaryDisplay().bounds.height)
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
