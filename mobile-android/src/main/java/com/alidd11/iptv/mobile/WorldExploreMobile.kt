package com.alidd11.iptv.mobile

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.alidd11.iptv.core.WorldChannel
import com.alidd11.iptv.core.WorldDirectory

@Composable
fun WorldExploreMobile(onClose:()->Unit) {
    val context=LocalContext.current
    val repo=remember {WorldDirectory(context)}
    val countries=remember {repo.countries()}
    var country by remember {mutableStateOf("GB")}
    var query by remember {mutableStateOf("")}
    var category by remember {mutableStateOf("")}
    var limit by remember {mutableIntStateOf(60)}
    var showCountries by remember {mutableStateOf(false)}
    var countryQuery by remember {mutableStateOf("")}
    var selected by remember {mutableStateOf<WorldChannel?>(null)}
    val rows=remember(country,query,category) {repo.find(country,query,category)}
    val categories=remember(country) {repo.channels(country).flatMap{it.categories}.distinct().sorted() }
    val countryName=countries.firstOrNull{it.code==country}?.name?:country

    Column(Modifier.fillMaxSize().background(Color(0xFF07080D)).statusBarsPadding().navigationBarsPadding()) {
        Row(Modifier.fillMaxWidth().padding(16.dp),horizontalArrangement=Arrangement.SpaceBetween){
            Text("Explore channels",fontSize=25.sp,color=Color.White,fontWeight=FontWeight.Bold)
            TextButton(onClick=onClose){Text("Close")}
        }
        Text("WORLDWIDE CHANNEL DIRECTORY",Modifier.padding(horizontal=18.dp),
            fontSize=12.sp,color=Color(0xFF8A7CFF))
        TextButton(onClick={showCountries=true},modifier=Modifier.padding(horizontal=10.dp)){
            Text(countryName+"  ▾  ·  "+rows.size+" channels",color=Color.White)
        }
        OutlinedTextField(
            value=query,onValueChange={query=it;limit=60},singleLine=true,
            label={Text("Search channel, alias or network")},
            modifier=Modifier.fillMaxWidth().padding(horizontal=18.dp)
        )
        LazyRow(contentPadding=PaddingValues(horizontal=18.dp),
            horizontalArrangement=Arrangement.spacedBy(8.dp)){
            item { FilterChip(selected=category=="",onClick={category="";limit=60},label={Text("All")}) }
            items(categories){item->
                FilterChip(selected=category==item,onClick={category=item;limit=60},
                    label={Text(item.replaceFirstChar{it.uppercase()})})
            }
        }
        Text(rows.size.toString()+" channels found · "+countries.size+" countries",
            Modifier.padding(18.dp),color=Color(0xFF9EA5B4),fontSize=12.sp)
        LazyColumn(modifier=Modifier.weight(1f),contentPadding=PaddingValues(horizontal=18.dp),
            verticalArrangement=Arrangement.spacedBy(8.dp)){
            items(rows.take(limit),key={it.id}){channel->
                Column(Modifier.fillMaxWidth().background(Color(0xFF161A25),RoundedCornerShape(16.dp))
                    .clickable{selected=channel}.padding(15.dp)){
                    Text(channel.name,color=Color.White,fontWeight=FontWeight.SemiBold)
                    Spacer(Modifier.height(5.dp))
                    Text(listOfNotNull(channel.network,channel.categories.firstOrNull(),
                        channel.feeds.toString()+" feeds").joinToString(" · "),
                        color=Color(0xFFA6ADBB),fontSize=12.sp)
                }
            }
            if(limit<rows.size) item {
                TextButton(onClick={limit+=60},modifier=Modifier.fillMaxWidth()){Text("Load more")}
            }
        }
    }

    if(showCountries) AlertDialog(
        onDismissRequest={showCountries=false},
        title={Text("Choose country")},
        text={
            Column {
                OutlinedTextField(value=countryQuery,onValueChange={countryQuery=it},
                    label={Text("Find country")},singleLine=true)
                LazyColumn(Modifier.heightIn(max=420.dp)){
                    items(countries.filter{it.name.contains(countryQuery,true)||it.code.contains(countryQuery,true)}){
                        item->
                        Text(item.name+"  ·  "+item.visible,
                            Modifier.fillMaxWidth().clickable{
                                country=item.code;query="";category="";limit=60;showCountries=false
                            }.padding(vertical=12.dp))
                    }
                }
            }
        },
        confirmButton={TextButton(onClick={showCountries=false}){Text("Done")}}
    )
    selected?.let{channel->
        AlertDialog(
            onDismissRequest={selected=null},
            title={Text(channel.name)},
            text={Text(channel.country+" · "+channel.feeds+" feeds · "+channel.guides+
                " guide references\n\nDirectory listing only; playable source not verified.")},
            confirmButton={TextButton(enabled=channel.website!=null,onClick={
                channel.website?.let{url->context.startActivity(Intent(Intent.ACTION_VIEW,Uri.parse(url)))}
                selected=null
            }){Text("Visit website")}},
            dismissButton={TextButton(onClick={selected=null}){Text("Close")}}
        )
    }
}
