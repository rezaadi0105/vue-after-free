(function () {
  include('languages.js');
  log(lang.loadingMainMenu);
  var currentButton = 0;
  var buttons = [];
  var buttonTexts = [];
  var buttonMarkers = [];
  var buttonOrigPos = [];
  var textOrigPos = [];
  var normalButtonImg = 'file:///../download0/themes/CYBRPNK277/img/black.png';
  var selectedButtonImg = 'file:///../download0/themes/CYBRPNK277/img/Red.png';
  jsmaf.root.children.length = 0;
  
  new Style({
    name: 'white',
    color: '#FFFF00',
    size: 20
  });
  new Style({
    name: 'title',
    color: '#ff8800',
    size: 48
  });
  new Style({
    name: 'cyberpunk_accent',
    color: '#FF006E',
    size: 20
  });
  new Style({
    name: 'cyberpunk_accent',
    color: '#FF006E',
    size: 24
  });
  
  if (typeof startBgmIfEnabled === 'function') {
    startBgmIfEnabled();
  }
  var background = new Image({
    url: 'file:///../download0/themes/CYBRPNK277/img/Background.png',
    x: 0,
    y: 0,
    width: 1920,
    height: 1080
  });
  jsmaf.root.children.push(background);
  
  var centerX = 960;
  var logoWidth = 400;
  var logoHeight = 225;
  var logo = new Image({
    url: 'file:///../download0/themes/CYBRPNK277/img/logo.png',
    x: 1350,
    y: 30,
    width: logoWidth,
    height: logoHeight
  });
  jsmaf.root.children.push(logo);
  
  var logoBorder = new Image({
    x: 1340,
    y: 20,
    width: logoWidth + 20,
    height: logoHeight + 20,
    alpha: 0.3
  });
  logoBorder.borderColor = '#ff8800';
  logoBorder.borderWidth = 3;
  jsmaf.root.children.push(logoBorder);
  
  var titleBox = new Image({
    url: 'file:///../download0/themes/CYBRPNK277/img/options_bg.png',
    x: 20,
    y: 70,
    width: 425,
    height: 110,
    alpha: 0.70
  });
  titleBox.borderColor = '#ff8800';
  titleBox.borderWidth = 3;
  jsmaf.root.children.push(titleBox);
  
  var _title = new jsmaf.Text();
  _title.text = 'MAIN MENU';
  _title.x = 80;
  _title.y = 100;
  _title.style = 'title';
  jsmaf.root.children.push(_title);
  
  var subtitle = new jsmaf.Text();
  subtitle.text = '[ SYSTEM ENTRY POINT ]';
  subtitle.x = 80;
  subtitle.y = 140;
  subtitle.style = 'cyberpunk_accent';
  jsmaf.root.children.push(subtitle);
  
  var optionsBackgroundImage = new Image({
    url: 'file:///../download0/themes/CYBRPNK277/img/options_bg.png',
    x: 20,
    y: 200,
    width: 425,
    height: 750,
    alpha: 0.70
  });
  jsmaf.root.children.push(optionsBackgroundImage);
  
  var menuOptions = [{
    label: lang.jailbreak,
    script: 'loader.js',
    imgKey: 'jailbreak'
  }, {
    label: lang.payloadMenu,
    script: 'payload_host.js',
    imgKey: 'payloadMenu'
  }, {
    label: lang.config,
    script: 'config_ui.js',
    imgKey: 'config'
  }];
  var startY = 250;
  var buttonSpacing = 110;
  var buttonWidth = 300;
  var buttonHeight = 70;
  for (var i = 0; i < menuOptions.length; i++) {
    var btnX = 80;
    var btnY = startY + i * buttonSpacing;
    var button = new Image({
      url: normalButtonImg,
      x: btnX,
      y: btnY,
      width: buttonWidth,
      height: buttonHeight
    });
    buttons.push(button);
    jsmaf.root.children.push(button);
    var btnText = void 0;
    if (useImageText) {
      btnText = new Image({
        url: textImageBase + menuOptions[i].imgKey + '.png',
        x: btnX + 30,
        y: btnY + 20,
        width: 320,
        height: 50
      });
    } else {
      btnText = new jsmaf.Text();
      btnText.text = menuOptions[i].label;
      btnText.x = btnX + 30;
      btnText.y = btnY + 20;
      btnText.style = 'white';
    }
    buttonTexts.push(btnText);
    jsmaf.root.children.push(btnText);
    buttonOrigPos.push({
      x: btnX,
      y: btnY
    });
    textOrigPos.push({
      x: btnText.x,
      y: btnText.y
    });
  }
  var exitX = 80;
  var exitY = 830;
  var exitButton = new Image({
    url: normalButtonImg,
    x: exitX,
    y: exitY,
    width: buttonWidth,
    height: buttonHeight
  });
  buttons.push(exitButton);
  jsmaf.root.children.push(exitButton);
  var exitText;
  if (useImageText) {
    exitText = new Image({
      url: textImageBase + 'exit.png',
      x: exitX + 30,
      y: exitY + 20,
      width: 320,
      height: 50
    });
  } else {
    exitText = new jsmaf.Text();
    exitText.text = lang.exit;
    exitText.x = exitX + 30;
    exitText.y = exitY + 20;
    exitText.style = 'white';
  }
  buttonTexts.push(exitText);
  jsmaf.root.children.push(exitText);
  buttonOrigPos.push({
    x: exitX,
    y: exitY
  });
  textOrigPos.push({
    x: exitText.x,
    y: exitText.y
  });
  var zoomInInterval = null;
  var zoomOutInterval = null;
  var prevButton = -1;
  function easeInOut(t) {
    return (1 - Math.cos(t * Math.PI)) / 2;
  }
  function animateZoomIn(btn, text, btnOrigX, btnOrigY, textOrigX, textOrigY) {
    if (zoomInInterval) jsmaf.clearInterval(zoomInInterval);
    var btnW = buttonWidth;
    var btnH = buttonHeight;
    var startScale = btn.scaleX || 1.0;
    var endScale = 1.1;
    var duration = 175;
    var elapsed = 0;
    var step = 16;
    zoomInInterval = jsmaf.setInterval(function () {
      elapsed += step;
      var t = Math.min(elapsed / duration, 1);
      var eased = easeInOut(t);
      var scale = startScale + (endScale - startScale) * eased;
      btn.scaleX = scale;
      btn.scaleY = scale;
      btn.x = btnOrigX - btnW * (scale - 1) / 2;
      btn.y = btnOrigY - btnH * (scale - 1) / 2;
      text.scaleX = scale;
      text.scaleY = scale;
      text.x = textOrigX - btnW * (scale - 1) / 2;
      text.y = textOrigY - btnH * (scale - 1) / 2;
      if (t >= 1 && zoomInInterval) {
        jsmaf.clearInterval(zoomInInterval);
        zoomInInterval = null;
      }
    }, step);
  }
  function animateZoomOut(btn, text, btnOrigX, btnOrigY, textOrigX, textOrigY) {
    if (zoomOutInterval) jsmaf.clearInterval(zoomOutInterval);
    var btnW = buttonWidth;
    var btnH = buttonHeight;
    var startScale = btn.scaleX || 1.1;
    var endScale = 1.0;
    var duration = 175;
    var elapsed = 0;
    var step = 16;
    zoomOutInterval = jsmaf.setInterval(function () {
      elapsed += step;
      var t = Math.min(elapsed / duration, 1);
      var eased = easeInOut(t);
      var scale = startScale + (endScale - startScale) * eased;
      btn.scaleX = scale;
      btn.scaleY = scale;
      btn.x = btnOrigX - btnW * (scale - 1) / 2;
      btn.y = btnOrigY - btnH * (scale - 1) / 2;
      text.scaleX = scale;
      text.scaleY = scale;
      text.x = textOrigX - btnW * (scale - 1) / 2;
      text.y = textOrigY - btnH * (scale - 1) / 2;
      if (t >= 1 && zoomOutInterval) {
        jsmaf.clearInterval(zoomOutInterval);
        zoomOutInterval = null;
      }
    }, step);
  }
  function updateHighlight() {
    var prevButtonObj = buttons[prevButton];
    if (prevButton >= 0 && prevButton !== currentButton && prevButtonObj) {
      prevButtonObj.url = normalButtonImg;
      prevButtonObj.alpha = 0.3;
      prevButtonObj.borderColor = 'transparent';
      prevButtonObj.borderWidth = 0;
      animateZoomOut(prevButtonObj, buttonTexts[prevButton], buttonOrigPos[prevButton].x, buttonOrigPos[prevButton].y, textOrigPos[prevButton].x, textOrigPos[prevButton].y);
    }

    for (var _i = 0; _i < buttons.length; _i++) {
      var _button = buttons[_i];
      var buttonText = buttonTexts[_i];
      var buttonOrigPos_ = buttonOrigPos[_i];
      var textOrigPos_ = textOrigPos[_i];
      if (_button === undefined || buttonText === undefined || buttonOrigPos_ === undefined || textOrigPos_ === undefined) continue;
      if (_i === currentButton) {
        _button.url = selectedButtonImg;
        _button.alpha = 1.0;
        _button.borderColor = '#ff8800';
        _button.borderWidth = 4;
        animateZoomIn(_button, buttonText, buttonOrigPos_.x, buttonOrigPos_.y, textOrigPos_.x, textOrigPos_.y);
      } else if (_i !== prevButton) {
        _button.url = normalButtonImg;
        _button.alpha = 0.3;
        _button.borderColor = 'transparent';
        _button.borderWidth = 0;
        _button.scaleX = 1.0;
        _button.scaleY = 1.0;
        _button.x = buttonOrigPos_.x;
        _button.y = buttonOrigPos_.y;
        buttonText.scaleX = 1.0;
        buttonText.scaleY = 1.0;
        buttonText.x = textOrigPos_.x;
        buttonText.y = textOrigPos_.y;
      }
    }
    prevButton = currentButton;
  }
  function handleButtonPress() {
    if (currentButton === buttons.length - 1) {
      include('includes/kill_vue.js');
    } else if (currentButton < menuOptions.length) {
      var selectedOption = menuOptions[currentButton];
      if (!selectedOption) return;
      if (selectedOption.script === 'loader.js') {
        jsmaf.onKeyDown = function () {};
      }
      log('Loading ' + selectedOption.script + '...');
      try {
        if (selectedOption.script.includes('loader.js')) {
          include(selectedOption.script);
        } else {
          include('themes/' + (typeof CONFIG !== 'undefined' && CONFIG.theme ? CONFIG.theme : 'default') + '/' + selectedOption.script);
        }
      } catch (e) {
        log('ERROR loading ' + selectedOption.script + ': ' + e.message);
        if (e.stack) log(e.stack);
      }
    }
  }
  jsmaf.onKeyDown = function (keyCode) {
    if (keyCode === 6 || keyCode === 5) {
      currentButton = (currentButton + 1) % buttons.length;
      updateHighlight();
    } else if (keyCode === 4 || keyCode === 7) {
      currentButton = (currentButton - 1 + buttons.length) % buttons.length;
      updateHighlight();
    } else if (keyCode === 14) {
      handleButtonPress();
    }
  };
  var creditsBox = new Image({
    url: 'file:///../download0/themes/CYBRPNK277/img/black.png',
    x: 1340,
    y: 270,
    width: 420,
    height: 500,
    alpha: 0.5
  });
  creditsBox.borderColor = '#ff8800';
  creditsBox.borderWidth = 3;
  jsmaf.root.children.push(creditsBox);
  
  var creditText = new jsmaf.Text();
  creditText.text = '[ CREDITS ]';
  creditText.x = 1360;
  creditText.y = 270;
  creditText.style = 'title';
  jsmaf.root.children.push(creditText);
  
  var creditLine1 = new jsmaf.Text();
  creditLine1.text = 'Theme By:';
  creditLine1.x = 1360;
  creditLine1.y = 330;
  creditLine1.style = 'white';
  jsmaf.root.children.push(creditLine1);
  
  var creditLine2 = new jsmaf.Text();
  creditLine2.text = 'MightyMac25';
  creditLine2.x = 1360;
  creditLine2.y = 355;
  creditLine2.style = 'white';
  jsmaf.root.children.push(creditLine2);
  
  var creditLine3 = new jsmaf.Text();
  creditLine3.text = '━━━━━━━━━━━━━━━';
  creditLine3.x = 1360;
  creditLine3.y = 390;
  creditLine3.style = 'cyberpunk_accent';
  jsmaf.root.children.push(creditLine3);
  
  var creditLine4 = new jsmaf.Text();
  creditLine4.text = '>Vue after free team';
  creditLine4.x = 1360;
  creditLine4.y = 425;
  creditLine4.style = 'white';
  jsmaf.root.children.push(creditLine4);
  
  var creditLine5 = new jsmaf.Text();
  creditLine5.text = 'c0w-ar';
  creditLine5.x = 1360;
  creditLine5.y = 450;
  creditLine5.style = 'white';
  jsmaf.root.children.push(creditLine5);
  
  var creditLine6 = new jsmaf.Text();
  creditLine6.text = 'earthonion';
  creditLine6.x = 1360;
  creditLine6.y = 475;
  creditLine6.style = 'white';
  jsmaf.root.children.push(creditLine6);
  
  var creditLine7 = new jsmaf.Text();
  creditLine7.text = 'ufm-42';
  creditLine7.x = 1360;
  creditLine7.y = 500;
  creditLine7.style = 'white';
  jsmaf.root.children.push(creditLine7);
  
  var creditLine8 = new jsmaf.Text();
  creditLine8.text = 'D-link Turtle';
  creditLine8.x = 1360;
  creditLine8.y = 525;
  creditLine8.style = 'white';
  jsmaf.root.children.push(creditLine8);

  var creditLine8 = new jsmaf.Text();
  creditLine8.text = 'Genzine and more!';
  creditLine8.x = 1360;
  creditLine8.y = 545;
  creditLine8.style = 'white';
  jsmaf.root.children.push(creditLine8);
  
  var creditLine9 = new jsmaf.Text();
  creditLine9.text = '━━━━━━━━━━━━━━━';
  creditLine9.x = 1360;
  creditLine9.y = 560;
  creditLine9.style = 'cyberpunk_accent';
  jsmaf.root.children.push(creditLine9);
  
  var creditLine10 = new jsmaf.Text();
  creditLine10.text = '>Vue V2 theme V1.0 ';
  creditLine10.x = 1360;
  creditLine10.y = 595;
  creditLine10.style = 'white';
  jsmaf.root.children.push(creditLine10);
  
  var creditLine11 = new jsmaf.Text();
  creditLine11.text = 'Arrow Keys Navigate';
  creditLine11.x = 1360;
  creditLine11.y = 620;
  creditLine11.style = 'white';
  jsmaf.root.children.push(creditLine11);
  
  var creditLine12 = new jsmaf.Text();
  creditLine12.text = 'X/Circle to Select';
  creditLine12.x = 1360;
  creditLine12.y = 645;
  creditLine12.style = 'white';
  jsmaf.root.children.push(creditLine12);
  
  updateHighlight();
  log(lang.mainMenuLoaded);
})();