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
      const cropPositionX = CropPosition[0];
      const cropPositionY = CropPosition[1];
      const cropSizeWidth = CropSize[0];
      const cropSizeHeight = CropSize[1];

      const mainScreenWidthRatio = SOURCE_WIDTH / screen.getPrimaryDisplay().bounds.width;
      const mainScreenHeightRatio = SOURCE_HEIGHT / screen.getPrimaryDisplay().bounds.height;

      const mainRect ={
        x: Math.round(cropPositionX * mainScreenWidthRatio),
        y: Math.round(cropPositionY * mainScreenHeightRatio),
        width: Math.round(cropSizeWidth * mainScreenWidthRatio),
        height: Math.round(cropSizeHeight * mainScreenHeightRatio)
      };

      const matchScreen = screen.getDisplayMatching(mainRect);
      const mainScreen = screen.getPrimaryDisplay(mainRect);

      // 크롭할 화면 아이디
      const cropTargetScreenArr = [];
      const isCropTargetScreenId = [];

      if (sources.length > 1) {
        if (matchScreen.id === mainScreen.id) {
          isCropTargetScreenId.push(mainScreen.id);
          cropTargetScreenArr.push({
            id: mainScreen.id,
            rect: mainRect
          });
        } else {
          // 크롭할 디스플레이 입력
          isCropTargetScreenId.push(mainScreen.id);
          isCropTargetScreenId.push(matchScreen.id);

          const matchScreenWidthRatio = SOURCE_WIDTH / matchScreen.size.width;
          const matchScreenHeightRatio = SOURCE_HEIGHT / matchScreen.size.height;

          // 왼쪽 모니터
          if (cropPositionX < 0) {
            // 크롭할 사이즈보다 cropPosition X축이 큰 경우 <-- 크롭영역이 왼쪽 화면으로 아예 넘어간 경우(겹치지 않음)
            if (Math.abs(cropPositionX) >= cropSizeWidth) {
              cropTargetScreenArr.push({
                id: matchScreen.id,
                rect: {
                  x: Math.round((matchScreen.size.width + cropPositionX) * matchScreenWidthRatio),
                  y: Math.round(cropPositionY * matchScreenHeightRatio),
                  width: Math.round(cropSizeWidth * matchScreenWidthRatio),
                  height: Math.round(cropSizeHeight * matchScreenHeightRatio)
                }
              });
            } else {
              // 크롭영역이 왼쪽과 메인화면에 겹치는 경우

            }
          }
          // 위쪽 모니터
          if (cropPositionY < 0) {
            // 크롭할 사이즈보다 cropPosition Y축이 큰 경우 <-- 크롭영역이 위쪽 화면으로 아예 넘어간 경우(겹치지 않음)
            if (Math.abs(cropPositionY) >= cropSizeHeight) {
              cropTargetScreenArr.push({
                id: matchScreen.id,
                rect: {
                  x: Math.round(cropPositionX * matchScreenWidthRatio),
                  y: Math.round((matchScreen.size.height + cropPositionY) * matchScreenHeightRatio),
                  width: Math.round(cropSizeWidth * SOURCE_WIDTH / matchScreen.size.width),
                  height: Math.round(cropSizeHeight * SOURCE_HEIGHT / matchScreen.size.height)
                }
              });
            } else {
              // 크롭영역이 위쪽과 메인화면에 겹치는 경우
            }
          }
          // 오른쪽 모니터
          if (cropPositionX > mainScreen.size.width) {
            // 크롭 영역이 오른쪽화면으로 넘어간 경우
            if (cropSizeWidth >= (cropPositionX - mainScreen.size.width)) {
              cropTargetScreenArr.push({
                id: matchScreen.id,
                rect: {
                  x: Math.round((cropPositionX - matchScreen.size.width) * matchScreenWidthRatio),
                  y: Math.round(cropPositionY * matchScreenHeightRatio),
                  width: Math.round(cropSizeWidth * SOURCE_WIDTH / matchScreen.size.width),
                  height: Math.round(cropSizeHeight * SOURCE_HEIGHT / matchScreen.size.height)
                }
              });
            } else {
              // 크롭 영역이 오른쪽화면과 메인화면에 겹치는경우
            }
          }
        }
      } else {
        isCropTargetScreenId.push(mainScreen.id);
        cropTargetScreenArr.push({
          id: mainScreen.id,
          rect: mainRect
        });      
      }

      for (const [idx, source] of sources.entries()) {
        let fileName = `screen_${idx}`;
  
        if (isCropTargetScreenId.includes(Number(source.display_id))) {
          const targetScreen = cropTargetScreenArr.filter(targetScreen => targetScreen.id === Number(source.display_id))?.[0];
          if (targetScreen) {
            const cropImg = source.thumbnail.crop(targetScreen.rect);
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
