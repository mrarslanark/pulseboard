package com.pulseboard

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Build
import android.telephony.TelephonyManager
import com.facebook.react.bridge.*
import java.net.NetworkInterface

class PulseBoardNetworkModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName() = "PulseBoardNetwork"

  @ReactMethod
  fun getNetworkInfo(promise: Promise) {
    try {
      val connectivityManager = reactContext
        .getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager

      val result = Arguments.createMap().apply {
        putString("type",          getConnectionType(connectivityManager))
        putBoolean("isConnected",  isConnected(connectivityManager))
        putBoolean("isWifiEnabled", isWifi(connectivityManager))
        putString("carrier",       getCarrier())
        putString("ipAddress",     getIPAddress() ?: "unknown")
      }

      promise.resolve(result)
    } catch (e: Exception) {
      promise.reject("NETWORK_INFO_ERROR", e.message, e)
    }
  }

  private fun getConnectionType(cm: ConnectivityManager): String {
    val network = cm.activeNetwork ?: return "offline"
    val caps    = cm.getNetworkCapabilities(network) ?: return "unknown"

    return when {
      caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)     -> "wifi"
      caps.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> "cellular"
      caps.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET) -> "ethernet"
      else                                                       -> "unknown"
    }
  }

  private fun isConnected(cm: ConnectivityManager): Boolean {
    val network = cm.activeNetwork ?: return false
    val caps    = cm.getNetworkCapabilities(network) ?: return false
    return caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
  }

  private fun isWifi(cm: ConnectivityManager): Boolean {
    val network = cm.activeNetwork ?: return false
    val caps    = cm.getNetworkCapabilities(network) ?: return false
    return caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)
  }

  private fun getCarrier(): String {
    return try {
      val telephonyManager = reactContext
        .getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
      telephonyManager.networkOperatorName.takeIf { it.isNotEmpty() } ?: "unknown"
    } catch (e: Exception) {
      "unknown"
    }
  }

  private fun getIPAddress(): String? {
    return try {
      NetworkInterface.getNetworkInterfaces()
        .asSequence()
        .flatMap { it.inetAddresses.asSequence() }
        .firstOrNull { !it.isLoopbackAddress && it.hostAddress?.contains(':') == false }
        ?.hostAddress
    } catch (e: Exception) {
      null
    }
  }
}