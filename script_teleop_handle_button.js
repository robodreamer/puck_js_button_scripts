var kb = require("ble_hid_keyboard");
NRF.setServices(undefined, { hid : kb.report });

var resetTimer = null;
var clickTimer = null;
var inactivityTimer = null;
var clickCount = 0;
var activeLight = null;
var isLED2On = false;  // Variable to track the state of LED2
var led_duration = 500;
var inactivityDuration = 3 * 60 * 1000; // 3 minutes in milliseconds
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
                // Single click
                if (doubleClickState) {
                    // Send 'G' key input and blink LED1
                    NRF.sendHIDReport([0, 0, kb.KEY.G, 44, 0, 0, 0, 0], function() {
                        btnPressed(44);
                    });
                } else {
                    // Send 'G' key input and blink LED1
                    NRF.sendHIDReport([0, 0, kb.KEY.G, 0, 0, 0, 0, 0], function() {
                        btnReleased(); // Release 'G' after pressing
                    });
                }
                setLight(LED1, led_duration);  // Blink LED1 for single click
                break;
            case 2:
                // Double click, toggle state and send 'SPACE' or release depending on the state
                if (doubleClickState) {
                    btnReleased();  // Release SPACE key
                    LED2.reset();   // Turn off LED2
                } else {
                    btnPressed(44);  // Send SPACE key press
                    LED2.set();  // Turn on LED2
                }
                doubleClickState = !doubleClickState;
                break;
        }
        clickCount = 0;  // Reset click count after handling
        resetInactivityTimer();  // Reset inactivity timer on any click
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
  // Send the key press
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

function resetInactivityTimer() {
    if (inactivityTimer !== null) {
        clearTimeout(inactivityTimer);
    }
    inactivityTimer = setTimeout(function() {
        // Reset state and turn off LEDs after inactivityDuration
        if (doubleClickState) {
            btnReleased();  // Release SPACE key if active
            LED2.reset();   // Turn off LED2 if active
        }
        doubleClickState = false;  // Reset double click state
        isLED2On = false;
        LED1.reset();
        LED2.reset();
        LED3.reset();
    }, inactivityDuration);
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

// Start the inactivity timer when the script initializes
resetInactivityTimer();
