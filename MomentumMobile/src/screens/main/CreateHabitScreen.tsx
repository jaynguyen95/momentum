import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import {habitService, categoryService} from '../../services/api';
import type {Category} from '../../types';

const CreateHabitScreen = ({navigation}: any) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [color, setColor] = useState('#667eea');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);

  const colors = [
    '#667eea',
    '#48bb78',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
    '#f97316',
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    try {
      setLoading(true);
      await habitService.createHabit({
        name,
        description,
        frequency,
        color,
        category_id: selectedCategory,
        target_count: 1,
      });
      Alert.alert('Success', 'Habit created!', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to create habit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>Habit Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Morning Run"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="What does this habit involve?"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Frequency</Text>
        <View style={styles.frequencyButtons}>
          {['daily', 'weekly', 'custom'].map(freq => (
            <TouchableOpacity
              key={freq}
              style={[
                styles.frequencyButton,
                frequency === freq && styles.frequencyButtonActive,
              ]}
              onPress={() => setFrequency(freq)}>
              <Text
                style={[
                  styles.frequencyButtonText,
                  frequency === freq && styles.frequencyButtonTextActive,
                ]}>
                {freq.charAt(0).toUpperCase() + freq.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {categories.length > 0 && (
          <>
            <Text style={styles.label}>Category (Optional)</Text>
            <View style={styles.categoryButtons}>
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  !selectedCategory && styles.categoryButtonActive,
                ]}
                onPress={() => setSelectedCategory(undefined)}>
                <Text style={styles.categoryButtonText}>None</Text>
              </TouchableOpacity>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === cat.id && styles.categoryButtonActive,
                    {borderColor: cat.color},
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}>
                  <Text style={styles.categoryButtonText}>
                    {cat.icon} {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <Text style={styles.label}>Color</Text>
        <View style={styles.colorPicker}>
          {colors.map(c => (
            <TouchableOpacity
              key={c}
              style={[
                styles.colorOption,
                {backgroundColor: c},
                color === c && styles.colorOptionActive,
              ]}
              onPress={() => setColor(c)}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={loading}>
          <Text style={styles.createButtonText}>
            {loading ? 'Creating...' : 'Create Habit'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  content: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  frequencyButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  frequencyButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  frequencyButtonActive: {
    borderColor: '#667eea',
    backgroundColor: '#667eea10',
  },
  frequencyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  frequencyButtonTextActive: {
    color: '#667eea',
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  categoryButtonActive: {
    borderWidth: 2,
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  colorPicker: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionActive: {
    borderColor: '#333',
  },
  createButton: {
    backgroundColor: '#48bb78',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateHabitScreen;