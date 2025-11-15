package com.oktaybe.dreamtracker

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.oktaybe.dreamtracker.data.Dream
import com.oktaybe.dreamtracker.data.DreamMood
import com.oktaybe.dreamtracker.data.DreamRepository
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class DreamUiState(
    val dreams: List<Dream> = emptyList(),
    val title: String = "",
    val description: String = "",
    val mood: DreamMood = DreamMood.NEUTRAL,
    val lucidity: Float = 50f,
    val tags: String = ""
)

class DreamViewModel(
    private val repository: DreamRepository
) : ViewModel() {

    private val dreamsFlow = repository.observeDreams()

    val uiState: StateFlow<DreamUiState> = dreamsFlow
        .map { DreamUiState(dreams = it) }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = DreamUiState(dreams = emptyList())
        )

    fun addDream(title: String, description: String, mood: DreamMood, lucidity: Int, tags: String) {
        if (title.isBlank() || description.isBlank()) return
        viewModelScope.launch {
            repository.addDream(
                title = title,
                description = description,
                mood = mood,
                lucidity = lucidity,
                tags = tags.split(',').map { it.trim() }.filter { it.isNotEmpty() }
            )
        }
    }

    companion object {
        val Factory = object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                val repo = DreamRepository()
                return DreamViewModel(repo) as T
            }
        }
    }
}
