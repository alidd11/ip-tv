package com.alidd11.iptv.core

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

data class WorldCountry(val code:String,val name:String,val visible:Int)
data class WorldChannel(
    val id:String,val name:String,val country:String,val network:String?,
    val aliases:List<String>,val categories:List<String>,val website:String?,
    val feeds:Int,val guides:Int
)

class WorldDirectory(private val context:Context) {
    private val cache=mutableMapOf<String,List<WorldChannel>>()
    fun countries():List<WorldCountry> {
        val obj=JSONObject(context.assets.open("worldwide/manifest.json").bufferedReader().use { it.readText() })
        val array=obj.getJSONArray("countries")
        return buildList {
            for(i in 0 until array.length()) {
                val row=array.getJSONObject(i)
                if(row.optInt("visible")>0) add(WorldCountry(row.getString("code"),row.getString("name"),row.getInt("visible")))
            }
        }.sortedWith(compareByDescending<WorldCountry> { it.visible }.thenBy { it.name })
    }
    fun channels(code:String):List<WorldChannel> {
        val country=if(code.uppercase()=="UK")"GB" else code.uppercase()
        require(Regex("^[A-Z]{2}$").matches(country)) { "Invalid country code" }
        return cache.getOrPut(country) {
            val array=JSONArray(context.assets.open("worldwide/countries/"+country+".json").bufferedReader().use { it.readText() })
            buildList {
                for(i in 0 until array.length()) {
                    val row=array.getJSONObject(i)
                    if(row.optBoolean("isClosed")||row.optBoolean("isAdult"))continue
                    add(WorldChannel(
                        id=row.getString("id"),name=row.getString("name"),country=country,
                        network=row.optString("network").takeIf{it.isNotBlank()&&it!="null"},
                        aliases=row.optJSONArray("aliases").toStrings(),
                        categories=row.optJSONArray("categories").toStrings(),
                        website=row.optString("website").takeIf{it.startsWith("https://")},
                        feeds=row.optJSONArray("feeds")?.length()?:0,
                        guides=row.optJSONArray("guides")?.length()?:0
                    ))
                }
            }
        }
    }
    fun find(code:String,query:String="",category:String=""):List<WorldChannel> {
        val needle=query.trim()
        return channels(code).asSequence()
            .filter { category.isBlank()||category in it.categories }
            .filter { needle.isBlank()||it.name.contains(needle,true)||
                it.aliases.any{alias->alias.contains(needle,true)}||
                it.network?.contains(needle,true)==true }
            .sortedWith(compareByDescending<WorldChannel>{
                if(it.name.equals(needle,true))3
                else if(it.aliases.any{alias->alias.equals(needle,true)})2
                else if(it.name.startsWith(needle,true))1 else 0
            }.thenBy{it.name})
            .toList()
    }
}
private fun JSONArray?.toStrings():List<String> =
    if(this==null)emptyList() else List(length()){getString(it)}
