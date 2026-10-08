package com.alidd11.iptv.core

import android.graphics.Color
import android.os.Bundle
import android.view.Gravity
import android.view.KeyEvent
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.TextView
import androidx.activity.ComponentActivity
import androidx.media3.common.MediaItem
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView

/**
 * Shared Android mobile + Android TV/Fire TV playback surface.
 * Only opens enabled, approved native HLS sources re-resolved from the catalogue.
 */
class LivePlayerActivity : ComponentActivity() {
    companion object {
        const val EXTRA_CHANNEL_ID = "com.alidd11.iptv.CHANNEL_ID"
    }

    private lateinit var videoView: PlayerView
    private lateinit var errorView: TextView
    private var player: ExoPlayer? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        val frame = FrameLayout(this).apply {
            setBackgroundColor(Color.BLACK)
        }
        videoView = PlayerView(this).apply {
            useController = true
            controllerAutoShow = true
            controllerShowTimeoutMs = 5000
            isFocusable = true
            isFocusableInTouchMode = true
        }
        frame.addView(videoView, FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ))
        errorView = TextView(this).apply {
            setTextColor(Color.WHITE)
            textSize = 18f
            gravity = Gravity.CENTER
            setPadding(32, 24, 32, 24)
            setBackgroundColor(Color.rgb(18, 20, 28))
            visibility = View.GONE
        }
        frame.addView(errorView, FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT,
            Gravity.CENTER
        ))
        setContentView(frame)
    }

    override fun onStart() {
        super.onStart()
        val id = intent?.getStringExtra(EXTRA_CHANNEL_ID).orEmpty()
        val source = TvCatalogRepository(this).load().sourceFor(id)
        if (source == null || source.playbackMode != "native" || source.type != "hls" ||
            source.authorization !in setOf("verified-official", "verified-public-authorized")) {
            displayError("No approved in-app stream is available for this channel.")
            return
        }
        errorView.visibility = View.GONE
        val exo = ExoPlayer.Builder(this).build()
        player = exo
        videoView.player = exo
        exo.addListener(object : Player.Listener {
            override fun onPlayerError(error: PlaybackException) {
                displayError("Playback is unavailable. Check your connection or try again later.")
            }
        })
        exo.setMediaItem(MediaItem.fromUri(source.url))
        exo.prepare()
        exo.playWhenReady = true
        videoView.requestFocus()
    }

    private fun displayError(message: String) {
        errorView.text = message
        errorView.visibility = View.VISIBLE
    }

    override fun dispatchKeyEvent(event: KeyEvent): Boolean {
        if (event.action == KeyEvent.ACTION_DOWN) {
            val playback = player
            if (playback != null) {
                when (event.keyCode) {
                    KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE -> {
                        if (playback.isPlaying) playback.pause() else playback.play()
                        return true
                    }
                    KeyEvent.KEYCODE_MEDIA_PLAY -> {
                        playback.play()
                        return true
                    }
                    KeyEvent.KEYCODE_MEDIA_PAUSE -> {
                        playback.pause()
                        return true
                    }
                    KeyEvent.KEYCODE_MEDIA_REWIND -> {
                        if (playback.isCurrentMediaItemSeekable) {
                            playback.seekTo((playback.currentPosition - 10000L).coerceAtLeast(0))
                        }
                        return true
                    }
                    KeyEvent.KEYCODE_MEDIA_FAST_FORWARD -> {
                        if (playback.isCurrentMediaItemSeekable) {
                            playback.seekTo(playback.currentPosition + 10000L)
                        }
                        return true
                    }
                }
            }
        }
        // D-pad and Back remain owned by PlayerView/system, including HDMI-CEC passthrough.
        return super.dispatchKeyEvent(event)
    }

    override fun onStop() {
        videoView.player = null
        player?.release()
        player = null
        super.onStop()
    }

    override fun onDestroy() {
        window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        super.onDestroy()
    }
}
