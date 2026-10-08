package com.alidd11.iptv.core

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.net.Uri

/** Chooses the same authorised channel source for Android phone and TV. */
object ChannelPlayback {
    fun open(context: Context, catalog: TvCatalog, channelId: String): Boolean {
        val source = catalog.sourceFor(channelId) ?: return false
        return try {
            when {
                source.playbackMode == "native" && source.type == "hls" &&
                    source.authorization in setOf("verified-official", "verified-public-authorized") -> {
                    context.startActivity(Intent(context, LivePlayerActivity::class.java)
                        .putExtra(LivePlayerActivity.EXTRA_CHANNEL_ID, channelId))
                    true
                }
                source.playbackMode in setOf("external", "handoff") -> {
                    context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(source.url)))
                    true
                }
                else -> false
            }
        } catch (_: ActivityNotFoundException) {
            false
        } catch (_: SecurityException) {
            false
        }
    }
}
