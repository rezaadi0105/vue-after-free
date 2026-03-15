(function () {
  if (typeof libc_addr === 'undefined') {
    log('Loading userland.js...');
    include('userland.js');
    log('userland.js loaded');
  } else {
    log('userland.js already loaded (libc_addr defined)');
  }
  log('Loading check-jailbroken.js...');
  include('check-jailbroken.js');
  if (typeof startBgmIfEnabled === 'function') {
    startBgmIfEnabled();
  }
  is_jailbroken = checkJailbroken();
  jsmaf.root.children.length = 0;
  
  new Style({
    name: 'white',
    color: '#FFFF00',
    size: 24
  });
  new Style({
    name: 'title',
    color: '#ff8800',
    size: 48
  });
  new Style({
    name: 'subtitle',
    color: '#FF006E',
    size: 20
  });
  new Style({
    name: 'cyberpunk_accent',
    color: '#FF0000',
    size: 20
  });
  
  var currentButton = 0;
  var buttons = [];
  var buttonTexts = [];
  var buttonMarkers = [];
  var buttonOrigPos = [];
  var textOrigPos = [];
  var fileList = [];
  var normalButtonImg = 'file:///../download0/themes/CYBRPNK277/img/black.png';
  var selectedButtonImg = 'file:///../download0/themes/CYBRPNK277/img/Red.png';
  var background = new Image({
    url: 'file:///../download0/themes/CYBRPNK277/img/Background.png',
    x: 0,
    y: 0,
    width: 1920,
    height: 1080
  });
  jsmaf.root.children.push(background);
  
  var vignetteOverlay = new Image({
    x: 0,
    y: 0,
    width: 1920,
    height: 1080,
    alpha: 0.2
  });
  jsmaf.root.children.push(vignetteOverlay);
  
  var logo = new Image({
    url: 'file:///../download0/themes/CYBRPNK277/img/logo.png',
    x: 1620,
    y: 0,
    width: 300,
    height: 169
  });
  jsmaf.root.children.push(logo);
  
  var logoBorder = new Image({
    x: 1610,
    y: -10,
    width: 320,
    height: 189,
    alpha: 0.4
  });
  logoBorder.borderColor = '#ff8800';
  logoBorder.borderWidth = 2;
  jsmaf.root.children.push(logoBorder);
  
  var titleBox = new Image({
    url: 'file:///../download0/themes/CYBRPNK277/img/options_bg.png',
    x: 747,
    y: 30,
    width: 425,
    height: 110,
    alpha: 0.70
  });
  titleBox.borderColor = '#ff8800';
  titleBox.borderWidth = 3;
  jsmaf.root.children.push(titleBox);
  
  var _title = new jsmaf.Text();
  _title.text = lang.payloadMenu;
  _title.x = 806;
  _title.y = 60;
  _title.style = 'title';
  jsmaf.root.children.push(_title);
  
  var subtitle = new jsmaf.Text();
  subtitle.text = '[ SYSTEM ACCESS GRANTED ]';
  subtitle.x = 806;
  subtitle.y = 115;
  subtitle.style = 'cyberpunk_accent';
  jsmaf.root.children.push(subtitle);
  fn.register(0x05, 'open_sys', ['bigint', 'bigint', 'bigint'], 'bigint');
  fn.register(0x06, 'close_sys', ['bigint'], 'bigint');
  fn.register(0x110, 'getdents', ['bigint', 'bigint', 'bigint'], 'bigint');
  fn.register(0x03, 'read_sys', ['bigint', 'bigint', 'bigint'], 'bigint');
  var scanPaths = ['/download0/payloads'];
  if (is_jailbroken) {
    scanPaths.push('/data/payloads');
    for (var i = 0; i <= 7; i++) {
      scanPaths.push('/mnt/usb' + i + '/payloads');
    }
  }
  log('Scanning paths: ' + scanPaths.join(', '));
  var path_addr = mem.malloc(256);
  var buf = mem.malloc(4096);
  for (var currentPath of scanPaths) {
    log('Scanning ' + currentPath + ' for files...');
    for (var _i = 0; _i < currentPath.length; _i++) {
      mem.view(path_addr).setUint8(_i, currentPath.charCodeAt(_i));
    }
    mem.view(path_addr).setUint8(currentPath.length, 0);
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
          for (var _i2 = 0; _i2 < d_namlen; _i2++) {
            name += String.fromCharCode(mem.view(buf.add(new BigInt(0, offset + 8 + _i2))).getUint8(0));
          }

          if (d_type === 8 && name !== '.' && name !== '..') {
            var lowerName = name.toLowerCase();
            if (lowerName.endsWith('.elf') || lowerName.endsWith('.bin') || lowerName.endsWith('.js')) {
              fileList.push({
                name,
                path: currentPath + '/' + name
              });
              log('Added file: ' + name + ' from ' + currentPath);
            }
          }
          offset += d_reclen;
        }
      }
      fn.close_sys(fd);
    } else {
      log('Failed to open ' + currentPath);
    }
  }
  log('Total files found: ' + fileList.length);
  var startY = 220;
  var startX = 120;
  var tierWidth = 320;
  var tierSpacing = 350;
  var buttonWidth = 280;
  var buttonHeight = 70;
  var maxButtonsPerTier = 8;
  var buttonPadding = 15;
  var maxTiersPerPage = 4;
  var currentPage = 0;
  
  var totalTiers = Math.ceil(fileList.length / maxButtonsPerTier);
  var totalPages = Math.ceil(totalTiers / maxTiersPerPage);
  
  var buttonArrays = {};
  for (var i = 0; i < fileList.length; i++) {
    buttonArrays[i] = null;
  }
  
  function renderPage(pageNum) {
    while (jsmaf.root.children.length > 4) {
      jsmaf.root.children.pop();
    }
    
    var titleBox = new Image({
      url: 'file:///../download0/themes/CYBRPNK277/img/options_bg.png',
      x: 747,
      y: 30,
      width: 425,
      height: 110,
      alpha: 0.70
    });
    titleBox.borderColor = '#ff8800';
    titleBox.borderWidth = 3;
    jsmaf.root.children.push(titleBox);
    
    var _title = new jsmaf.Text();
    _title.text = lang.payloadMenu;
    _title.x = 806;
    _title.y = 60;
    _title.style = 'title';
    jsmaf.root.children.push(_title);
    
    var subtitle = new jsmaf.Text();
    subtitle.text = '[ SYSTEM ACCESS GRANTED ]';
    subtitle.x = 806;
    subtitle.y = 115;
    subtitle.style = 'cyberpunk_accent';
    jsmaf.root.children.push(subtitle);
    

    
  var creditsBox = new Image({
    url: 'file:///../download0/themes/CYBRPNK277/img/black.png',
    x: 1500,
    y: 220,
    width: 400,
    height: 450,
    alpha: 0.5
    });
    creditsBox.borderColor = '#ff8800';
    creditsBox.borderWidth = 2;
    jsmaf.root.children.push(creditsBox);
    
  var creditText = new jsmaf.Text();
  creditText.text = '[ CREDITS ]';
  creditText.x = 1520;
  creditText.y = 250;
  creditText.style = 'title';
  jsmaf.root.children.push(creditText);
  
  var creditLine1 = new jsmaf.Text();
  creditLine1.text = 'Theme By:';
  creditLine1.x = 1520;
  creditLine1.y = 325;
  creditLine1.style = 'white';
  jsmaf.root.children.push(creditLine1);
  
  var creditLine2 = new jsmaf.Text();
  creditLine2.text = 'MightyMac25';
  creditLine2.x = 1520;
  creditLine2.y = 345;
  creditLine2.style = 'white';
  jsmaf.root.children.push(creditLine2);
  
  var creditLine3 = new jsmaf.Text();
  creditLine3.text = '━━━━━━━━━━━━━━━';
  creditLine3.x = 1520;
  creditLine3.y = 360;
  creditLine3.style = 'cyberpunk_accent';
  jsmaf.root.children.push(creditLine3);

  var creditLine3 = new jsmaf.Text();
  creditLine3.text = '━━━━━━━━━━━━━━━';
  creditLine3.x = 1520;
  creditLine3.y = 380;
  creditLine3.style = 'cyberpunk_accent';
  jsmaf.root.children.push(creditLine3);
  var creditLine4 = new jsmaf.Text();
  creditLine4.text = '>Vue after free team';
  creditLine4.x = 1520;
  creditLine4.y = 400;
  creditLine4.style = 'white';
  jsmaf.root.children.push(creditLine4);
  
  var creditLine5 = new jsmaf.Text();
  creditLine5.text = 'c0w-ar';
  creditLine5.x = 1520;
  creditLine5.y = 425;
  creditLine5.style = 'white';
  jsmaf.root.children.push(creditLine5);
  
  var creditLine6 = new jsmaf.Text();
  creditLine6.text = 'earthonion';
  creditLine6.x = 1520;
  creditLine6.y = 450;
  creditLine6.style = 'white';
  jsmaf.root.children.push(creditLine6);
  
  var creditLine7 = new jsmaf.Text();
  creditLine7.text = 'ufm-42';
  creditLine7.x = 1520;
  creditLine7.y = 475;
  creditLine7.style = 'white';
  jsmaf.root.children.push(creditLine7);
  
  var creditLine8 = new jsmaf.Text();
  creditLine8.text = 'D-link Turtle';
  creditLine8.x = 1520;
  creditLine8.y = 500;
  creditLine8.style = 'white';
  jsmaf.root.children.push(creditLine8);

  var creditLine8 = new jsmaf.Text();
  creditLine8.text = 'Genzine and more!';
  creditLine8.x = 1520;
  creditLine8.y = 525;
  creditLine8.style = 'white';
  jsmaf.root.children.push(creditLine8);
  
  var warningBox = new Image({
    url: 'file:///assets/img/button_over_9.png',
    x: 1500,
    y: 680,
    width: 400,
    height: 100,
    alpha: 0.3
  });
  warningBox.borderColor = '#FF0000';
  warningBox.borderWidth = 3;
  jsmaf.root.children.push(warningBox);
  
  var warningTitle = new jsmaf.Text();
  warningTitle.text = '⚠ WARNING';
  warningTitle.x = 1520;
  warningTitle.y = 695;
  warningTitle.style = 'cyberpunk_accent';
  jsmaf.root.children.push(warningTitle);
  
  var warningText = new jsmaf.Text();
  warningText.text = 'Restart required after';
  warningText.x = 1520;
  warningText.y = 720;
  warningText.style = 'white';
  jsmaf.root.children.push(warningText);
  
  var warningText2 = new jsmaf.Text();
  warningText2.text = 'loading an option';
  warningText2.x = 1520;
  warningText2.y = 745;
  warningText2.style = 'white';
  jsmaf.root.children.push(warningText2);
    
    var pageStartTier = pageNum * maxTiersPerPage;
    var pageEndTier = Math.min(pageStartTier + maxTiersPerPage, totalTiers);
    
    for (var tierIdx = pageStartTier; tierIdx < pageEndTier; tierIdx++) {
      var displayTierIdx = tierIdx - pageStartTier;
      var tierBoxX = startX - buttonPadding + displayTierIdx * tierSpacing;
      var tierBoxY = startY - buttonPadding;
      var tierBoxHeight = (maxButtonsPerTier * 85) + (buttonPadding * 2);
      
      var tierBgImage = new Image({
        url: 'file:///../download0/themes/CYBRPNK277/img/options_bg.png',
        x: tierBoxX,
        y: tierBoxY,
        width: tierWidth,
        height: tierBoxHeight,
        alpha: 0.45
      });
      jsmaf.root.children.push(tierBgImage);
      
      var tierBox = new Image({
        x: tierBoxX,
        y: tierBoxY,
        width: tierWidth,
        height: tierBoxHeight,
        alpha: 0.2
      });
      tierBox.borderColor = '#ff8800';
      tierBox.borderWidth = 2;
      jsmaf.root.children.push(tierBox);
    }
    
    for (var _i3 = 0; _i3 < fileList.length; _i3++) {
      var tier = Math.floor(_i3 / maxButtonsPerTier);
      var indexInTier = _i3 % maxButtonsPerTier;
      
      if (tier < pageStartTier || tier >= pageEndTier) continue;
      
      var displayName = fileList[_i3].name;
      var displayTier = tier - pageStartTier;
      var btnX = startX + displayTier * tierSpacing;
      var btnY = startY + indexInTier * 85;
      var button = new Image({
        url: normalButtonImg,
        x: btnX,
        y: btnY,
        width: buttonWidth,
        height: buttonHeight
      });
      buttons[_i3] = button;
      buttonArrays[_i3] = button;
      jsmaf.root.children.push(button);
      
      if (displayName.length > 30) {
        displayName = displayName.substring(0, 27) + '...';
      }
      var text = new jsmaf.Text();
      text.text = displayName;
      text.x = btnX + 20;
      text.y = btnY + 30;
      text.style = 'white';
      buttonTexts[_i3] = text;
      jsmaf.root.children.push(text);
      buttonOrigPos[_i3] = {
        x: btnX,
        y: btnY
      };
      textOrigPos[_i3] = {
        x: text.x,
        y: text.y
      };
    }
    
    if (totalPages > 1) {
      var pageIndicator = new jsmaf.Text();
      pageIndicator.text = 'PAGE ' + (pageNum + 1) + ' / ' + totalPages;
      pageIndicator.x = 900;
      pageIndicator.y = 1000;
      pageIndicator.style = 'white';
      jsmaf.root.children.push(pageIndicator);
      
      var navHint = new jsmaf.Text();
      navHint.text = '[ L1/L2 ] to switch pages';
      navHint.x = 760;
      navHint.y = 1030;
      navHint.style = 'subtitle';
      jsmaf.root.children.push(navHint);
    }
  }
  
  renderPage(0);
  var backHint = new jsmaf.Text();
  backHint.text = jsmaf.circleIsAdvanceButton ? '[ X ] to go back' : '[ O ] to go back';
  backHint.x = 850;
  backHint.y = 1000;
  backHint.style = 'white';
  jsmaf.root.children.push(backHint);
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
      prevButtonObj.alpha = 0.4;
      prevButtonObj.borderColor = 'transparent';
      prevButtonObj.borderWidth = 0;
      animateZoomOut(prevButtonObj, buttonTexts[prevButton], buttonOrigPos[prevButton].x, buttonOrigPos[prevButton].y, textOrigPos[prevButton].x, textOrigPos[prevButton].y);
    }

    for (var _i4 = 0; _i4 < buttons.length; _i4++) {
      var _button = buttons[_i4];
      var buttonText = buttonTexts[_i4];
      var buttonOrigPos_ = buttonOrigPos[_i4];
      var textOrigPos_ = textOrigPos[_i4];
      if (_button === undefined || buttonText === undefined || buttonOrigPos_ === undefined || textOrigPos_ === undefined) continue;
      if (_i4 === currentButton) {
        _button.url = selectedButtonImg;
        _button.alpha = 1.0;
        _button.borderColor = '#ff8800';
        _button.borderWidth = 4;
        animateZoomIn(_button, buttonText, buttonOrigPos_.x, buttonOrigPos_.y, textOrigPos_.x, textOrigPos_.y);
      } else if (_i4 !== prevButton) {
        _button.url = normalButtonImg;
        _button.alpha = 0.4;
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
  var confirmKey = jsmaf.circleIsAdvanceButton ? 13 : 14;
  var backKey = jsmaf.circleIsAdvanceButton ? 14 : 13;
  jsmaf.onKeyDown = function (keyCode) {
    log('Key pressed: ' + keyCode);
    var fileButtonCount = fileList.length;
    var currentTier = Math.floor(currentButton / maxButtonsPerTier);
    var indexInTier = currentButton % maxButtonsPerTier;
    var pageStartTier = currentPage * maxTiersPerPage;
    var pageEndTier = Math.min(pageStartTier + maxTiersPerPage, totalTiers);
    
    if (keyCode === 11) {
      if (currentPage > 0) {
        currentPage--;
        currentButton = Math.floor((pageStartTier - maxTiersPerPage) * maxButtonsPerTier);
        if (currentButton >= fileButtonCount) {
          currentButton = fileButtonCount - 1;
        }
        renderPage(currentPage);
        updateHighlight();
      }
    } else if (keyCode === 12) {
      if (currentPage < totalPages - 1) {
        currentPage++;
        currentButton = Math.floor(pageEndTier * maxButtonsPerTier);
        if (currentButton >= fileButtonCount) {
          currentButton = fileButtonCount - 1;
        }
        renderPage(currentPage);
        updateHighlight();
      }
    }
    else if (keyCode === 5) {
      var nextTierIndex = currentButton + maxButtonsPerTier;
      if (nextTierIndex < fileButtonCount) {
        currentButton = nextTierIndex;
      }
      updateHighlight();
    } else if (keyCode === 7) {
      var prevTierIndex = currentButton - maxButtonsPerTier;
      if (prevTierIndex >= 0) {
        currentButton = prevTierIndex;
      }
      updateHighlight();
    } 
    else if (keyCode === 6) {
      var nextInTier = currentButton + 1;
      var nextTierCheck = Math.floor(nextInTier / maxButtonsPerTier);
      if (nextInTier < fileButtonCount && nextTierCheck === currentTier) {
        currentButton = nextInTier;
      }
      updateHighlight();
    } else if (keyCode === 4) {
      var prevInTier = currentButton - 1;
      var prevTierCheck = Math.floor(prevInTier / maxButtonsPerTier);
      if (prevInTier >= 0 && prevTierCheck === currentTier) {
        currentButton = prevInTier;
      }
      updateHighlight();
    } else if (keyCode === confirmKey) {
      handleButtonPress();
    } else if (keyCode === backKey) {
      log('Going back to main menu...');
      try {
        include('themes/' + (typeof CONFIG !== 'undefined' && CONFIG.theme ? CONFIG.theme : 'default') + '/main.js');
      } catch (e) {
        var err = e;
        log('ERROR loading main.js: ' + err.message);
        if (err.stack) log(err.stack);
      }
    }
  };
  function handleButtonPress() {
    if (currentButton < fileList.length) {
      var selectedEntry = fileList[currentButton];
      if (!selectedEntry) {
        log('No file selected!');
        return;
      }
      var filePath = selectedEntry.path;
      var fileName = selectedEntry.name;
      log('Selected: ' + fileName + ' from ' + filePath);
      try {
        if (fileName.toLowerCase().endsWith('.js')) {
          if (filePath.startsWith('/download0/')) {
            log('Including JavaScript file: ' + fileName);
            include('payloads/' + fileName);
          } else {
            log('Reading external JavaScript file: ' + filePath);
            var p_addr = mem.malloc(256);
            for (var _i5 = 0; _i5 < filePath.length; _i5++) {
              mem.view(p_addr).setUint8(_i5, filePath.charCodeAt(_i5));
            }
            mem.view(p_addr).setUint8(filePath.length, 0);
            var _fd = fn.open_sys(p_addr, new BigInt(0, 0), new BigInt(0, 0));
            if (!_fd.eq(new BigInt(0xffffffff, 0xffffffff))) {
              var buf_size = 1024 * 1024 * 1; // 1 MiB
              var _buf = mem.malloc(buf_size);
              var read_len = fn.read_sys(_fd, _buf, new BigInt(0, buf_size));
              fn.close_sys(_fd);
              var scriptContent = '';
              var len = read_len instanceof BigInt ? read_len.lo : read_len;
              log('File read size: ' + len + ' bytes');
              for (var _i6 = 0; _i6 < len; _i6++) {
                scriptContent += String.fromCharCode(mem.view(_buf).getUint8(_i6));
              }
              log('Executing via eval()...');
              eval(scriptContent);
            } else {
              log('ERROR: Could not open file for reading!');
            }
          }
        } else {
          log('Loading binloader.js...');
          include('binloader.js');
          log('binloader.js loaded successfully');
          log('Initializing binloader...');
          var {
            bl_load_from_file
          } = binloader_init();
          log('Loading payload from: ' + filePath);
          bl_load_from_file(filePath);
        }
      } catch (e) {
        var err = e;
        log('ERROR: ' + err.message);
        if (err.stack) log(err.stack);
      }
    }
  }
  updateHighlight();
  log('Interactive UI loaded!');
  log('Total elements: ' + jsmaf.root.children.length);
  log('Buttons: ' + buttons.length);
  log('Use arrow keys to navigate, Enter/X to select');
})();