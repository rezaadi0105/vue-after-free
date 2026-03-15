if (typeof libc_addr === 'undefined') {
  include('userland.js');
}
if (typeof lang === 'undefined') {
  include('languages.js');
}
(function () {
  log(lang.loadingConfig);
  var fs = {
    write: function (filename, content, callback) {
      var xhr = new jsmaf.XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && callback) {
          callback(xhr.status === 0 || xhr.status === 200 ? null : new Error('failed'));
        }
      };
      xhr.open('POST', 'file://../download0/' + filename, true);
      xhr.send(content);
    },
    read: function (filename, callback) {
      var xhr = new jsmaf.XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && callback) {
          callback(xhr.status === 0 || xhr.status === 200 ? null : new Error('failed'), xhr.responseText);
        }
      };
      xhr.open('GET', 'file://../download0/' + filename, true);
      xhr.send();
    }
  };
  var currentConfig = {
    autolapse: false,
    autopoop: false,
    autoclose: false,
    autoclose_delay: 0,
    music: true,
    jb_behavior: 0,
    theme: 'default'
  };

  var userPayloads = [];
  var configLoaded = false;
  var jbBehaviorLabels = [lang.jbBehaviorAuto, lang.jbBehaviorNetctrl, lang.jbBehaviorLapse];
  var jbBehaviorImgKeys = ['jbBehaviorAuto', 'jbBehaviorNetctrl', 'jbBehaviorLapse'];
  function scanThemes() {
    var themes = [];
    try {
      fn.register(0x05, 'open_sys', ['bigint', 'bigint', 'bigint'], 'bigint');
      fn.register(0x06, 'close_sys', ['bigint'], 'bigint');
      fn.register(0x110, 'getdents', ['bigint', 'bigint', 'bigint'], 'bigint');
      var themesDir = '/download0/themes';
      var path_addr = mem.malloc(256);
      var buf = mem.malloc(4096);
      for (var i = 0; i < themesDir.length; i++) {
        mem.view(path_addr).setUint8(i, themesDir.charCodeAt(i));
      }
      mem.view(path_addr).setUint8(themesDir.length, 0);
      var fd = fn.open_sys(path_addr, new BigInt(0, 0), new BigInt(0, 0));
      if (!fd.eq(new BigInt(0xffffffff, 0xffffffff))) {
        var count = fn.getdents(fd, buf, new BigInt(0, 4096));
        if (!count.eq(new BigInt(0xffffffff, 0xffffffff)) && count.lo > 0) {
          var offset = 0;
          while (offset < count.lo) {
            var d_reclen = mem.view(buf.add(new BigInt(0, offset + 4))).getUint16(0, true);
            var d_type = mem.view(buf.add(new BigInt(0, offset + 6))).getUint8(0);
            var d_namlen = mem.view(buf.add(new BigInt(0, offset + 7))).getUint8(0);
            var name = '';
            for (var _i = 0; _i < d_namlen; _i++) {
              name += String.fromCharCode(mem.view(buf.add(new BigInt(0, offset + 8 + _i))).getUint8(0));
            }
            if (d_type === 4 && name !== '.' && name !== '..') {
              themes.push(name);
            }
            offset += d_reclen;
          }
        }
        fn.close_sys(fd);
      }
    } catch (e) {
      log('Theme scan failed: ' + e.message);
    }
    var idx = themes.indexOf('default');
    if (idx > 0) {
      themes.splice(idx, 1);
      themes.unshift('default');
    } else if (idx < 0) {
      themes.unshift('default');
    }
    return themes;
  }
  var availableThemes = scanThemes();
  log('Discovered themes: ' + availableThemes.join(', '));
  var themeLabels = availableThemes.map(theme => theme.charAt(0).toUpperCase() + theme.slice(1));
  var themeImgKeys = availableThemes.map(theme => 'theme' + theme.charAt(0).toUpperCase() + theme.slice(1));
  var currentButton = 0;
  var buttons = [];
  var buttonTexts = [];
  var buttonMarkers = [];
  var buttonOrigPos = [];
  var textOrigPos = [];
  var valueTexts = [];
  var normalButtonImg = 'file:///../download0/themes/CYBRPNK277/img/black.png';
  var selectedButtonImg = 'file:///../download0/themes/CYBRPNK277/img/Red.png';
  jsmaf.root.children.length = 0;
  
  new Style({
    name: 'white',
    color: '#FFFF00',
    size: 24
  });
  new Style({
    name: 'title',
    color: '#ff8800',
    size: 32
  });
  new Style({
    name: 'value',
    color: '#FF006E',
    size: 22
  });
  new Style({
    name: 'cyberpunk_accent',
    color: '#FF006E',
    size: 20
  });
  
  var background = new Image({
    url: 'file:///../download0/themes/CYBRPNK277/img/Background.png',
    x: 0,
    y: 0,
    width: 1920,
    height: 1080
  });
  jsmaf.root.children.push(background);
  
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
  
  var optionsBackgroundImage = new Image({
    url: 'file:///../download0/themes/CYBRPNK277/img/options_bg.png',
    x: 20,
    y: 200,
    width: 500,
    height: 750,
    alpha: 0.70
  });
  jsmaf.root.children.push(optionsBackgroundImage);
  
  var _title = new jsmaf.Text();
  _title.text = 'CONFIGURATION';
  _title.x = 80;
  _title.y = 100;
  _title.style = 'title';
  jsmaf.root.children.push(_title);
  
  var subtitle = new jsmaf.Text();
  subtitle.text = '[ SYSTEM SETTINGS ]';
  subtitle.x = 80;
  subtitle.y = 140;
  subtitle.style = 'cyberpunk_accent';
  jsmaf.root.children.push(subtitle);
  var configOptions = [{
    key: 'autolapse',
    label: lang.autoLapse,
    imgKey: 'autoLapse',
    type: 'toggle'
  }, {
    key: 'autopoop',
    label: lang.autoPoop,
    imgKey: 'autoPoop',
    type: 'toggle'
  }, {
    key: 'autoclose',
    label: lang.autoClose,
    imgKey: 'autoClose',
    type: 'toggle'
  }, {
    key: 'music',
    label: lang.music,
    imgKey: 'music',
    type: 'toggle'
  }, {
    key: 'jb_behavior',
    label: lang.jbBehavior,
    imgKey: 'jbBehavior',
    type: 'cycle'
  }, {
    key: 'theme',
    label: lang.theme || 'Theme',
    imgKey: 'theme',
    type: 'cycle'
  }];
  var centerX = 960;
  var startY = 250;
  var buttonSpacing = 110;
  var buttonWidth = 380;
  var buttonHeight = 70;
  for (var i = 0; i < configOptions.length; i++) {
    var configOption = configOptions[i];
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
        url: textImageBase + configOption.imgKey + '.png',
        x: btnX + 30,
        y: btnY + 20,
        width: 320,
        height: 50
      });
    } else {
      btnText = new jsmaf.Text();
      btnText.text = configOption.label;
      btnText.x = btnX + 40;
      btnText.y = btnY + 23;
      btnText.style = 'white';
    }
    buttonTexts.push(btnText);
    jsmaf.root.children.push(btnText);
    if (configOption.type === 'toggle') {
      var checkmark = new Image({
        url: currentConfig[configOption.key] ? 'file:///assets/img/check_small_on.png' : 'file:///assets/img/check_small_off.png',
        x: btnX + 320,
        y: btnY + 15,
        width: 40,
        height: 40
      });
      valueTexts.push(checkmark);
      jsmaf.root.children.push(checkmark);
    } else {
      var valueLabel = void 0;
      if (configOption.key === 'jb_behavior') {
        if (useImageText) {
          valueLabel = new Image({
            url: textImageBase + jbBehaviorImgKeys[currentConfig.jb_behavior] + '.png',
            x: btnX + 230,
            y: btnY + 10,
            width: 100,
            height: 50
          });
        } else {
          valueLabel = new jsmaf.Text();
          valueLabel.text = jbBehaviorLabels[currentConfig.jb_behavior] || jbBehaviorLabels[0];
          valueLabel.x = btnX + 245;
          valueLabel.y = btnY + 23;
          valueLabel.style = 'value';
        }
      } else if (configOption.key === 'theme') {
        var _themeIndex = availableThemes.indexOf(currentConfig.theme);
        var _displayIndex = _themeIndex >= 0 ? _themeIndex : 0;
        if (useImageText) {
          valueLabel = new Image({
            url: textImageBase + themeImgKeys[_displayIndex] + '.png',
            x: btnX + 230,
            y: btnY + 10,
            width: 100,
            height: 50
          });
        } else {
          valueLabel = new jsmaf.Text();
          valueLabel.text = themeLabels[_displayIndex] || themeLabels[0];
          valueLabel.x = btnX + 245;
          valueLabel.y = btnY + 23;
          valueLabel.style = 'value';
        }
      }
      valueTexts.push(valueLabel);
      jsmaf.root.children.push(valueLabel);
    }
    buttonOrigPos.push({
      x: btnX,
      y: btnY
    });
    textOrigPos.push({
      x: btnText.x,
      y: btnText.y
    });
  }
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
      if (t >= 1) {
        jsmaf.clearInterval(zoomInInterval !== null && zoomInInterval !== void 0 ? zoomInInterval : -1);
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
      if (t >= 1) {
        jsmaf.clearInterval(zoomOutInterval !== null && zoomOutInterval !== void 0 ? zoomOutInterval : -1);
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

    for (var _i2 = 0; _i2 < buttons.length; _i2++) {
      var _button = buttons[_i2];
      var buttonText = buttonTexts[_i2];
      var buttonOrigPos_ = buttonOrigPos[_i2];
      var textOrigPos_ = textOrigPos[_i2];
      if (_button === undefined || buttonText === undefined || buttonOrigPos_ === undefined || textOrigPos_ === undefined) continue;
      if (_i2 === currentButton) {
        _button.url = selectedButtonImg;
        _button.alpha = 1.0;
        _button.borderColor = '#ff8800';
        _button.borderWidth = 4;
        animateZoomIn(_button, buttonText, buttonOrigPos_.x, buttonOrigPos_.y, textOrigPos_.x, textOrigPos_.y);
      } else if (_i2 !== prevButton) {
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
  function updateValueText(index) {
    var options = configOptions[index];
    var valueText = valueTexts[index];
    if (!options || !valueText) return;
    var key = options.key;
    if (options.type === 'toggle') {
      var value = currentConfig[key];
      valueText.url = value ? 'file:///assets/img/check_small_on.png' : 'file:///assets/img/check_small_off.png';
    } else {
      if (key === 'jb_behavior') {
        if (useImageText) {
          valueText.url = textImageBase + jbBehaviorImgKeys[currentConfig.jb_behavior] + '.png';
        } else {
          valueText.text = jbBehaviorLabels[currentConfig.jb_behavior] || jbBehaviorLabels[0];
        }
      } else if (key === 'theme') {
        var _themeIndex = availableThemes.indexOf(currentConfig.theme);
        var _displayIndex = _themeIndex >= 0 ? _themeIndex : 0;
        if (useImageText) {
          valueText.url = textImageBase + themeImgKeys[_displayIndex] + '.png';
        } else {
          valueText.text = themeLabels[_displayIndex] || themeLabels[0];
        }
      }
    }
  }
  function saveConfig() {
    if (!configLoaded) {
      log('Config not loaded yet, skipping save');
      return;
    }
    var configData = {
      config: {
        autolapse: currentConfig.autolapse,
        autopoop: currentConfig.autopoop,
        autoclose: currentConfig.autoclose,
        autoclose_delay: currentConfig.autoclose_delay,
        music: currentConfig.music,
        jb_behavior: currentConfig.jb_behavior,
        theme: currentConfig.theme
      },
      payloads: userPayloads
    };
    var configContent = JSON.stringify(configData, null, 2);
    fs.write('config.json', configContent, function (err) {
      if (err) {
        log('ERROR: Failed to save config: ' + err.message);
      } else {
        log('Config saved successfully');
      }
    });
  }
  function loadConfig() {
    fs.read('config.json', function (err, data) {
      if (err) {
        log('ERROR: Failed to read config: ' + err.message);
        return;
      }
      try {
        var configData = JSON.parse(data || '{}');
        if (configData.config) {
          var _CONFIG = configData.config;
          currentConfig.autolapse = _CONFIG.autolapse || false;
          currentConfig.autopoop = _CONFIG.autopoop || false;
          currentConfig.autoclose = _CONFIG.autoclose || false;
          currentConfig.autoclose_delay = _CONFIG.autoclose_delay || 0;
          currentConfig.music = _CONFIG.music !== false;
          currentConfig.jb_behavior = _CONFIG.jb_behavior || 0;

          if (_CONFIG.theme && availableThemes.includes(_CONFIG.theme)) {
            currentConfig.theme = _CONFIG.theme;
          } else {
            log('WARNING: Theme "' + (_CONFIG.theme || 'undefined') + '" not found in available themes, using default');
            currentConfig.theme = availableThemes[0] || 'default';
          }

          if (configData.payloads && Array.isArray(configData.payloads)) {
            userPayloads = configData.payloads.slice();
          }
          for (var _i3 = 0; _i3 < configOptions.length; _i3++) {
            updateValueText(_i3);
          }
          if (currentConfig.music) {
            startBgmIfEnabled();
          } else {
            stopBgm();
          }
          configLoaded = true;
          log('Config loaded successfully');
        }
      } catch (e) {
        log('ERROR: Failed to parse config: ' + e.message);
        configLoaded = true;
      }
    });
  }
  function handleButtonPress() {
    if (currentButton < configOptions.length) {
      var option = configOptions[currentButton];
      var key = option.key;
      if (option.type === 'cycle') {
        if (key === 'jb_behavior') {
          currentConfig.jb_behavior = (currentConfig.jb_behavior + 1) % jbBehaviorLabels.length;
          log(key + ' = ' + jbBehaviorLabels[currentConfig.jb_behavior]);
        } else if (key === 'theme') {
          var _themeIndex2 = availableThemes.indexOf(currentConfig.theme);
          var _displayIndex2 = _themeIndex2 >= 0 ? _themeIndex2 : 0;
          var nextIndex = (_displayIndex2 + 1) % availableThemes.length;
          currentConfig.theme = availableThemes[nextIndex];
          log(key + ' = ' + currentConfig.theme);
        }
      } else {
        var boolKey = key;
        currentConfig[boolKey] = !currentConfig[boolKey];
        if (boolKey === 'music') {
          if (typeof CONFIG !== 'undefined') {
            CONFIG.music = currentConfig.music;
          }
          if (currentConfig.music) {
            startBgmIfEnabled();
          } else {
            stopBgm();
          }
        }
        if (key === 'autolapse' && currentConfig.autolapse === true) {
          currentConfig.autopoop = false;
          for (var _i4 = 0; _i4 < configOptions.length; _i4++) {
            if (configOptions[_i4].key === 'autopoop') {
              updateValueText(_i4);
              break;
            }
          }
          log('autopoop disabled (autolapse enabled)');
        } else if (key === 'autopoop' && currentConfig.autopoop === true) {
          currentConfig.autolapse = false;
          for (var _i5 = 0; _i5 < configOptions.length; _i5++) {
            if (configOptions[_i5].key === 'autolapse') {
              updateValueText(_i5);
              break;
            }
          }
          log('autolapse disabled (autopoop enabled)');
        }
        log(key + ' = ' + currentConfig[boolKey]);
      }
      updateValueText(currentButton);
      saveConfig();
    }
  }
  var confirmKey = jsmaf.circleIsAdvanceButton ? 13 : 14;
  var backKey = jsmaf.circleIsAdvanceButton ? 14 : 13;
  jsmaf.onKeyDown = function (keyCode) {
    if (keyCode === 6 || keyCode === 5) {
      currentButton = (currentButton + 1) % buttons.length;
      updateHighlight();
    } else if (keyCode === 4 || keyCode === 7) {
      currentButton = (currentButton - 1 + buttons.length) % buttons.length;
      updateHighlight();
    } else if (keyCode === confirmKey) {
      handleButtonPress();
    } else if (keyCode === backKey) {
      log('Restarting...');
      saveConfig();
      jsmaf.setTimeout(function () {
        debugging.restart();
      }, 100);
    }
  };
  updateHighlight();
  loadConfig();
  
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
  
  log(lang.configLoaded);
})();