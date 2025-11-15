package com.oktaybe.dreamtracker.data

import java.time.LocalDateTime

enum class DreamMood(val displayName: String) {
    PEACEFUL("Sakin"),
    HAPPY("Mutlu"),
    NEUTRAL("Dengeli"),
    ANXIOUS("Kaygılı"),
    NIGHTMARE("Kabus")
}

data class DreamAnalysis(
    val summary: String,
    val dominantSymbols: List<String>,
    val moodScore: Int,
    val sleepAdvice: String
)

data class Dream(
    val id: Long,
    val title: String,
    val description: String,
    val mood: DreamMood,
    val lucidity: Int,
    val tags: List<String>,
    val recordedAt: LocalDateTime,
    val analysis: DreamAnalysis
)
