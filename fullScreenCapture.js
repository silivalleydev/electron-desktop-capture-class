const { desktopCapturer } = require('electron')
const fs = require('fs');

module.exports = function appScreenshot() {
  
    desktopCapturer.getSources({ 
      types: ['window', 'screen'],
      thumbnailSize: {
        width: 1280,
        height: 720
      } 
    }).then(async sources => {
        let imageNameList = [];
  
        // fs.existsSync 디렉토리 존재하는지 확인
        const isExists = fs.existsSync( './capture' );
        if(!isExists ) {
          // fs.mkdirSync 폴더 만드는 것
          fs.mkdirSync( './capture', { recursive: true } );
          setTimeout(() => {
            for (const [idx, source] of sources.entries()) {
                let fileName = `${source.id.startsWith('screen') ? 'screen' : 'image'}_${idx}`;
                            //  파일을 생성하는것 <-- 첫번째에는 경로 + 파일명.확장자
                            const pngBuffer = source.thumbnail.toPNG();// Buffer 자료형의 데이터로 이미지를 제공해줌
                            console.log('pngBuffer ==> ', pngBuffer)
                            const isExists = fs.existsSync( './capture' );
                            if(!isExists ) {
                                
                                fs.writeFile(`capture/${fileName}d.png`, pngBuffer, (err) => {
                                  if (err) throw err
                                  console.log('Image Saved');
                                })
                                // 그 폴더에 있는 파일리스트를 줌
                                const files = fs.readdirSync('./capture', {withFileTypes: true});
                                /**
                                 * [
                                 *  {
                                 *    name: screen_0d.png
                                 *  },
                                 *  {
                                 *    name: screen_2d.png
                                 *  },
                                 *  {
                                 *    name: image_0d.png
                                 *  },
                                 *  {
                                 *    name: image_0d.png
                                 *  },
                                 *  {
                                 *    name: image_1d.png
                                 *  },
                                 * ]
                                 */
                                imageNameList = files.filter(file => file.name.startsWith("screen_")).map(file => `./capture/${file.name}`);
                                /**
                                 * ["./capture/screen_0d.png", "./capture/screen_2d.png"]
                                 */
                            }
                        }
                        setTimeout(() => {
                          const combineImage = require('combine-image');
                          console.log('imageNameList??', imageNameList)
                
                          combineImage(imageNameList)
                            .then((img) => {
                              // Save image as file
                              const isExists = fs.existsSync( './captureFullscreen' );
                              if( !isExists ) {
                                  fs.mkdirSync( './captureFullscreen', { recursive: true } );
                                  setTimeout(() => {
                                    img.write('./captureFullscreen/out.png', () => {
                                      console.log('done')
                                      // 파일을 읽는 것 <-- 이미지를 버퍼 데이터로 제공해주는것
                                      fs.readFile("./captureFullscreen/out.png", function (err, buff) {
                                        if (err) throw err;
                                        
                                        const resultFullScreenBuffer = buff;
                                        console.log('풀스크린 결과 버퍼값 =>', resultFullScreenBuffer)
                                    });
                                    });
                                }, 500)
                              } else {
                                fs.rmdir('./captureFullscreen', { recursive: true }, (err) => {
                                  if (err) {
                                      throw err;
                                  }
                                  fs.mkdirSync( './captureFullscreen', { recursive: true });
                                  setTimeout(() => {
                                      img.write('./captureFullscreen/out.png', () => {
                                        console.log('done')
                                        fs.readFile("./captureFullscreen/out.png", function (err, buff) {
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
          }, 500)
        } else {
          // fs.rmdir 폴더 지워주는 함수
          fs.rmdir('./capture', { recursive: true }, (err) => {
            if (err) {
                throw err;
            }
            fs.mkdirSync( './capture', { recursive: true });
            setTimeout(() => {
              for (const [idx, source] of sources.entries()) {
                  let fileName = `${source.id.startsWith('screen') ? 'screen' : 'image'}_${idx}`;
                            try{
                                fs.writeFile(`capture/${fileName}d.png`, source.thumbnail.toPNG(), (err) => {
                                  if (err) throw err
                                  console.log('Image Saved');
                                })
                                const files = fs.readdirSync('./capture', {withFileTypes: true});
                                imageNameList = files.filter(file => file.name.startsWith("screen_")).map(file => `./capture/${file.name}`)
                            } catch (e) {
                              console.log(e)
                            }
                    }
                    setTimeout(() => {
                      const combineImage = require('combine-image');
                      console.log('imageNameList??', imageNameList)
            
                      combineImage(imageNameList)
                        .then((img) => {
                          // Save image as file
                          const isExists = fs.existsSync( './captureFullscreen' );
                          if( !isExists ) {
                              fs.mkdirSync( './captureFullscreen', { recursive: true } );
                              setTimeout(() => {
                                img.write('./captureFullscreen/out.png', () => {
                                  console.log('done')
                                  fs.readFile("./captureFullscreen/out.png", function (err, buff) {
                                    if (err) throw err;
                                    
                                    const resultFullScreenBuffer = buff;
                                    console.log('풀스크린 결과 버퍼값 =>', resultFullScreenBuffer)
                                });
                                });
                            }, 500)
                          } else {
                            fs.rmdir('./captureFullscreen', { recursive: true }, (err) => {
                              if (err) {
                                  throw err;
                              }
                              fs.mkdirSync( './captureFullscreen', { recursive: true });
                              setTimeout(() => {
                                  img.write('./captureFullscreen/out.png', () => {
                                    console.log('done')
                                    fs.readFile("./captureFullscreen/out.png", function (err, buff) {
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
            }, 500)
          });
        }
    });
  }