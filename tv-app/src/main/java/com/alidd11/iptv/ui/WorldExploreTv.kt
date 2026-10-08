package com.alidd11.iptv.ui

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.tv.material3.Text
import com.alidd11.iptv.core.WorldChannel
import com.alidd11.iptv.core.WorldDirectory
import com.alidd11.iptv.core.WorldBookmarks
import com.alidd11.iptv.ui.components.FocusButton
import com.alidd11.iptv.ui.theme.AstraBlack
import com.alidd11.iptv.ui.theme.AstraMuted
import com.alidd11.iptv.ui.theme.AstraText

@Composable
fun WorldExploreTv(onClose:()->Unit) {
    val context=LocalContext.current
    val directory=remember{WorldDirectory(context)}
    val countries=remember{directory.countries()}
    val bookmarks=remember{WorldBookmarks(context)}
    var saved by remember{mutableStateOf(bookmarks.list())}
    var savedOnly by remember{mutableStateOf(false)}
    var country by remember{mutableStateOf("GB")}
    var query by remember{mutableStateOf("")}
    var category by remember{mutableStateOf("")}
    var limit by remember{mutableIntStateOf(50)}
    var selected by remember{mutableStateOf<WorldChannel?>(null)}
    val matches=remember(country,query,category,savedOnly,saved){
        if(!savedOnly)directory.find(country,query,category)
        else saved.filter{it.name.contains(query,true)||it.network?.contains(query,true)==true}
            .filter{category==""||category in it.categories}
    }
    val categories=remember(country,savedOnly,saved){
        (if(savedOnly)saved else directory.channels(country)).flatMap{it.categories}.distinct().sorted()
    }

    Column(
        Modifier.fillMaxSize().background(AstraBlack).padding(horizontal=48.dp,vertical=24.dp)
    ) {
        Row(horizontalArrangement=Arrangement.spacedBy(20.dp)){
            FocusButton(label="← Home",onClick=onClose)
            Column {
                Text("Explore the world",fontSize=35.sp,fontWeight=FontWeight.Bold,color=AstraText)
                Text("CHANNEL DIRECTORY · PLAYBACK VERIFIED SEPARATELY",fontSize=12.sp,color=AstraMuted)
            }
        }
        Spacer(Modifier.height(16.dp))
        Row(horizontalArrangement=Arrangement.spacedBy(12.dp)) {
            FocusButton(label="Explore",primary=!savedOnly,onClick={savedOnly=false;category="";limit=50})
            FocusButton(label="★ Saved ("+saved.size+")",primary=savedOnly,
                onClick={savedOnly=true;category="";limit=50})
        }
        Spacer(Modifier.height(12.dp))
        if(!savedOnly) LazyRow(horizontalArrangement=Arrangement.spacedBy(8.dp)){
            items(countries,key={it.code}){item->
                FocusButton(label=item.name,primary=item.code==country,
                    onClick={country=item.code;query="";category="";limit=50})
            }
        }
        Spacer(Modifier.height(16.dp))
        BasicTextField(
            value=query,onValueChange={query=it;limit=50},
            singleLine=true,
            textStyle=androidx.compose.ui.text.TextStyle(fontSize=21.sp,color=Color.White),
            modifier=Modifier.fillMaxWidth()
                .background(Color(0xFF1A1E2A),androidx.compose.foundation.shape.RoundedCornerShape(15.dp))
                .padding(17.dp),
            decorationBox={inner->
                Box{
                    if(query.isEmpty()) Text("Search channel, alias or broadcaster",color=AstraMuted)
                    inner()
                }
            }
        )
        Spacer(Modifier.height(12.dp))
        LazyRow(horizontalArrangement=Arrangement.spacedBy(8.dp)){
            item {FocusButton(label="All",primary=category=="",onClick={category="";limit=50})}
            items(categories){item->
                FocusButton(label=item,primary=category==item,onClick={category=item;limit=50})
            }
        }
        Spacer(Modifier.height(12.dp))
        Text(matches.size.toString()+
            (if(savedOnly)" channels saved on this device" else " channels · "+countries.size+" countries represented"),
            color=AstraMuted)
        Spacer(Modifier.height(8.dp))
        LazyColumn(verticalArrangement=Arrangement.spacedBy(8.dp)){
            items(matches.take(limit),key={it.id}){item->
                FocusButton(
                    label=(if(saved.any{it.id==item.id})"★ " else "")+item.name+
                        "   ·   "+(item.network?:item.country)+"   ·   "+item.feeds+" feeds",
                    modifier=Modifier.fillMaxWidth(),
                    onClick={selected=item}
                )
            }
            if(limit<matches.size)item{
                FocusButton(label="Load more channels",onClick={limit+=50})
            }
        }
    }
    selected?.let{channel->
        Dialog(onDismissRequest={selected=null}){
            Column(Modifier.background(Color(0xFF181C28)).padding(28.dp)){
                Text(channel.name,fontSize=30.sp,color=AstraText)
                Spacer(Modifier.height(12.dp))
                Text(channel.feeds.toString()+" broadcast feeds · "+channel.guides+
                    " guide references. Playback not verified.",color=AstraMuted)
                Spacer(Modifier.height(16.dp))
                FocusButton(
                    label=if(saved.any{it.id==channel.id})"★ Remove saved" else "☆ Save channel",
                    onClick={saved=bookmarks.toggle(channel)}
                )
                if(channel.website!=null){
                    FocusButton(label="Visit broadcaster website",onClick={
                        context.startActivity(Intent(Intent.ACTION_VIEW,Uri.parse(channel.website)))
                        selected=null
                    })
                }
                FocusButton(label="Close",onClick={selected=null})
            }
        }
    }
}
