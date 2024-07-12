//8-key function-key keyboard May 15 20204

var kb = require("ble_hid_keyboard");
NRF.setServices(undefined, { hid : kb.report });

var holdingKeys = new Uint8Array(5);

function insertPressedKey(k) {
  // Fill empty spots first  
  for (var j = 0; j < holdingKeys.length; j++) {
    if (holdingKeys[j] == k) return;
    if (holdingKeys[j] == 0) {
      holdingKeys[j] = k;
      return;
    }
  }
  // Otherwise FIFO key replace. (> 5 keys are used!)
  for (j = 0; j < holdingKeys.length - 1; j++)
    holdingKeys[j] = holdingKeys[j + 1];
  holdingKeys[holdingKeys.length - 1] = k;
}

function removePressedKey(k) {
  if (k == -1) {
    holdingKeys.fill(0);
    return;
  }
  for (var j = 0; j < holdingKeys.length; j++) {
    if (holdingKeys[j] == k) holdingKeys[j] = 0;
  }
}

/*
function btnPressed() {
  // Send 'a'
//  kb.tap(kb.KEY.A, 0);
  NRF.sendHIDReport([0,0,kb.KEY.A,0,0,0,0]);
}

function btnReleased() {
  // Send 'a'
//  kb.tap(kb.KEY.B, 0);
  NRF.sendHIDReport([0,0,0,0,0,0,0,0]);
}
*/
function scanAndSend(data) {
  
  if(digitalRead(BTN1)) {
    insertPressedKey(kb.KEY.H);
  } else {
    removePressedKey(kb.KEY.H);
  }
  
  if(digitalRead(D1)) {
    insertPressedKey(kb.KEY.G);
  } else {
    removePressedKey(kb.KEY.G);
  }
  if(digitalRead(D2)) {
    insertPressedKey(kb.KEY.F);
  } else {
    removePressedKey(kb.KEY.F);
  }
  if(digitalRead(D28)) {
    insertPressedKey(kb.KEY.E);
  } else {
    removePressedKey(kb.KEY.E);
  }
  if(digitalRead(D29)) {
    insertPressedKey(kb.KEY.D);
  } else {
    removePressedKey(kb.KEY.D);
  }
  if(digitalRead(D30)) {
    insertPressedKey(kb.KEY.C);
  } else {
    removePressedKey(kb.KEY.C);
  }
  if(digitalRead(D31)) {
    insertPressedKey(kb.KEY.B);
  } else {
    removePressedKey(kb.KEY.B);
  }
  if(digitalRead(D24)) {
    insertPressedKey(kb.KEY.A);
  } else {
    removePressedKey(kb.KEY.A);
  }
  
  NRF.sendHIDReport([0,0, 0,holdingKeys[0], holdingKeys[1], holdingKeys[2], holdingKeys[3], holdingKeys[4]]);
}

pinMode(BTN1, "input_pulldown");
pinMode(D1, "input_pulldown");
pinMode(D2, "input_pulldown");
pinMode(D28, "input_pulldown");
pinMode(D29, "input_pulldown");
pinMode(D30, "input_pulldown");
pinMode(D31, "input_pulldown");
pinMode(D24, "input_pulldown");

// trigger btnPressed whenever the button is pressed
setWatch(scanAndSend, BTN1, {edge:"both",repeat:true,debounce:50});
setWatch(scanAndSend, D1, {edge:"both",repeat:true,debounce:50});
setWatch(scanAndSend, D2, {edge:"both",repeat:true,debounce:50});
setWatch(scanAndSend, D28, {edge:"both",repeat:true,debounce:50});
setWatch(scanAndSend, D29, {edge:"both",repeat:true,debounce:50});
setWatch(scanAndSend, D30, {edge:"both",repeat:true,debounce:50});
setWatch(scanAndSend, D31, {edge:"both",repeat:true,debounce:50});
setWatch(scanAndSend, D24, {edge:"both",repeat:true,debounce:50});


// Add 'appearance' to advertising for Windows 11
NRF.setAdvertising([
  {}, // include original Advertising packet
  [   // second packet containing 'appearance'
    2, 1, 6,  // standard Bluetooth flags
    3,3,0x12,0x18, // HID Service
    3,0x19,0xc1,0x03 // Appearance: Keyboard
        // 0xc2,0x03 : 0x03C2 Mouse
        // 0xc3,0x03 : 0x03C3 Joystick
  ]
])