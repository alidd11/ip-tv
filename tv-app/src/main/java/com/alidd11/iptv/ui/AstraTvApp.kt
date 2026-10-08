package com.alidd11.iptv.ui

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.tv.material3.Text
import com.alidd11.iptv.core.TvCatalogRepository
import com.alidd11.iptv.core.TvChannel
import com.alidd11.iptv.core.ChannelPlayback
import com.alidd11.iptv.ui.components.ChannelCard
import com.alidd11.iptv.ui.components.FocusButton
import com.alidd11.iptv.ui.theme.AstraAccent
import com.alidd11.iptv.ui.theme.AstraBlack
import com.alidd11.iptv.ui.theme.AstraMuted
import com.alidd11.iptv.ui.theme.AstraText

@Composable
fun AstraTvApp() {
    var explore by remember { mutableStateOf(false) }
    if (explore) {
        WorldExploreTv(onClose = { explore = false })
        return
    }
    val context = LocalContext.current
    val catalog = remember { TvCatalogRepository(context).load() }
    var country by remember { mutableStateOf("GB") }
    val channels = catalog.channelsFor(country)
    val hero = catalog.featuredFor(country)
    val heroSource = hero?.let { catalog.sourceFor(it.id) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(AstraBlack),
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(360.dp)
                .background(
                    Brush.horizontalGradient(
                        listOf(Color(0xFF201B45), Color(0xFF10131D), AstraBlack),
                    ),
                )
                .padding(horizontal = 56.dp, vertical = 44.dp),
        ) {
            Column(modifier = Modifier.fillMaxWidth(0.6f)) {
                Text(
                    text = if (heroSource?.playbackMode == "native") "LIVE TV · OFFICIAL STREAM"
                    else if (heroSource?.playbackMode == "external") "OFFICIAL VIEWING OPTION"
                    else if (heroSource?.playbackMode == "handoff") "SUBSCRIPTION NETWORK"
                    else "CHANNEL DIRECTORY",
                    color = AstraAccent,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 2.sp,
                )
                Spacer(Modifier.height(10.dp))
                Text(
                    text = hero?.name ?: "Live television, beautifully organised.",
                    color = AstraText,
                    fontSize = 50.sp,
                    lineHeight = 54.sp,
                    fontWeight = FontWeight.Black,
                )
                Spacer(Modifier.height(12.dp))
                Text(
                    text = hero?.network ?: "Fast channels, premium guide and elegant playback.",
                    color = AstraMuted,
                    fontSize = 17.sp,
                )
                Spacer(Modifier.height(24.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                    FocusButton(
                        label = hero?.let { catalog.sourceLabel(it.id) } ?: "Explore channels",
                        primary = true,
                        onClick = {
                            if (heroSource == null) explore = true
                            else hero?.let { ChannelPlayback.open(context, catalog, it.id) }
                        },
                    )
                    FocusButton(label = "Explore worldwide", onClick = { explore = true })
                }
            }
        }

        Row(
            modifier = Modifier.padding(horizontal = 56.dp, vertical = 22.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            catalog.countries.forEach { item ->
                FocusButton(
                    label = item.flag + " " + item.name,
                    primary = item.code == country,
                    onClick = { country = item.code },
                )
            }
        }

        Text(
            text = "Channels with viewing options",
            color = AstraText,
            fontSize = 30.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 56.dp),
        )

        Spacer(Modifier.height(16.dp))

        LazyRow(
            contentPadding = PaddingValues(horizontal = 56.dp),
            horizontalArrangement = Arrangement.spacedBy(18.dp),
        ) {
            items(channels.filter { catalog.sourceFor(it.id) != null }, key = TvChannel::id) { channel ->
                ChannelCard(
                    channel = channel,
                    onClick = {
                        ChannelPlayback.open(context, catalog, channel.id)
                    },
                )
            }
        }
    }
}
