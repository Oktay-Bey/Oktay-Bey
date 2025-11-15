package com.oktaybe.dreamtracker

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Bedtime
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Slider
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.oktaybe.dreamtracker.data.Dream
import com.oktaybe.dreamtracker.data.DreamMood
import com.oktaybe.dreamtracker.ui.theme.DreamTrackerTheme

class MainActivity : ComponentActivity() {
    private val viewModel: DreamViewModel by viewModels { DreamViewModel.Factory }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            DreamTrackerTheme {
                DreamTrackerApp(viewModel)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DreamTrackerApp(viewModel: DreamViewModel) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    var title by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var mood by remember { mutableStateOf(DreamMood.NEUTRAL) }
    var tags by remember { mutableStateOf("") }
    var lucidity by remember { mutableStateOf(50f) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        TopAppBar(
            title = { Text(stringResource(id = R.string.dream_list_title)) },
            colors = TopAppBarDefaults.topAppBarColors(
                containerColor = MaterialTheme.colorScheme.primary,
                titleContentColor = MaterialTheme.colorScheme.onPrimary
            ),
            navigationIcon = {
                Icon(
                    imageVector = Icons.Default.Bedtime,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.onPrimary
                )
            },
            actions = {
                Icon(
                    imageVector = Icons.Default.AutoAwesome,
                    contentDescription = "AI"
                )
            }
        )

        Spacer(modifier = Modifier.height(16.dp))

        DreamForm(
            title = title,
            onTitleChange = { title = it },
            description = description,
            onDescriptionChange = { description = it },
            mood = mood,
            onMoodChange = { mood = it },
            tags = tags,
            onTagsChange = { tags = it },
            lucidity = lucidity,
            onLucidityChange = { lucidity = it },
            onSave = {
                viewModel.addDream(title, description, mood, lucidity.toInt(), tags)
                title = ""
                description = ""
                tags = ""
                lucidity = 50f
                mood = DreamMood.NEUTRAL
            }
        )

        Spacer(modifier = Modifier.height(16.dp))

        DreamList(dreams = uiState.dreams)
    }
}

@Composable
private fun DreamForm(
    title: String,
    onTitleChange: (String) -> Unit,
    description: String,
    onDescriptionChange: (String) -> Unit,
    mood: DreamMood,
    onMoodChange: (DreamMood) -> Unit,
    tags: String,
    onTagsChange: (String) -> Unit,
    lucidity: Float,
    onLucidityChange: (Float) -> Unit,
    onSave: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = stringResource(id = R.string.add_dream), style = MaterialTheme.typography.titleLarge)
            OutlinedTextField(
                value = title,
                onValueChange = onTitleChange,
                label = { Text("Rüya Başlığı") },
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = description,
                onValueChange = onDescriptionChange,
                label = { Text("Detaylar") },
                modifier = Modifier.fillMaxWidth()
            )
            MoodSelector(selectedMood = mood, onMoodChange = onMoodChange)
            OutlinedTextField(
                value = tags,
                onValueChange = onTagsChange,
                label = { Text("Etiketler (virgülle ayırın)") },
                modifier = Modifier.fillMaxWidth()
            )
            Text(text = "Lucidlik: ${lucidity.toInt()}%")
            Slider(
                value = lucidity,
                onValueChange = onLucidityChange,
                valueRange = 0f..100f
            )
            Button(onClick = onSave, modifier = Modifier.fillMaxWidth()) {
                Text("Kaydet")
            }
        }
    }
}

@Composable
private fun MoodSelector(selectedMood: DreamMood, onMoodChange: (DreamMood) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(text = "Ruh Hali", style = MaterialTheme.typography.titleMedium)
        MoodChipRow(selectedMood = selectedMood, onMoodChange = onMoodChange)
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun MoodChipRow(selectedMood: DreamMood, onMoodChange: (DreamMood) -> Unit) {
    FlowRow(
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        DreamMood.values().forEach { mood ->
            TextButton(onClick = { onMoodChange(mood) }) {
                Text(
                    text = mood.displayName,
                    fontWeight = if (mood == selectedMood) FontWeight.Bold else FontWeight.Normal
                )
            }
        }
    }
}

@Composable
private fun DreamList(dreams: List<Dream>) {
    if (dreams.isEmpty()) {
        Text(text = stringResource(id = R.string.empty_state))
        return
    }

    LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        items(dreams) { dream ->
            DreamCard(dream)
        }
    }
}

@Composable
private fun DreamCard(dream: Dream) {
    Card {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = dream.title, style = MaterialTheme.typography.titleLarge)
            Text(text = dream.description)
            Text(text = "Ruh Hali: ${dream.mood.displayName}")
            Text(text = "Lucidlik: ${dream.lucidity}%")
            Text(text = "AI Özeti: ${dream.analysis.summary}")
            Text(text = dream.analysis.sleepAdvice)
        }
    }
}
