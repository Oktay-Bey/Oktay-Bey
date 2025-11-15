package com.oktaybe.dreamtracker.data

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import java.time.LocalDateTime

class DreamRepository(
    private val analyzer: DreamAnalyzer = DreamAnalyzer()
) {
    private val dreams = MutableStateFlow(sampleDreams())

    fun observeDreams(): Flow<List<Dream>> = dreams.asStateFlow()

    fun addDream(
        title: String,
        description: String,
        mood: DreamMood,
        lucidity: Int,
        tags: List<String>
    ) {
        val analysis = analyzer.analyze(description, tags)
        val dream = Dream(
            id = System.currentTimeMillis(),
            title = title,
            description = description,
            mood = mood,
            lucidity = lucidity,
            tags = tags,
            recordedAt = LocalDateTime.now(),
            analysis = analysis
        )
        dreams.update { listOf(dream) + it }
    }

    private fun sampleDreams(): List<Dream> {
        val defaultAnalysis = analyzer.analyze(
            text = "Deniz üstünde uçarken kendimi kontrol ediyordum",
            tags = listOf("deniz", "uçmak", "özgürlük")
        )
        return listOf(
            Dream(
                id = 1,
                title = "Bulutların Üstünde",
                description = "Geniş bir denizde yüzdükten sonra bulutların üstüne çıktım.",
                mood = DreamMood.HAPPY,
                lucidity = 70,
                tags = listOf("deniz", "bulut"),
                recordedAt = LocalDateTime.now().minusDays(1),
                analysis = defaultAnalysis
            )
        )
    }
}
