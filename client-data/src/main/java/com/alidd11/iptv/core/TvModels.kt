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
            .filter { it.feedId == "$channelId-main" }
            .minByOrNull { it.priority }
}
