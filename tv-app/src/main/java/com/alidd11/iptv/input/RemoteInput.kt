package com.alidd11.iptv.input

import android.view.KeyEvent

enum class RemoteAction {
    UP,
    DOWN,
    LEFT,
    RIGHT,
    SELECT,
    BACK,
    MENU,
    PLAY_PAUSE,
    REWIND,
    FAST_FORWARD,
    CHANNEL_UP,
    CHANNEL_DOWN,
    UNKNOWN,
}

fun remoteActionFor(event: KeyEvent): RemoteAction {
    if (event.action != KeyEvent.ACTION_DOWN) return RemoteAction.UNKNOWN

    return when (event.keyCode) {
        KeyEvent.KEYCODE_DPAD_UP -> RemoteAction.UP
        KeyEvent.KEYCODE_DPAD_DOWN -> RemoteAction.DOWN
        KeyEvent.KEYCODE_DPAD_LEFT -> RemoteAction.LEFT
        KeyEvent.KEYCODE_DPAD_RIGHT -> RemoteAction.RIGHT
        KeyEvent.KEYCODE_DPAD_CENTER,
        KeyEvent.KEYCODE_ENTER,
        KeyEvent.KEYCODE_NUMPAD_ENTER,
        KeyEvent.KEYCODE_BUTTON_A,
        KeyEvent.KEYCODE_BUTTON_SELECT -> RemoteAction.SELECT
        KeyEvent.KEYCODE_BACK,
        KeyEvent.KEYCODE_BUTTON_B -> RemoteAction.BACK
        KeyEvent.KEYCODE_MENU -> RemoteAction.MENU
        KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE,
        KeyEvent.KEYCODE_MEDIA_PLAY,
        KeyEvent.KEYCODE_MEDIA_PAUSE -> RemoteAction.PLAY_PAUSE
        KeyEvent.KEYCODE_MEDIA_REWIND,
        KeyEvent.KEYCODE_BUTTON_L1 -> RemoteAction.REWIND
        KeyEvent.KEYCODE_MEDIA_FAST_FORWARD,
        KeyEvent.KEYCODE_BUTTON_R1 -> RemoteAction.FAST_FORWARD
        KeyEvent.KEYCODE_CHANNEL_UP -> RemoteAction.CHANNEL_UP
        KeyEvent.KEYCODE_CHANNEL_DOWN -> RemoteAction.CHANNEL_DOWN
        else -> RemoteAction.UNKNOWN
    }
}
