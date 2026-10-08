package com.alidd11.iptv.core

import android.content.Context
import org.json.JSONArray

class TvCatalogRepository(private val context: Context) {
    fun load(): TvCatalog {
        val countries = readArray("countries.json").mapObject { obj ->
            TvCountry(
                code = obj.getString("code"),
                name = obj.getString("name"),
                flag = obj.getString("flag"),
                enabled = obj.getBoolean("enabled"),
                sortOrder = obj.getInt("sortOrder"),
            )
        }.filter { it.enabled }.sortedBy { it.sortOrder }

        val channels = countries.flatMap { country ->
            readArray("channels/${country.code}.json").mapObject { obj ->
                val access = obj.getJSONObject("access")
                TvChannel(
                    id = obj.getString("id"),
                    name = obj.getString("name"),
                    shortName = obj.getString("shortName"),
                    country = obj.getString("country"),
                    categories = obj.getJSONArray("categories").toStringList(),
                    network = obj.optString("network").takeIf { it.isNotBlank() && it != "null" },
                    accessModel = access.getString("model"),
                    providerIds = access.getJSONArray("providerIds").toStringList(),
                    packageIds = access.getJSONArray("packageIds").toStringList(),
                    sortOrder = obj.getInt("sortOrder"),
                )
            }
        }

        val sources = readArray("playback-sources.verified.json").mapObject { obj ->
            PlaybackSource(
                id = obj.getString("id"),
                feedId = obj.getString("feedId"),
                type = obj.getString("type"),
                url = obj.getString("url"),
                playbackMode = obj.getString("playbackMode"),
                authorization = obj.getString("authorization"),
                accessModel = obj.getString("accessModel"),
                requiresAuth = obj.getBoolean("requiresAuth"),
                priority = obj.getInt("priority"),
            )
        }

        return TvCatalog(countries, channels, sources)
    }

    private fun readArray(path: String): JSONArray {
        val raw = context.assets.open(path).bufferedReader().use { it.readText() }
        return JSONArray(raw)
    }
}

private inline fun <T> JSONArray.mapObject(transform: (org.json.JSONObject) -> T): List<T> =
    List(length()) { index -> transform(getJSONObject(index)) }

private fun JSONArray.toStringList(): List<String> =
    List(length()) { index -> getString(index) }
