package com.alidd11.iptv.mobile

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.alidd11.iptv.core.TvCatalog
import com.alidd11.iptv.core.TvCatalogRepository
import com.alidd11.iptv.core.TvChannel

private val Canvas = Color(0xFF07080D)
private val Panel = Color(0xFF12151F)
private val TextPrimary = Color(0xFFF7F8FC)
private val TextMuted = Color(0xFFA6ACB9)
private val Accent = Color(0xFF8A7CFF)
private val Gold = Color(0xFFFFD16A)

@Composable
fun MobileHome() {
    var explore by remember { mutableStateOf(false) }
    if (explore) {
        WorldExploreMobile(onClose = { explore = false })
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
            .background(Canvas)
            .verticalScroll(rememberScrollState()),
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(360.dp)
                .background(
                    Brush.verticalGradient(
                        listOf(Color(0xFF261F54), Color(0xFF11131C), Canvas),
                    ),
                )
                .padding(start = 22.dp, end = 22.dp, top = 64.dp, bottom = 24.dp),
        ) {
            Column {
                Text(
                    if (heroSource?.playbackMode == "native") "LIVE TV · OFFICIAL STREAM"
                    else if (heroSource?.playbackMode == "external") "OFFICIAL VIEWING OPTION"
                    else if (heroSource?.playbackMode == "handoff") "SUBSCRIPTION NETWORK"
                    else "CHANNEL DIRECTORY",
                    color = Accent, fontSize = 12.sp, fontWeight = FontWeight.Bold
                )
                Spacer(Modifier.height(10.dp))
                Text(
                    hero?.name ?: "Live television, beautifully organised.",
                    color = TextPrimary,
                    fontSize = 38.sp,
                    lineHeight = 42.sp,
                    fontWeight = FontWeight.Black,
                )
                Spacer(Modifier.height(10.dp))
                Text(
                    hero?.network ?: "Live channels, guide, sport and cinema.",
                    color = TextMuted,
                    fontSize = 16.sp,
                )
                Spacer(Modifier.height(24.dp))
                Surface(
                    color = Color.White,
                    shape = RoundedCornerShape(18.dp),
                    modifier = Modifier.clickable {
                        if (heroSource == null) explore = true
                        else context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(heroSource.url)))
                    },
                ) {
                    Text(
                        hero?.let { catalog.sourceLabel(it.id) } ?: "Explore channels",
                        color = Color(0xFF090A0F),
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 22.dp, vertical = 14.dp),
                    )
                }
            }
        }

        Row(
            modifier = Modifier
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = 20.dp),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            catalog.countries.forEach { item ->
                Surface(
                    color = if (item.code == country) Color.White else Panel,
                    shape = RoundedCornerShape(999.dp),
                    modifier = Modifier.clickable { country = item.code },
                ) {
                    Text(
                        item.flag + " " + item.name,
                        color = if (item.code == country) Color.Black else TextPrimary,
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 11.dp),
                        fontWeight = FontWeight.SemiBold,
                    )
                }
            }
        }

        Spacer(Modifier.height(16.dp))
        Text(
            "Explore 31,522 channels worldwide   →",
            modifier = Modifier.fillMaxWidth().clickable { explore = true }
                .padding(horizontal = 20.dp, vertical = 15.dp),
            fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Accent
        )
        Spacer(Modifier.height(16.dp))
        Section(
            "Official viewing options",
            channels.filter {
                catalog.sourceFor(it.id)?.authorization in
                    setOf("verified-official", "verified-public-authorized")
            },
            catalog
        )
        Section(
            "Premium sports providers",
            channels.filter { "sports" in it.categories &&
                catalog.sourceFor(it.id)?.authorization == "subscription-provider" },
            catalog
        )
        Spacer(Modifier.height(80.dp))
    }
}

@Composable
private fun Section(
    title: String,
    channels: List<TvChannel>,
    catalog: TvCatalog,
) {
    if (channels.isEmpty()) return
    val context = LocalContext.current

    Column {
        Text(
            title,
            color = TextPrimary,
            fontSize = 25.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 20.dp),
        )
        Spacer(Modifier.height(14.dp))
        Row(
            modifier = Modifier
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = 20.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            channels.forEach { channel ->
                Box(
                    modifier = Modifier
                        .width(210.dp)
                        .height(132.dp)
                        .clip(RoundedCornerShape(22.dp))
                        .background(
                            Brush.linearGradient(
                                if (channel.accessModel == "subscription") {
                                    listOf(Color(0xFF2A2256), Panel)
                                } else {
                                    listOf(Color(0xFF17303A), Panel)
                                },
                            ),
                        )
                        .clickable {
                            catalog.sourceFor(channel.id)?.let { source ->
                                context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(source.url)))
                            }
                        }
                        .padding(16.dp),
                ) {
                    Column(verticalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxSize()) {
                        Text(
                            if (channel.accessModel == "subscription") "SUBSCRIPTION" else "OFFICIAL VIEWING",
                            color = if (channel.accessModel == "subscription") Gold else Accent,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                        )
                        Text(
                            channel.shortName,
                            color = TextPrimary,
                            fontSize = 20.sp,
                            lineHeight = 23.sp,
                            fontWeight = FontWeight.Bold,
                        )
                    }
                }
            }
        }
        Spacer(Modifier.height(30.dp))
    }
}
