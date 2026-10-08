package com.alidd11.iptv.core

data class TvCountry(
    val code: String,
    val name: String,
    val flag: String,
    val enabled: Boolean,
    val sortOrder: Int,
)

data class TvChannel(
    val id: String,
    val name: String,
    val shortName: String,
    val country: String,
    val categories: List<String>,
    val network: String?,
    val accessModel: String,
    val providerIds: List<String>,
    val packageIds: List<String>,
    val sortOrder: Int,
)

data class PlaybackSource(
    val id: String,
    val feedId: String,
    val type: String,
    val url: String,
    val playbackMode: String,
    val authorization: String,
    val accessModel: String,
    val requiresAuth: Boolean,
    val priority: Int,
    val enabled: Boolean,
)

data class TvCatalog(
    val countries: List<TvCountry>,
    val channels: List<TvChannel>,
    val sources: List<PlaybackSource>,
) {
    fun channelsFor(countryCode: String): List<TvChannel> =
        channels.filter { it.country == countryCode }.sortedBy { it.sortOrder }

    fun sourceFor(channelId: String): PlaybackSource? =
        sources
            .filter { it.feedId == "$channelId-main" && it.enabled &&
                it.url.startsWith("https://") && it.authorization in setOf(
                    "verified-official", "verified-public-authorized", "subscription-provider"
                ) }
            .minByOrNull { it.priority }

    fun featuredFor(countryCode: String): TvChannel? =
        channelsFor(countryCode).minWithOrNull(
            compareBy<TvChannel> { channel ->
                when (val source = sourceFor(channel.id)) {
                    null -> 9
                    else -> when {
                        source.playbackMode == "native" && source.type == "hls" -> 0
                        source.playbackMode == "external" -> 1
                        source.playbackMode == "handoff" -> 2
                        else -> 8
                    }
                }
            }.thenBy { it.sortOrder }
        )

    fun sourceLabel(channelId: String): String =
        when (sourceFor(channelId)?.playbackMode) {
            "handoff" -> "View subscription"
            "external" -> "Watch on official site"
            "native" -> "Open live stream"
            else -> "Explore channels"
        }
}
