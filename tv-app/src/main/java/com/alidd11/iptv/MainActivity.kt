package com.alidd11.iptv

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.core.view.WindowCompat
import com.alidd11.iptv.ui.AstraTvApp
import com.alidd11.iptv.ui.theme.AstraTvTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)

        setContent {
            AstraTvTheme {
                AstraTvApp()
            }
        }
    }
}
