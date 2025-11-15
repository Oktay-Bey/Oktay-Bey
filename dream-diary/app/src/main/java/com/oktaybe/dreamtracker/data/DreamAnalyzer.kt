package com.oktaybe.dreamtracker.data

import java.util.Locale

/**
 * Basit kurallara dayalı analiz sınıfı. Gerçek uygulamada
 * burada bir bulut API'si veya on-device ML modeli entegre edilebilir.
 */
class DreamAnalyzer {
    private val nightmareKeywords = listOf("karanlık", "kovaladı", "düştüm", "savaş")
    private val lucidKeywords = listOf("fark ettim", "kontrol ettim", "bilinçli")

    fun analyze(text: String, tags: List<String>): DreamAnalysis {
        val lower = text.lowercase(Locale.getDefault())
        val dominantSymbols = tags.takeIf { it.isNotEmpty() }
            ?: extractSymbols(lower)

        val moodScore = when {
            nightmareKeywords.any { lower.contains(it) } -> 15
            lower.contains("deniz") || lower.contains("uçmak") -> 80
            else -> 55
        }

        val lucidityHint = if (lucidKeywords.any { lower.contains(it) }) {
            "Rüya sırasında bilincin arttığına dair ipuçları bulunuyor."
        } else {
            "Lucid farkındalık belirtileri sınırlı, uyku öncesi nefes egzersizleri ekleyin."
        }

        val summary = buildString {
            append("Metinden çıkarılan semboller: ")
            append(dominantSymbols.joinToString())
            append(". Genel ruh hali puanı: $moodScore.")
        }

        val advice = if (moodScore < 30) {
            "Negatif duygu yoğunluğu yüksek. Gün içinde kısa yürüyüşler ve günlük tutma önerilir."
        } else {
            "Uyku hijyenini korumak için düzenli uyku saatleri ve hafif esneme rutini uygulayın."
        }

        return DreamAnalysis(
            summary = summary,
            dominantSymbols = dominantSymbols,
            moodScore = moodScore,
            sleepAdvice = "$lucidityHint $advice"
        )
    }

    private fun extractSymbols(text: String): List<String> {
        return text.split(" ")
            .map { it.replace(Regex("[^a-zA-ZçğıöşüÇĞİÖŞÜ]"), "") }
            .filter { it.length > 3 }
            .take(4)
    }
}
