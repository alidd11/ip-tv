package com.alidd11.iptv.core

import android.graphics.Color
import android.os.Bundle
import android.view.Gravity
import android.view.KeyEvent
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.Button
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import androidx.activity.ComponentActivity
import androidx.media3.common.MediaItem
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView

/** Full-screen player shared by Android touch and TV remote clients. */
class LivePlayerActivity : ComponentActivity() {
    companion object {
        const val EXTRA_CHANNEL_ID = "com.alidd11.iptv.CHANNEL_ID"
    }

    private lateinit var catalogue: TvCatalog
    private lateinit var queue: List<TvChannel>
    private lateinit var video: PlayerView
    private lateinit var errorText: TextView
    private lateinit var channelTitle: TextView
    private lateinit var channelCount: TextView
    private lateinit var previous: Button
    private lateinit var next: Button
    private var selected = -1
    private var playback: ExoPlayer? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN)
        catalogue = TvCatalogRepository(this).load()
        val channelId = intent?.getStringExtra(EXTRA_CHANNEL_ID).orEmpty()
        queue = catalogue.nativeChannelQueue(channelId)
        selected = queue.indexOfFirst { it.id == channelId }

        val frame = FrameLayout(this).apply { setBackgroundColor(Color.BLACK) }
        video = PlayerView(this).apply {
            useController = true
            controllerAutoShow = true
            controllerShowTimeoutMs = 4500
            isFocusable = true
            isFocusableInTouchMode = true
            contentDescription = "IP TV live player"
        }
        frame.addView(video, FrameLayout.LayoutParams(-1, -1))
        val header = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(24, 18, 24, 18)
            setBackgroundColor(Color.argb(205, 13, 16, 26))
        }
        channelTitle = TextView(this).apply {
            setTextColor(Color.WHITE)
            textSize = 20f
            setSingleLine(true)
            ellipsize = android.text.TextUtils.TruncateAt.END
        }
        channelCount = TextView(this).apply {
            setTextColor(Color.rgb(184, 181, 230))
            textSize = 13f
        }
        header.addView(channelTitle)
        header.addView(channelCount)
        frame.addView(header, FrameLayout.LayoutParams(-1, -2, Gravity.TOP))
        val footer = LinearLayout(this).apply {
            gravity = Gravity.CENTER
            orientation = LinearLayout.HORIZONTAL
            setPadding(16, 12, 16, 12)
            setBackgroundColor(Color.argb(205, 13, 16, 26))
        }
        previous = Button(this).apply {
            text = "◀ Previous"
            contentDescription = "Previous playable channel"
            setOnClickListener { changeChannel(-1) }
        }
        next = Button(this).apply {
            text = "Next ▶"
            contentDescription = "Next playable channel"
            setOnClickListener { changeChannel(1) }
        }
        footer.addView(previous)
        footer.addView(next)
        frame.addView(footer, FrameLayout.LayoutParams(-1, -2, Gravity.BOTTOM))
        errorText = TextView(this).apply {
            setTextColor(Color.WHITE)
            textSize = 18f
            gravity = Gravity.CENTER
            setPadding(32, 24, 32, 24)
            setBackgroundColor(Color.rgb(18, 20, 28))
            visibility = View.GONE
        }
        frame.addView(errorText, FrameLayout.LayoutParams(-1, -2, Gravity.CENTER))
        setContentView(frame)
        updateHeader()
    }

    override fun onStart() {
        super.onStart()
        if (selected < 0) {
            showError("No approved in-app stream is available for this channel.")
            return
        }
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        playback = ExoPlayer.Builder(this).build().also { exo ->
            video.player = exo
            exo.addListener(object : Player.Listener {
                override fun onPlayerError(error: PlaybackException) {
                    showError("Unable to play this channel. Try another one.")
                }
            })
        }
        playSelected()
        video.requestFocus()
    }

    private fun updateHeader() {
        channelTitle.text = if (selected >= 0) queue[selected].name else "IP TV"
        channelCount.text = if (selected >= 0) {
            (selected + 1).toString() + " / " + queue.size + " · Live"
        } else "No approved live stream"
        previous.isEnabled = queue.size > 1
        next.isEnabled = queue.size > 1
    }

    private fun changeChannel(direction: Int) {
        if (queue.size <= 1 || selected < 0) return
        selected = (selected + direction + queue.size) % queue.size
        playSelected()
    }

    private fun playSelected() {
        if (selected !in queue.indices) return
        updateHeader()
        val source = catalogue.nativeHlsSourceFor(queue[selected].id)
        if (source == null) {
            showError("No approved stream for this channel.")
            return
        }
        errorText.visibility = View.GONE
        playback?.apply {
            stop()
            clearMediaItems()
            setMediaItem(MediaItem.fromUri(source.url))
            prepare()
            playWhenReady = true
        }
    }

    private fun showError(message: String) {
        errorText.text = message
        errorText.visibility = View.VISIBLE
    }

    override fun dispatchKeyEvent(event: KeyEvent): Boolean {
        if (event.action == KeyEvent.ACTION_DOWN && event.repeatCount == 0) {
            when (event.keyCode) {
                KeyEvent.KEYCODE_CHANNEL_UP -> { changeChannel(1); return true }
                KeyEvent.KEYCODE_CHANNEL_DOWN -> { changeChannel(-1); return true }
            }
            val current = playback
            if (current != null) {
                when (event.keyCode) {
                    KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE -> {
                        if (current.isPlaying) current.pause() else current.play()
                        return true
                    }
                    KeyEvent.KEYCODE_MEDIA_PLAY -> { current.play(); return true }
                    KeyEvent.KEYCODE_MEDIA_PAUSE -> { current.pause(); return true }
                    KeyEvent.KEYCODE_MEDIA_REWIND -> {
                        if (current.isCurrentMediaItemSeekable)
                            current.seekTo((current.currentPosition - 10000L).coerceAtLeast(0))
                        return true
                    }
                    KeyEvent.KEYCODE_MEDIA_FAST_FORWARD -> {
                        if (current.isCurrentMediaItemSeekable)
                            current.seekTo(current.currentPosition + 10000L)
                        return true
                    }
                }
            }
        }
        return super.dispatchKeyEvent(event)
    }

    override fun onStop() {
        video.player = null
        playback?.release()
        playback = null
        window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        super.onStop()
    }

    override fun onDestroy() {
        window.clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN)
        super.onDestroy()
    }
}
