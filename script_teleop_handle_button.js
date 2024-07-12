var kb = require("ble_hid_keyboard");
NRF.setServices(undefined, { hid : kb.report });

var resetTimer = null;
var clickTimer = null;
var clickCount = 0;
var activeLight = null;
var isLED2On = false;  // Variable to track the state of LED2
var led_duration = 500;
var doubleClickState = false;  // Track the state of double-click actions


setWatch(function() {
    if (clickTimer !== null) {
        clearTimeout(clickTimer);
        clickTimer = null;
    }

    clickCount += 1;

    clickTimer = setTimeout(function() {
        clickTimer = null;
        switch (clickCount) {
            case 1:
                // Single click, output 'a' and toggle red or blue LED based on LED2's state
                NRF.sendHIDReport([0, 0, kb.KEY.G, 0, 0, 0, 0, 0], function() {
                    btnReleased(); // Release 'a' after pressing
                });
                handleLEDForSingleClick();
                break;
            case 2:
                // Double click, toggle state and send 'SPACE' or release depending on the state
                if (doubleClickState) {
                    btnReleased();             
                } else {                    
                    btnPressed(kb.KEY.B);
                }
                doubleClickState = !doubleClickState;
                toggleLED2();
                break;
        }
        clickCount = 0;  // Reset click count after handling
    }, 400);  // Time to determine click count
}, BTN, { edge: "falling", debounce: 50, repeat: true });

function setLight(light, duration) {
    if (activeLight !== null) {
        activeLight.reset();
    }
    light.set();
    activeLight = light;

    if (resetTimer !== null) {
        clearTimeout(resetTimer);
        resetTimer = null;
    }

    resetTimer = setTimeout(function() {
        activeLight.reset();
    }, duration);  // Use the specified duration
}

function btnPressed(key) {
  // Send 'a'
  //  kb.tap(kb.KEY.A, 0);
  NRF.sendHIDReport([0,0,key,0,0,0,0]);
}

function btnReleased() {
  // Release the key
  NRF.sendHIDReport([0, 0, 0, 0, 0, 0, 0, 0]);
}

function toggleLED2() {
    if (isLED2On) {
        turnOffLED2();
    } else {
        LED2.set();
        isLED2On = true;
    }
}

function turnOffLED2() {
    LED2.reset();
    isLED2On = false;
}

function handleLEDForSingleClick() {
    if (isLED2On) {
        setLight(LED3, led_duration);  // Blue LED if LED2 is on
    } else {
        setLight(LED1, led_duration);  // Red LED if LED2 is off
    }
}

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
]);
