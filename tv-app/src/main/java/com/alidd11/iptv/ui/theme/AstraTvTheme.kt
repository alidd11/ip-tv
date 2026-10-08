package com.alidd11.iptv.ui.theme

import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.tv.material3.MaterialTheme
import androidx.tv.material3.darkColorScheme

val AstraBlack = Color(0xFF07080D)
val AstraPanel = Color(0xFF11131A)
val AstraPanelElevated = Color(0xFF1A1D27)
val AstraText = Color(0xFFF7F8FC)
val AstraMuted = Color(0xFF9EA5B4)
val AstraAccent = Color(0xFF8A7CFF)
val AstraCyan = Color(0xFF69E6FF)
val AstraGold = Color(0xFFFFD16A)
val AstraLive = Color(0xFFFF496A)

private val AstraColors = darkColorScheme(
    primary = AstraAccent,
    onPrimary = AstraText,
    background = AstraBlack,
    onBackground = AstraText,
    surface = AstraPanel,
    onSurface = AstraText,
    surfaceVariant = AstraPanelElevated,
    onSurfaceVariant = AstraMuted,
)

@Composable
fun AstraTvTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = AstraColors,
        content = content,
    )
}
