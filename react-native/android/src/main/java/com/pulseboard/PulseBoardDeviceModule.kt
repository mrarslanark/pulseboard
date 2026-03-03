package com.pulseboard

import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.util.DisplayMetrics
import android.view.WindowManager
import com.facebook.react.bridge.*

class PulseBoardDeviceModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName() = "PulseBoardDevice"

  @ReactMethod
  fun getDeviceInfo(promise: Promise) {
    try {
      val context     = reactContext
      val packageInfo = context.packageManager.getPackageInfo(context.packageName, 0)
      val metrics     = DisplayMetrics()

      @Suppress("DEPRECATION")
      val windowManager = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
        val windowMetrics = windowManager.currentWindowMetrics
        metrics.widthPixels  = windowMetrics.bounds.width()
        metrics.heightPixels = windowMetrics.bounds.height()
      } else {
        @Suppress("DEPRECATION")
        windowManager.defaultDisplay.getMetrics(metrics)
      }

      val result = Arguments.createMap().apply {
        putString("model",        Build.MODEL)
        putString("manufacturer", Build.MANUFACTURER)
        putString("brand",        Build.BRAND)
        putString("os",           "Android")
        putString("osVersion",    Build.VERSION.RELEASE)
        putString("appVersion",   packageInfo.versionName ?: "unknown")
        putString("buildNumber",  getBuildNumber(packageInfo))
        putString("bundleId",     context.packageName)
        putDouble("screenWidth",  metrics.widthPixels.toDouble())
        putDouble("screenHeight", metrics.heightPixels.toDouble())
        putBoolean("isTablet",    isTablet(context))
        putBoolean("isEmulator",  isEmulator())
      }

      promise.resolve(result)
    } catch (e: Exception) {
      promise.reject("DEVICE_INFO_ERROR", e.message, e)
    }
  }

  private fun getBuildNumber(packageInfo: android.content.pm.PackageInfo): String {
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      packageInfo.longVersionCode.toString()
    } else {
      @Suppress("DEPRECATION")
      packageInfo.versionCode.toString()
    }
  }

  private fun isTablet(context: Context): Boolean {
    val metrics = context.resources.displayMetrics
    val widthDp  = metrics.widthPixels  / metrics.density
    val heightDp = metrics.heightPixels / metrics.density
    return minOf(widthDp, heightDp) >= 600f
  }

  private fun isEmulator(): Boolean {
    return (Build.FINGERPRINT.startsWith("generic")
      || Build.FINGERPRINT.startsWith("unknown")
      || Build.MODEL.contains("Emulator")
      || Build.MODEL.contains("Android SDK built for x86")
      || Build.MANUFACTURER.contains("Genymotion")
      || Build.BRAND.startsWith("generic")
      || Build.DEVICE.startsWith("generic")
      || Build.PRODUCT == "google_sdk")
  }
}