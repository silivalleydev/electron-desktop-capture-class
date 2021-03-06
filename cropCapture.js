const { desktopCapturer, screen } = require('electron')
const fs = require('fs');
const folderName = 'cropCapture';
const SOURCE_WIDTH = 10240;
const SOURCE_HEIGHT = 6400;


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

      console.log('cropPositionX??', cropPositionX)
      console.log('cropPositionY??', cropPositionY)

      const mainScreenWidth = screen.getPrimaryDisplay().bounds.width;
      const mainScreenHeight = screen.getPrimaryDisplay().bounds.height;

      const mainRect ={
        x: cropPositionX,
        y: cropPositionY,
        width: cropSizeWidth,
        height: cropSizeHeight
      };

      const matchScreen = screen.getDisplayMatching(mainRect);
      const mainScreen = screen.getPrimaryDisplay(mainRect);
      console.log('mainRect??', mainRect)
      console.log('matchScreen??', matchScreen)
      console.log('mainScreen??', mainScreen)

      // 크롭할 화면 아이디
      const cropTargetScreenArr = [];
      const isCropTargetScreenId = [];

      if (sources.length > 1) {
        if (matchScreen.id === mainScreen.id) {
          isCropTargetScreenId.push(mainScreen.id);
          cropTargetScreenArr.push({
            id: mainScreen.id,
            resize: {
              width: mainScreenWidth,
              height: mainScreenHeight
            },
            rect: mainRect
          });
        } else {
          // 크롭할 디스플레이 입력
          const matchScreenWidth = matchScreen.size.width;
          const matchScreenHeight = matchScreen.size.height;
          let isAlreadyInCondition = false;
          // //왼쪽 위에 캡쳐
          if (cropPositionX < 0 && cropPositionY < 0 && !isAlreadyInCondition) {
            console.log(matchScreen.bounds.x, matchScreenWidth, cropPositionX)
            isAlreadyInCondition = true;
            isCropTargetScreenId.push(matchScreen.id);
            cropTargetScreenArr.push({
              id: matchScreen.id,
              resize: {
                width: matchScreenWidth,
                height: matchScreenHeight
              },
              rect: {
                x: matchScreenWidth + matchScreen.bounds.x > 0 ? cropPositionX + Math.abs(matchScreen.bounds.x) : matchScreenWidth + cropPositionX,
                y: cropPositionY - matchScreen.bounds.y,
                width: cropSizeWidth,
                height: cropSizeHeight
              }
            });
          }
          // // 왼쪽 아래 캡쳐
          if (cropPositionX < 0 && cropPositionY >= mainScreenHeight && !isAlreadyInCondition) {
            isAlreadyInCondition = true;
            isCropTargetScreenId.push(matchScreen.id);
            cropTargetScreenArr.push({
              id: matchScreen.id,
              resize: {
                width: matchScreenWidth,
                height: matchScreenHeight
              },
              rect: {
                x: matchScreenWidth + matchScreen.bounds.x > 0 ? cropPositionX + Math.abs(matchScreen.bounds.x) : matchScreenWidth + cropPositionX,
                y: cropPositionY - matchScreen.bounds.y,
                width: cropSizeWidth,
                height: cropSizeHeight
              }
            });
          }

          // 오른쪽 위에 캡쳐하는 경우
          if (cropPositionX >= mainScreenWidth && cropPositionY < 0 && !isAlreadyInCondition) {
            console.log(mainScreenWidth, cropPositionX, matchScreen.bounds.x)
            isAlreadyInCondition = true;
            isCropTargetScreenId.push(matchScreen.id);
            cropTargetScreenArr.push({
              id: matchScreen.id,
              resize: {
                width: matchScreenWidth,
                height: matchScreenHeight
              },
              rect: {
                x: (matchScreen.bounds.x < mainScreenWidth) ? cropPositionX - mainScreenWidth + (mainScreenWidth - matchScreen.bounds.x) : cropPositionX - mainScreenWidth,
                // x: cropPositionX - mainScreenWidth,
                y: cropPositionY - matchScreen.bounds.y,
                width: cropSizeWidth,
                height: cropSizeHeight
              }
            });
          }
          // 오른쪽 아래에 캡쳐하는 경우
          if (cropPositionX >= mainScreenWidth && cropPositionY >= mainScreenHeight && !isAlreadyInCondition) {
            console.log(matchScreen.bounds.x, cropPositionX, mainScreenWidth)
            isAlreadyInCondition = true;
            isCropTargetScreenId.push(matchScreen.id);
            cropTargetScreenArr.push({
              id: matchScreen.id,
              resize: {
                width: matchScreenWidth,
                height: matchScreenHeight
              },
              rect: {
                x: (matchScreen.bounds.x < mainScreenWidth) ? cropPositionX - mainScreenWidth + (mainScreenWidth - matchScreen.bounds.x) : cropPositionX - mainScreenWidth,
                y: cropPositionY - matchScreen.bounds.y,
                width: cropSizeWidth,
                height: cropSizeHeight
              }
            });
          }


          // 왼쪽 모니터
          if (cropPositionX < 0 && !isAlreadyInCondition) {
            isAlreadyInCondition = true;
            // 크롭할 사이즈보다 cropPosition X축이 큰 경우 <-- 크롭영역이 왼쪽 화면으로 아예 넘어간 경우(겹치지 않음)
            if (Math.abs(cropPositionX) >= cropSizeWidth) {
              isCropTargetScreenId.push(matchScreen.id);
              cropTargetScreenArr.push({
                id: matchScreen.id,
                resize: {
                  width: matchScreenWidth,
                  height: matchScreenHeight
                },
                rect: {
                  x: matchScreen.size.width + cropPositionX,
                  y: cropPositionY - matchScreen.bounds.y,
                  width: cropSizeWidth,
                  height: cropSizeHeight
                }
              });
            } else {
              // 크롭영역이 왼쪽과 메인화면에 겹치는 경우
              isCropTargetScreenId.push(matchScreen.id);
              isCropTargetScreenId.push(mainScreen.id);

              cropTargetScreenArr.push({
                id: matchScreen.id,
                resize: {
                  width: matchScreenWidth,
                  height: matchScreenHeight
                },
                rect: {
                  x: matchScreen.size.width + cropPositionX,
                  y: cropPositionY - matchScreen.bounds.y,
                  width: Math.abs(cropPositionX),
                  height: cropSizeHeight
                }
              });
              cropTargetScreenArr.push({
                id: mainScreen.id,
                resize: {
                  width: mainScreenWidth,
                  height: mainScreenHeight
                },
                rect: {
                  x: 0,
                  y: cropPositionY,
                  width: cropSizeWidth + cropPositionX,
                  height: cropSizeHeight
                }              
              });

            }
          }
          // 위쪽 모니터
          if (cropPositionY < 0 && !isAlreadyInCondition) {
            isAlreadyInCondition = true;
            // 크롭할 사이즈보다 cropPosition Y축이 큰 경우 <-- 크롭영역이 위쪽 화면으로 아예 넘어간 경우(겹치지 않음)
            if (Math.abs(cropPositionY) >= cropSizeHeight) {
              console.log(matchScreenWidth, matchScreen.bounds.x, cropPositionX)
              isCropTargetScreenId.push(matchScreen.id);
              cropTargetScreenArr.push({
                id: matchScreen.id,
                resize: {
                  width: matchScreenWidth,
                  height: matchScreenHeight
                },
                rect: {
                  x: cropPositionX - matchScreen.bounds.x,
                  y: matchScreenHeight + cropPositionY,
                  width: cropSizeWidth,
                  height: cropSizeHeight
                }
              });
            } else {
              // 크롭영역이 위쪽과 메인화면에 겹치는 경우
              isCropTargetScreenId.push(mainScreen.id);
              isCropTargetScreenId.push(matchScreen.id);
              cropTargetScreenArr.push({
                id: matchScreen.id,
                resize: {
                  width: matchScreenWidth,
                  height: matchScreenHeight
                },
                rect: {
                  x: cropPositionX - matchScreen.bounds.x,
                  y: matchScreen.size.height + cropPositionY,
                  width: cropSizeWidth,
                  height: Math.abs(cropPositionY)
                }
              });
              cropTargetScreenArr.push({
                id: mainScreen.id,
                resize: {
                  width: mainScreenWidth,
                  height: mainScreenHeight
                },
                rect: {
                  x: cropPositionX,
                  y: 0,
                  width: cropSizeWidth,
                  height: cropSizeHeight + cropPositionY
                }        
              });
            }
          }
          // 오른쪽 모니터
          if ((cropPositionX + cropSizeWidth) >= mainScreenWidth && !isAlreadyInCondition) {
            isAlreadyInCondition = true;

            // 크롭 영역이 오른쪽화면으로 넘어간 경우
            if (cropPositionX >= mainScreenWidth) {

              isCropTargetScreenId.push(matchScreen.id);
              cropTargetScreenArr.push({
                id: matchScreen.id,
                resize: {
                  width: matchScreenWidth,
                  height: matchScreenHeight
                },
                rect: {
                  x: cropPositionX - mainScreenWidth,
                  y: cropPositionY - matchScreen.bounds.y,
                  width: cropSizeWidth,
                  height: cropSizeHeight
                }
              });
            } else {
              // 크롭 영역이 오른쪽화면과 메인화면에 겹치는경우
              isCropTargetScreenId.push(matchScreen.id);
              isCropTargetScreenId.push(mainScreen.id);

              cropTargetScreenArr.push({
                id: matchScreen.id,
                resize: {
                  width: matchScreenWidth,
                  height: matchScreenHeight
                },
                rect: {
                  x: 0,
                  y: cropPositionY - matchScreen.bounds.y,
                  width: (cropPositionX + cropSizeWidth) - mainScreenWidth,
                  height: cropSizeHeight
                }
              });
              cropTargetScreenArr.push({
                id: mainScreen.id,
                resize: {
                  width: mainScreenWidth,
                  height: mainScreenHeight
                },
                rect: {
                  x: cropPositionX,
                  y: cropPositionY,
                  width: mainScreenWidth - cropPositionX,
                  height: cropSizeHeight
                }        
              });
            }
          }
        }
      } else {
        isCropTargetScreenId.push(mainScreen.id);
        cropTargetScreenArr.push({
          id: mainScreen.id,
          resize: {
            width: mainScreenWidth,
            height: mainScreenHeight
          },
          rect: mainRect
        });
      }

      for (const [idx, source] of sources.entries()) {
        let fileName = `screen_${idx}`;
        if (isCropTargetScreenId.includes(Number(source.display_id))) {
          const targetScreen = cropTargetScreenArr.filter(targetScreen => targetScreen.id === Number(source.display_id))?.[0];
          if (targetScreen) {
            const cropImg = source.thumbnail.resize(targetScreen.resize).crop(targetScreen.rect);
            const cropBuffer = cropImg.toPNG();
            const isExists = fs.existsSync( `./${folderName}` );
            if(!isExists) {
                createImg(cropBuffer, fileName);
            } else {
                fs.rm(`./${folderName}`, { recursive: true }, (err) => {
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

      // combineImage();

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

  function combineImage() {
    let imageNameList = [];
    const files = fs.readdirSync('./cropCapture', {withFileTypes: true});
    imageNameList = files.map(file => `./cropCapture/${file.name}`);

    setTimeout(() => {
      const combineImage = require('combine-image');
      console.log('imageNameList??', imageNameList)

      combineImage(imageNameList)
        .then((img) => {
          // Save image as file
          const isExists = fs.existsSync( './cropCaptureCombine' );
          if( !isExists ) {
              fs.mkdirSync( './cropCaptureCombine', { recursive: true } );
              setTimeout(() => {
                img.write('./cropCaptureCombine/out.png', () => {
                  console.log('done')
                  // 파일을 읽는 것 <-- 이미지를 버퍼 데이터로 제공해주는것
                  fs.readFile("./cropCaptureCombine/out.png", function (err, buff) {
                    if (err) throw err;
                    
                    const resultFullScreenBuffer = buff;
                    console.log('풀스크린 결과 버퍼값 =>', resultFullScreenBuffer)
                });
                });
            }, 500)
          } else {
            fs.rm('./cropCaptureCombine', { recursive: true }, (err) => {
              if (err) {
                  throw err;
              }
              fs.mkdirSync( './cropCaptureCombine', { recursive: true });
              setTimeout(() => {
                  img.write('./cropCaptureCombine/out.png', () => {
                    console.log('done')
                    fs.readFile("./cropCaptureCombine/out.png", function (err, buff) {
                      if (err) throw err;
                      
                      const resultFullScreenBuffer = buff;
                      console.log('풀스크린 결과 버퍼값 =>', resultFullScreenBuffer)
                  });
                  });
              }, 500)
            })
            }
        });
    }, 500)
    .catch(err => console.log(err))
  }