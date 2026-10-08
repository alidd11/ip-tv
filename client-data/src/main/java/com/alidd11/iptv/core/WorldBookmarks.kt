package com.alidd11.iptv.core

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

/** Device-local directory bookmarks; intentionally independent of user account state. */
class WorldBookmarks(context: Context) {
    private val preferences=context.applicationContext.getSharedPreferences("iptv.bookmarks",Context.MODE_PRIVATE)
    private val key="iptv.savedChannels.v1"

    fun list():List<WorldChannel> {
        return try {
            val array=JSONArray(preferences.getString(key,"[]") ?: "[]")
            val seen=mutableSetOf<String>()
            buildList {
                for(index in 0 until minOf(array.length(),500)){
                    val item=array.optJSONObject(index) ?: continue
                    val id=item.optString("id")
                    val name=item.optString("name")
                    val country=item.optString("country")
                    if(id.isBlank() || name.isBlank() || !country.matches(Regex("[A-Z]{2}")) || !seen.add(id))continue
                    add(WorldChannel(
                        id=id,name=name,country=country,
                        network=item.optString("network").takeIf{it.isNotEmpty()},
                        aliases=emptyList(),
                        categories=item.optJSONArray("categories").asStrings(),
                        website=item.optString("website").takeIf{it.startsWith("https://")},
                        feeds=item.optInt("feeds",0),
                        guides=item.optInt("guides",0)
                    ))
                }
            }
        } catch (_:Exception) { emptyList() }
    }

    fun toggle(item:WorldChannel):List<WorldChannel> {
        val current=list()
        val next=if(current.any{it.id==item.id})current.filterNot{it.id==item.id}
            else (listOf(item)+current).take(500)
        val array=JSONArray()
        for(channel in next){
            array.put(JSONObject().apply{
                put("id",channel.id);put("name",channel.name);put("country",channel.country)
                put("network",channel.network ?: "");put("website",channel.website ?: "")
                put("categories",JSONArray(channel.categories.take(5)))
                put("feeds",channel.feeds);put("guides",channel.guides)
            })
        }
        preferences.edit().putString(key,array.toString()).apply()
        return next
    }
}
private fun JSONArray?.asStrings():List<String> =
    if(this==null)emptyList() else List(length()){optString(it)}
