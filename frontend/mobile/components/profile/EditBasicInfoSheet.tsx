import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { Picker } from '@react-native-picker/picker';
import { COUNTRIES, getProvincesForCountry, getProvincesForRegion, getCitiesForProvince } from '../../constants/locations';

interface EditBasicInfoSheetProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { name: string; headline: string; country: string; region: string; province: string; city: string; street: string; about: string }) => Promise<void>;
  initialData: {
    name: string;
    headline: string;
    location: string;
    about: string;
  };
}

export function EditBasicInfoSheet({ visible, onClose, onSave, initialData }: EditBasicInfoSheetProps) {
  const T = useTheme();
  const [name, setName] = useState(initialData.name);
  const [headline, setHeadline] = useState(initialData.headline);
  const [country, setCountry] = useState('Philippines');
  const [region, setRegion] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [about, setAbout] = useState(initialData.about);
  const [saving, setSaving] = useState(false);

  const isPhilippines = country === 'Philippines';
  const availableRegionsOrStates = getProvincesForCountry(country);
  const availableProvinces = isPhilippines ? getProvincesForRegion(region) : [];
  const availableCities = isPhilippines
    ? getCitiesForProvince(country, province)
    : getCitiesForProvince(country, region);

  useEffect(() => {
    if (visible) {
      setName(initialData.name);
      setHeadline(initialData.headline);
      setAbout(initialData.about);
      
      // Parse location if it exists - format: "Street, City, Province/Region, Country"
      const locationParts = initialData.location.split(',').map(p => p.trim());
      if (locationParts.length >= 1) setStreet(locationParts[0] || '');
      if (locationParts.length >= 2) setCity(locationParts[1] || '');
      if (locationParts.length >= 3) {
        // Could be province or region depending on country
        setProvince(locationParts[2] || '');
        setRegion(locationParts[2] || '');
      }
      if (locationParts.length >= 4) setCountry(locationParts[3] || 'Philippines');
    }
  }, [visible, initialData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ name, headline, country, region, province, city, street, about });
      onClose();
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <TouchableOpacity style={styles.scrim} activeOpacity={1} onPress={onClose} />

      <KeyboardAvoidingView 
        style={{ flex: 1, justifyContent: 'flex-end' }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.sheet, { backgroundColor: T.surface, borderColor: T.border }]}>
          <View style={[styles.handle, { backgroundColor: T.borderFaint }]} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: T.textPrimary }]}>Edit Basic Information</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialCommunityIcons name="close" size={20} color={T.textSub} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.content} keyboardShouldPersistTaps="handled">
            {/* Name */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: T.textHint }]}>Full Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: T.surfaceHigh, borderColor: T.border, color: T.textPrimary }]}
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor={T.textHint}
              />
            </View>

            {/* Headline */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: T.textHint }]}>Headline</Text>
              <TextInput
                style={[styles.input, { backgroundColor: T.surfaceHigh, borderColor: T.border, color: T.textPrimary }]}
                value={headline}
                onChangeText={setHeadline}
                placeholder="e.g. Senior Software Engineer"
                placeholderTextColor={T.textHint}
              />
            </View>

            {/* Country */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: T.textHint }]}>Country</Text>
              <View style={[styles.pickerContainer, { backgroundColor: T.surfaceHigh, borderColor: T.border }]}>
                <Picker
                  selectedValue={country}
                  onValueChange={(value) => {
                    setCountry(value);
                    setRegion('');
                    setProvince('');
                    setCity('');
                  }}
                  style={[styles.picker, { color: T.textPrimary }]}
                  dropdownIconColor={T.textHint}
                >
                  <Picker.Item label="Select country..." value="" />
                  {COUNTRIES.map((c) => (
                    <Picker.Item key={c} label={c} value={c} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Region/State */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: T.textHint }]}>
                {isPhilippines ? 'Region' : country === 'United States' || country === 'Australia' ? 'State' : country === 'Canada' ? 'Province' : 'Region'}
              </Text>
              <View style={[styles.pickerContainer, { backgroundColor: T.surfaceHigh, borderColor: T.border }]}>
                <Picker
                  selectedValue={region}
                  onValueChange={(value) => {
                    setRegion(value);
                    setProvince('');
                    setCity('');
                  }}
                  style={[styles.picker, { color: T.textPrimary }]}
                  dropdownIconColor={T.textHint}
                  enabled={!!country}
                >
                  <Picker.Item
                    label={country ? (isPhilippines ? 'Select region...' : 'Select...') : 'Select country first'}
                    value=""
                  />
                  {availableRegionsOrStates.map((item) => (
                    <Picker.Item key={item} label={item} value={item} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Province (Philippines only) */}
            {isPhilippines && (
              <View style={styles.field}>
                <Text style={[styles.label, { color: T.textHint }]}>Province</Text>
                <View style={[styles.pickerContainer, { backgroundColor: T.surfaceHigh, borderColor: T.border }]}>
                  <Picker
                    selectedValue={province}
                    onValueChange={(value) => {
                      setProvince(value);
                      setCity('');
                    }}
                    style={[styles.picker, { color: T.textPrimary }]}
                    dropdownIconColor={T.textHint}
                    enabled={!!region}
                  >
                    <Picker.Item label={region ? 'Select province...' : 'Select region first'} value="" />
                    {availableProvinces.map((p) => (
                      <Picker.Item key={p} label={p} value={p} />
                    ))}
                  </Picker>
                </View>
              </View>
            )}

            {/* City */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: T.textHint }]}>City</Text>
              <View style={[styles.pickerContainer, { backgroundColor: T.surfaceHigh, borderColor: T.border }]}>
                <Picker
                  selectedValue={city}
                  onValueChange={setCity}
                  style={[styles.picker, { color: T.textPrimary }]}
                  dropdownIconColor={T.textHint}
                  enabled={isPhilippines ? !!province : !!region}
                >
                  <Picker.Item
                    label={
                      isPhilippines
                        ? province
                          ? 'Select city...'
                          : 'Select province first'
                        : region
                        ? 'Select city...'
                        : 'Select region first'
                    }
                    value=""
                  />
                  {availableCities.map((c) => (
                    <Picker.Item key={c} label={c} value={c} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Street */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: T.textHint }]}>Street / Building (Optional)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: T.surfaceHigh, borderColor: T.border, color: T.textPrimary }]}
                value={street}
                onChangeText={setStreet}
                placeholder="e.g. 123 Main Street, Building A"
                placeholderTextColor={T.textHint}
              />
            </View>

            {/* About */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: T.textHint }]}>About</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: T.surfaceHigh, borderColor: T.border, color: T.textPrimary }]}
                value={about}
                onChangeText={setAbout}
                placeholder="Tell us about yourself..."
                placeholderTextColor={T.textHint}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { backgroundColor: T.surfaceHigh, borderColor: T.border }]}
              onPress={onClose}
              disabled={saving}
            >
              <Text style={[styles.buttonText, { color: T.textSub }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, { backgroundColor: T.primary }]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={[styles.buttonText, { color: '#fff' }]}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '85%',
    paddingBottom: 20,
  },
  handle: { width: 38, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 6 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  content: { paddingHorizontal: 20, marginBottom: 16 },
  field: { marginBottom: 20 },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: '500',
  },
  textArea: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: '500',
    minHeight: 120,
  },
  pickerContainer: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: { borderWidth: 1 },
  saveButton: {},
  buttonText: { fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },
});
