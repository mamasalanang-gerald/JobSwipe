import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, StatusBar, Switch, KeyboardAvoidingView,
  Platform, Alert, Modal, FlatList, TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  bg:          '#0f0a1e',
  surface:     '#16102a',
  surfaceHigh: '#1e1535',
  border:      'rgba(255,255,255,0.07)',
  borderFocus: 'rgba(168,85,247,0.45)',
  primary:     '#a855f7',
  pink:        '#e91e8c',
  green:       '#4ade80',
  blue:        '#60a5fa',
  danger:      '#f87171',
  textPrimary: '#ffffff',
  textSub:     'rgba(255,255,255,0.5)',
  textHint:    'rgba(255,255,255,0.28)',
};

// ─── Skill type ───────────────────────────────────────────────────────────────
type SkillEntry = { name: string; type: 'hard' | 'soft' };

// ─── Interview templates ──────────────────────────────────────────────────────
const INTERVIEW_TEMPLATES = [
  'Tell us about your experience...',
  'Walk us through your background...',
  'Describe a challenging project...',
  'What makes you a great fit?',
];

// ─── Work types ───────────────────────────────────────────────────────────────
const WORK_TYPES = ['remote', 'onsite', 'hybrid'] as const;
type WorkType = typeof WORK_TYPES[number];

// ─── PH Location Data ─────────────────────────────────────────────────────────
const PH_REGIONS: Record<string, Record<string, string[]>> = {
  'NCR': {
    'Metro Manila': ['Manila', 'Quezon City', 'Makati', 'Pasig', 'Taguig', 'Mandaluyong', 'Marikina', 'Pasay', 'Caloocan', 'Parañaque', 'Las Piñas', 'Muntinlupa', 'Valenzuela', 'Malabon', 'Navotas', 'Pateros', 'San Juan'],
  },
  'Region I – Ilocos': {
    'Ilocos Norte': ['Laoag', 'Batac', 'Paoay', 'Pagudpud', 'Sarrat'],
    'Ilocos Sur': ['Vigan', 'Candon', 'Bantay', 'Santa', 'Narvacan'],
    'La Union': ['San Fernando', 'Agoo', 'Bauang', 'Bagulin', 'Naguilian'],
    'Pangasinan': ['Dagupan', 'San Carlos', 'Urdaneta', 'Alaminos', 'Lingayen'],
  },
  'Region II – Cagayan Valley': {
    'Cagayan': ['Tuguegarao', 'Aparri', 'Bayombong', 'Solana', 'Abulug'],
    'Isabela': ['Ilagan', 'Cauayan', 'Santiago', 'Echague', 'Alicia'],
    'Nueva Vizcaya': ['Bayombong', 'Solano', 'Bambang', 'Diadi', 'Dupax del Sur'],
    'Quirino': ['Cabarroguis', 'Diffun', 'Maddela', 'Nagtipunan', 'Saguday'],
  },
  'Region III – Central Luzon': {
    'Bulacan': ['Malolos', 'Meycauayan', 'Marilao', 'Obando', 'San Jose del Monte'],
    'Pampanga': ['San Fernando', 'Angeles', 'Mabalacat', 'Guagua', 'Lubao'],
    'Tarlac': ['Tarlac City', 'Capas', 'Concepcion', 'Gerona', 'Paniqui'],
    'Zambales': ['Olongapo', 'Iba', 'San Antonio', 'Subic', 'Castillejos'],
    'Nueva Ecija': ['Palayan', 'Cabanatuan', 'Gapan', 'San Jose City', 'Muñoz'],
    'Bataan': ['Balanga', 'Mariveles', 'Dinalupihan', 'Hermosa', 'Orani'],
    'Aurora': ['Baler', 'Casiguran', 'Dilasag', 'Dingalan', 'Dipaculao'],
  },
  'Region IV-A – CALABARZON': {
    'Batangas': ['Batangas City', 'Lipa', 'Tanauan', 'Santo Tomas', 'Nasugbu'],
    'Cavite': ['Trece Martires', 'Tagaytay', 'Dasmariñas', 'Bacoor', 'Imus'],
    'Laguna': ['Santa Cruz', 'San Pablo', 'Calamba', 'Biñan', 'Cabuyao'],
    'Quezon': ['Lucena', 'Tayabas', 'Sariaya', 'Candelaria', 'Pagbilao'],
    'Rizal': ['Antipolo', 'Cainta', 'Taytay', 'Angono', 'Binangonan'],
  },
  'Region IV-B – MIMAROPA': {
    'Palawan': ['Puerto Princesa', 'El Nido', 'Coron', "Brooke's Point", 'Roxas'],
    'Occidental Mindoro': ['Mamburao', 'San Jose', 'Abra de Ilog', 'Calintaan', 'Paluan'],
    'Oriental Mindoro': ['Calapan', 'Bongabong', 'Gloria', 'Naujan', 'Pinamalayan'],
    'Marinduque': ['Boac', 'Mogpog', 'Santa Cruz', 'Buenavista', 'Gasan'],
    'Romblon': ['Romblon', 'Alcantara', 'Cajidiocan', 'Calatrava', 'Ferrol'],
  },
  'Region V – Bicol': {
    'Albay': ['Legazpi', 'Tabaco', 'Ligao', 'Daraga', 'Camalig'],
    'Camarines Norte': ['Daet', 'Labo', 'Mercedes', 'Paracale', 'Talisay'],
    'Camarines Sur': ['Naga', 'Iriga', 'Libmanan', 'Pili', 'Sipocot'],
    'Catanduanes': ['Virac', 'Bagamanoc', 'Baras', 'Gigmoto', 'Pandan'],
    'Masbate': ['Masbate City', 'Cataingan', 'Cawayan', 'Mandaon', 'Milagros'],
    'Sorsogon': ['Sorsogon City', 'Bulusan', 'Casiguran', 'Gubat', 'Irosin'],
  },
  'Region VI – Western Visayas': {
    'Aklan': ['Kalibo', 'Altavas', 'Balete', 'Banga', 'Malinao'],
    'Antique': ['San Jose de Buenavista', 'Culasi', 'Hamtic', 'Libertad', 'Pandan'],
    'Capiz': ['Roxas City', 'Pontevedra', 'Pilar', 'Panay', 'Mambusao'],
    'Guimaras': ['Jordan', 'Buenavista', 'Nueva Valencia', 'San Lorenzo', 'Sibunag'],
    'Iloilo': ['Iloilo City', 'Passi', 'Dumangas', 'Leon', 'Pavia'],
    'Negros Occidental': ['Bacolod', 'Bago', 'Cadiz', 'Escalante', 'Himamaylan'],
  },
  'Region VII – Central Visayas': {
    'Bohol': ['Tagbilaran', 'Tubigon', 'Talibon', 'Jagna', 'Carmen'],
    'Cebu': ['Cebu City', 'Lapu-Lapu', 'Mandaue', 'Danao', 'Toledo'],
    'Negros Oriental': ['Dumaguete', 'Bais', 'Bayawan', 'Canlaon', 'Guihulngan'],
    'Siquijor': ['Siquijor', 'Enrique Villanueva', 'Larena', 'Lazi', 'Maria'],
  },
  'Region VIII – Eastern Visayas': {
    'Eastern Samar': ['Borongan', 'Can-avid', 'Dolores', 'General MacArthur', 'Guiuan'],
    'Leyte': ['Tacloban', 'Baybay', 'Ormoc', 'Palo', 'Tanauan'],
    'Northern Samar': ['Catarman', 'Allen', 'Bobon', 'Lope de Vega', 'San Isidro'],
    'Samar': ['Catbalogan', 'Calbayog', 'Gandara', 'Matuguinao', 'Paranas'],
    'Southern Leyte': ['Maasin', 'Bontoc', 'Limasawa', 'Malitbog', 'Padre Burgos'],
    'Biliran': ['Naval', 'Almeria', 'Biliran', 'Cabucgayan', 'Caibiran'],
  },
  'Region IX – Zamboanga Peninsula': {
    'Zamboanga del Norte': ['Dipolog', 'Dapitan', 'Jose Dalman', 'Kalawit', 'La Libertad'],
    'Zamboanga del Sur': ['Pagadian', 'Buug', 'Dimataling', 'Dinas', 'Dumalinao'],
    'Zamboanga Sibugay': ['Ipil', 'Alicia', 'Diplahan', 'Imelda', 'Kabasalan'],
  },
  'Region X – Northern Mindanao': {
    'Bukidnon': ['Malaybalay', 'Valencia', 'Cabanglasan', 'Damulog', 'Dangcagan'],
    'Camiguin': ['Mambajao', 'Catarman', 'Guinsiliban', 'Mahinog', 'Sagay'],
    'Lanao del Norte': ['Iligan', 'Kapatagan', 'Kauswagan', 'Kolambugan', 'Linamon'],
    'Misamis Occidental': ['Oroquieta', 'Ozamiz', 'Tangub', 'Aloran', 'Baliangao'],
    'Misamis Oriental': ['Cagayan de Oro', 'Gingoog', 'El Salvador', 'Initao', 'Jasaan'],
  },
  'Region XI – Davao': {
    'Davao de Oro': ['Nabunturan', 'Compostela', 'Laak', 'Mabini', 'Maco'],
    'Davao del Norte': ['Tagum', 'Panabo', 'Samal', 'Asuncion', 'Braulio E. Dujali'],
    'Davao del Sur': ['Digos', 'Bansalan', 'Hagonoy', 'Kiblawan', 'Magsaysay'],
    'Davao Occidental': ['Jose Abad Santos', 'Don Marcelino', 'Malita', 'Santa Maria', 'Sarangani'],
    'Davao Oriental': ['Mati', 'Baganga', 'Banaybanay', 'Boston', 'Caraga'],
    'Davao City': ['Davao City'],
  },
  'Region XII – SOCCSKSARGEN': {
    'Cotabato': ['Kidapawan', 'Alamada', 'Aleosan', 'Antipas', 'Arakan'],
    'Sarangani': ['Alabel', 'Glan', 'Kiamba', 'Maasim', 'Maitum'],
    'South Cotabato': ['Koronadal', 'General Santos', 'Banga', 'Lake Sebu', 'Norala'],
    'Sultan Kudarat': ['Isulan', 'Bagumbayan', 'Columbio', 'Esperanza', 'Kalamansig'],
  },
  'Region XIII – Caraga': {
    'Agusan del Norte': ['Butuan', 'Cabadbaran', 'Buenavista', 'Carmen', 'Jabonga'],
    'Agusan del Sur': ['Prosperidad', 'Bayugan', 'Bunawan', 'Esperanza', 'La Paz'],
    'Dinagat Islands': ['San Jose', 'Basilisa', 'Cagdianao', 'Dinagat', 'Libjo'],
    'Surigao del Norte': ['Surigao City', 'Claver', 'Dapa', 'Del Carmen', 'General Luna'],
    'Surigao del Sur': ['Tandag', 'Bislig', 'Cagwait', 'Cantilan', 'Carmen'],
  },
  'CAR – Cordillera': {
    'Abra': ['Bangued', 'Boliney', 'Bucay', 'Bucloc', 'Daguioman'],
    'Apayao': ['Kabugao', 'Calanasan', 'Conner', 'Flora', 'Luna'],
    'Benguet': ['La Trinidad', 'Baguio City', 'Atok', 'Bakun', 'Bokod'],
    'Ifugao': ['Lagawe', 'Aguinaldo', 'Alfonso Lista', 'Asipulo', 'Banaue'],
    'Kalinga': ['Tabuk', 'Balbalan', 'Lubuagan', 'Pasil', 'Pinukpuk'],
    'Mountain Province': ['Bontoc', 'Bauko', 'Besao', 'Barlig', 'Natonin'],
  },
  'BARMM – Bangsamoro': {
    'Basilan': ['Isabela City', 'Lamitan', 'Akbar', 'Al-Barka', 'Hadji Mohammad Ajul'],
    'Lanao del Sur': ['Marawi', 'Bacolod-Kalawi', 'Balabagan', 'Balindong', 'Bayang'],
    'Maguindanao del Norte': ['Datu Odin Sinsuat', 'Barira', 'Buldon', 'Datu Blah T. Sinsuat', 'Datu Saudi-Ampatuan'],
    'Maguindanao del Sur': ['Buluan', 'Datu Abdullah Sangki', 'Datu Anggal Midtimbang', 'Datu Hoffer Ampatuan', 'Datu Paglas'],
    'Sulu': ['Jolo', 'Hadji Panglima Tahil', 'Indanan', 'Kalingalan Caluang', 'Lugus'],
    'Tawi-Tawi': ['Bongao', 'Languyan', 'Mapun', 'Panglima Sugala', 'Sapa-Sapa'],
  },
};

type RouteParams = {
  CreateJob: {
    onJobCreated?: (job: any) => void;
  };
};

// ─── Custom Picker ────────────────────────────────────────────────────────────
function CustomPicker({
  selectedValue,
  onValueChange,
  items,
  placeholder,
  enabled = true,
}: {
  selectedValue: string;
  onValueChange: (val: string) => void;
  items: { label: string; value: string }[];
  placeholder: string;
  enabled?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const selectedLabel = items.find(i => i.value === selectedValue)?.label;

  return (
    <>
      <TouchableOpacity
        style={[
          s.pickerWrap,
          !enabled && s.pickerDisabled,
        ]}
        onPress={() => enabled && setVisible(true)}
        activeOpacity={0.8}
        disabled={!enabled}
      >
        <Text style={{ color: selectedLabel ? T.textPrimary : T.textHint, fontSize: 13, flex: 1 }}>
          {selectedLabel || placeholder}
        </Text>
        <MaterialCommunityIcons name="chevron-down" size={18} color={T.textHint} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={cp.overlay}>
            <TouchableWithoutFeedback>
              <View style={cp.sheet}>
                <Text style={cp.sheetTitle}>{placeholder}</Text>
                <FlatList
                  data={items}
                  keyExtractor={i => i.value}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        cp.option,
                        item.value === selectedValue && cp.optionActive,
                      ]}
                      onPress={() => {
                        onValueChange(item.value);
                        setVisible(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        cp.optionText,
                        item.value === selectedValue && cp.optionTextActive,
                      ]}>
                        {item.label}
                      </Text>
                      {item.value === selectedValue && (
                        <MaterialCommunityIcons name="check" size={16} color={T.primary} />
                      )}
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const cp = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    backgroundColor: T.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.border,
    maxHeight: 420,
    overflow: 'hidden',
  },
  sheetTitle: {
    color: T.textSub,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    padding: 16,
    paddingBottom: 10,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: T.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionActive: {
    backgroundColor: 'rgba(168,85,247,0.1)',
  },
  optionText: {
    color: T.textPrimary,
    fontSize: 13,
  },
  optionTextActive: {
    color: T.primary,
    fontWeight: '600',
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function CreateJobScreen() {
  const navigation      = useNavigation<any>();
  const route           = useRoute<RouteProp<RouteParams, 'CreateJob'>>();
  const { top, bottom } = useSafeAreaInsets();

  // ── Form state ──────────────────────────────────────────────────────────────
  const [title,             setTitle]             = useState('');
  const [description,       setDescription]       = useState('');
  const [salaryMin,         setSalaryMin]         = useState('');
  const [salaryMax,         setSalaryMax]         = useState('');
  const [salaryHidden,      setSalaryHidden]      = useState(false);
  const [workType,          setWorkType]          = useState<WorkType>('remote');

  // Location
  const [selectedRegion,   setSelectedRegion]   = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity,     setSelectedCity]     = useState('');
  const [location,         setLocation]         = useState('');
  const [locationCity,     setLocationCity]     = useState('');
  const [locationRegion,   setLocationRegion]   = useState('');

  const [interviewTemplate, setInterviewTemplate] = useState(INTERVIEW_TEMPLATES[0]);
  const [skills,            setSkills]            = useState<SkillEntry[]>([]);
  const [skillInput,        setSkillInput]        = useState('');
  const [showAddHard,       setShowAddHard]       = useState(false);
  const [showAddSoft,       setShowAddSoft]       = useState(false);
  const [focusedField,      setFocusedField]      = useState<string | null>(null);
  const [submitting,        setSubmitting]        = useState(false);

  // ── Derived location lists ──────────────────────────────────────────────────
  const provinces = selectedRegion ? Object.keys(PH_REGIONS[selectedRegion] || {}) : [];
  const cities    = selectedProvince ? (PH_REGIONS[selectedRegion]?.[selectedProvince] || []) : [];

  // ── Auto-fill location string ───────────────────────────────────────────────
  useEffect(() => {
    if (selectedCity && selectedProvince && selectedRegion) {
      setLocationCity(selectedCity);
      setLocationRegion(selectedProvince);
      setLocation(`${selectedCity}, ${selectedProvince}, Philippines`);
    } else {
      setLocation('');
      setLocationCity('');
      setLocationRegion('');
    }
  }, [selectedCity, selectedProvince, selectedRegion]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const addSkill = (type: 'hard' | 'soft') => {
    const name = skillInput.trim();
    if (!name) return;
    setSkills(prev => [...prev, { name, type }]);
    setSkillInput('');
    setShowAddHard(false);
    setShowAddSoft(false);
  };

  const removeSkill = (idx: number) =>
    setSkills(prev => prev.filter((_, i) => i !== idx));

  const inputStyle = (field: string) => [
    s.input,
    focusedField === field && s.inputFocused,
  ];

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Missing field', 'Please enter a job title.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Missing field', 'Please enter a job description.');
      return;
    }

    const payload = {
      title:              title.trim(),
      description:        description.trim(),
      salary_min:         salaryMin ? Number(salaryMin) : null,
      salary_max:         salaryMax ? Number(salaryMax) : null,
      salary_is_hidden:   salaryHidden,
      work_type:          workType,
      location:           location.trim(),
      location_city:      locationCity.trim(),
      location_region:    locationRegion.trim(),
      interview_template: interviewTemplate,
      skills:             skills.map(sk => ({ name: sk.name, type: sk.type })),
    };

    setSubmitting(true);
    try {
      // TODO: replace with your actual API call
      // const res = await fetch('https://your-api.com/v1/company/jobs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // });

      route.params?.onJobCreated?.({
        title:       payload.title,
        dept:        payload.location_region || 'General',
        description: payload.description,
        icon:        'briefcase-outline' as any,
        color:       T.primary,
      });

      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to post job. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[s.screen, { paddingTop: top }]}>
      <StatusBar barStyle="light-content" />

      {/* ── Top Bar ── */}
      <View style={s.topBar}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => navigation.navigate('applicants')}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="arrow-left" size={20} color={T.textPrimary} />
        </TouchableOpacity>
        <Text style={s.screenTitle}>Create Job</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <ScrollView
          contentContainerStyle={[s.scroll, { paddingBottom: bottom + 80 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── Section: Basic Info ── */}
          <SectionLabel icon="briefcase-outline" label="Basic Info" />

          <FieldLabel label="Job Title" required />
          <TextInput
            style={inputStyle('title')}
            placeholder="e.g. Senior Laravel Developer"
            placeholderTextColor={T.textHint}
            value={title}
            onChangeText={setTitle}
            onFocus={() => setFocusedField('title')}
            onBlur={() => setFocusedField(null)}
          />

          <FieldLabel label="Description" required />
          <TextInput
            style={[inputStyle('description'), s.textArea]}
            placeholder="100+ char description…"
            placeholderTextColor={T.textHint}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            onFocus={() => setFocusedField('description')}
            onBlur={() => setFocusedField(null)}
          />
          <Text style={s.charCount}>{description.length} / 100+ chars</Text>

          {/* ── Section: Salary ── */}
          <SectionLabel icon="cash-multiple" label="Salary" />

          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <FieldLabel label="Min" />
              <View style={[s.moneyInput, focusedField === 'smin' && s.inputFocused]}>
                <MaterialCommunityIcons name="currency-php" size={18} color={T.textHint} />
                <TextInput
                  style={s.moneyTextInput}
                  placeholder="50000"
                  placeholderTextColor={T.textHint}
                  value={salaryMin}
                  onChangeText={setSalaryMin}
                  keyboardType="numeric"
                  onFocus={() => setFocusedField('smin')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <FieldLabel label="Max" />
              <View style={[s.moneyInput, focusedField === 'smax' && s.inputFocused]}>
                <MaterialCommunityIcons name="currency-php" size={18} color={T.textHint} />
                <TextInput
                  style={s.moneyTextInput}
                  placeholder="80000"
                  placeholderTextColor={T.textHint}
                  value={salaryMax}
                  onChangeText={setSalaryMax}
                  keyboardType="numeric"
                  onFocus={() => setFocusedField('smax')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>
          </View>

          <View style={s.switchRow}>
            <View>
              <Text style={s.switchLabel}>Hide salary from applicants</Text>
            </View>
            <Switch
              value={salaryHidden}
              onValueChange={setSalaryHidden}
              trackColor={{ false: T.surfaceHigh, true: T.primary }}
              thumbColor="#fff"
            />
          </View>

          {/* ── Section: Work Setup ── */}
          <SectionLabel icon="laptop" label="Work Setup" />

          <FieldLabel label="Work Type" />
          <View style={s.chipRow}>
            {WORK_TYPES.map(wt => (
              <TouchableOpacity
                key={wt}
                style={[s.typeChip, workType === wt && s.typeChipActive]}
                onPress={() => setWorkType(wt)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name={wt === 'remote' ? 'home-outline' : wt === 'onsite' ? 'office-building-outline' : 'sync'}
                  size={14}
                  color={workType === wt ? T.primary : T.textHint}
                />
                <Text style={[s.typeChipText, workType === wt && s.typeChipTextActive]}>
                  {wt.charAt(0).toUpperCase() + wt.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Section: Location ── */}
          <SectionLabel icon="map-marker-outline" label="Location" />

          <FieldLabel label="Region" />
          <CustomPicker
            selectedValue={selectedRegion}
            onValueChange={val => {
              setSelectedRegion(val);
              setSelectedProvince('');
              setSelectedCity('');
            }}
            items={Object.keys(PH_REGIONS).map(r => ({ label: r, value: r }))}
            placeholder="Select region…"
          />

          <FieldLabel label="Province / District" />
          <CustomPicker
            selectedValue={selectedProvince}
            onValueChange={val => {
              setSelectedProvince(val);
              setSelectedCity('');
            }}
            items={provinces.map(p => ({ label: p, value: p }))}
            placeholder={selectedRegion ? 'Select province…' : 'Select a region first'}
            enabled={!!selectedRegion}
          />

          <FieldLabel label="City / Municipality" />
          <CustomPicker
            selectedValue={selectedCity}
            onValueChange={val => setSelectedCity(val)}
            items={cities.map(c => ({ label: c, value: c }))}
            placeholder={selectedProvince ? 'Select city…' : 'Select a province first'}
            enabled={!!selectedProvince}
          />

          {!!location && (
            <View style={s.locationPreview}>
              <MaterialCommunityIcons name="map-marker-check-outline" size={14} color={T.green} />
              <Text style={s.locationPreviewText}>{location}</Text>
            </View>
          )}

          {/* ── Section: Interview Template ── */}
          <SectionLabel icon="comment-question-outline" label="Interview Template" />
          <FieldLabel label="Opening Question" />
          {INTERVIEW_TEMPLATES.map(tpl => (
            <TouchableOpacity
              key={tpl}
              style={[s.templateOption, interviewTemplate === tpl && s.templateOptionActive]}
              onPress={() => setInterviewTemplate(tpl)}
              activeOpacity={0.8}
            >
              <View style={[s.templateRadio, interviewTemplate === tpl && s.templateRadioActive]}>
                {interviewTemplate === tpl && <View style={s.templateRadioDot} />}
              </View>
              <Text style={[s.templateText, interviewTemplate === tpl && s.templateTextActive]}>
                {tpl}
              </Text>
            </TouchableOpacity>
          ))}

          {/* ── Section: Skills ── */}
          <SectionLabel icon="lightning-bolt" label="Skills" />

          <View style={s.skillSegment}>
            <View style={s.skillSectionHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <MaterialCommunityIcons name="code-braces" size={13} color={T.primary} />
                <Text style={s.skillSegmentLabel}>Required Skills</Text>
              </View>
              <TouchableOpacity
                style={s.addBtn}
                onPress={() => {
                  setShowAddHard(prev => !prev);
                  setShowAddSoft(false);
                }}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name={showAddHard ? 'minus' : 'plus'} size={12} color={T.primary} />
                <Text style={s.addBtnText}>{showAddHard ? 'Cancel' : 'Add'}</Text>
              </TouchableOpacity>
            </View>

            <View style={s.chips}>
              {skills.filter(sk => sk.type === 'hard').map((sk, idx) => (
                <View key={`hard-${idx}`} style={[s.chip, s.chipHard]}>
                  <Text style={[s.chipText, { color: T.primary }]}>{sk.name}</Text>
                  <TouchableOpacity
                    onPress={() => removeSkill(skills.findIndex(s => s.name === sk.name && s.type === sk.type))}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    style={{ marginLeft: 4 }}
                  >
                    <MaterialCommunityIcons name="close" size={10} color={T.primary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {showAddHard && (
              <View style={{ marginTop: 12 }}>
                <TextInput
                  style={[s.input, focusedField === 'skill' && s.inputFocused]}
                  placeholder="Add a required skill (e.g. React, AWS, SQL…)"
                  placeholderTextColor={T.textHint}
                  value={skillInput}
                  onChangeText={setSkillInput}
                  onFocus={() => setFocusedField('skill')}
                  onBlur={() => setFocusedField(null)}
                  onSubmitEditing={() => addSkill('hard')}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={s.addBtnPrimary}
                  onPress={() => addSkill('hard')}
                  activeOpacity={0.8}
                >
                  <Text style={s.addBtnTextSecondary}>Add Skill</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={s.skillDivider} />

          <View style={s.skillSegment}>
            <View style={s.skillSectionHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <MaterialCommunityIcons name="account-heart-outline" size={13} color={T.green} />
                <Text style={[s.skillSegmentLabel, { color: T.green }]}>Preferred Skills</Text>
              </View>
              <TouchableOpacity
                style={[s.addBtn, { borderColor: 'rgba(74,222,128,0.3)', backgroundColor: 'rgba(74,222,128,0.07)' }]}
                onPress={() => {
                  setShowAddSoft(prev => !prev);
                  setShowAddHard(false);
                }}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name={showAddSoft ? 'minus' : 'plus'} size={12} color={T.green} />
                <Text style={[s.addBtnText, { color: T.green }]}>{showAddSoft ? 'Cancel' : 'Add'}</Text>
              </TouchableOpacity>
            </View>

            <View style={s.chips}>
              {skills.filter(sk => sk.type === 'soft').map((sk, idx) => (
                <View key={`soft-${idx}`} style={[s.chip, s.chipSoft]}>
                  <Text style={[s.chipText, { color: T.green }]}>{sk.name}</Text>
                  <TouchableOpacity
                    onPress={() => removeSkill(skills.findIndex(s => s.name === sk.name && s.type === sk.type))}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    style={{ marginLeft: 4 }}
                  >
                    <MaterialCommunityIcons name="close" size={10} color={T.green} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {showAddSoft && (
              <View style={{ marginTop: 12 }}>
                <TextInput
                  style={[s.input, focusedField === 'skill' && s.inputFocused]}
                  placeholder="Add a preferred skill (e.g. Communication, Leadership…)"
                  placeholderTextColor={T.textHint}
                  value={skillInput}
                  onChangeText={setSkillInput}
                  onFocus={() => setFocusedField('skill')}
                  onBlur={() => setFocusedField(null)}
                  onSubmitEditing={() => addSkill('soft')}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={[s.addBtnPrimary, { backgroundColor: T.green }]}
                  onPress={() => addSkill('soft')}
                  activeOpacity={0.8}
                >
                  <Text style={s.addBtnTextSecondary}>Add Skill</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* ── Submit ── */}
          <TouchableOpacity
            style={[s.submitBtn, submitting && s.submitBtnDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={submitting}
          >
            <MaterialCommunityIcons name="briefcase-check-outline" size={18} color="#fff" />
            <Text style={s.submitBtnText}>{submitting ? 'Posting…' : 'Post Job'}</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionLabel({
  icon,
  label,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
}) {
  return (
    <View style={sl.wrap}>
      <MaterialCommunityIcons name={icon} size={14} color={T.primary} />
      <Text style={sl.text}>{label}</Text>
    </View>
  );
}
const sl = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 24,
    marginBottom: 10,
  },
  text: {
    fontSize: 11,
    fontWeight: '800',
    color: T.primary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <Text style={fl.text}>
      {label}
      {required && <Text style={{ color: T.danger }}> *</Text>}
    </Text>
  );
}
const fl = StyleSheet.create({
  text: { fontSize: 12, fontWeight: '600', color: T.textSub, marginBottom: 6 },
});

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.bg },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: { fontSize: 17, fontWeight: '800', color: T.textPrimary, letterSpacing: -0.3 },

  scroll: { paddingHorizontal: 16, paddingTop: 4 },

  // Inputs
  input: {
    backgroundColor: T.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    color: T.textPrimary,
    marginBottom: 12,
  },
  inputFocused: { borderColor: T.borderFocus },
  textArea:     { minHeight: 110 },
  moneyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.border,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  moneyTextInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 0,
    color: T.textPrimary,
  },
  charCount:    { fontSize: 11, color: T.textHint, textAlign: 'right', marginTop: -8, marginBottom: 12 },

  // Row layout
  row: { flexDirection: 'row', gap: 10 },

  // Switch
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: T.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.border,
    padding: 14,
    marginBottom: 12,
  },
  switchLabel: { fontSize: 13, fontWeight: '600', color: T.textPrimary },
  switchSub: {
    fontSize: 10,
    color: T.textHint,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },

  // Work type chips
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: T.surfaceHigh,
    borderWidth: 1,
    borderColor: T.border,
  },
  typeChipActive:     { borderColor: 'rgba(168,85,247,0.45)', backgroundColor: 'rgba(168,85,247,0.1)' },
  typeChipText:       { fontSize: 12, fontWeight: '600', color: T.textHint },
  typeChipTextActive: { color: T.primary },

  // Location picker (now used by CustomPicker)
  pickerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
  },
  pickerDisabled: { opacity: 0.45 },

  locationPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(74,222,128,0.07)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  locationPreviewText: { fontSize: 12, color: T.green, fontWeight: '600', flex: 1 },

  // Interview template
  templateOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.border,
    backgroundColor: T.surface,
    marginBottom: 8,
  },
  templateOptionActive: {
    borderColor: 'rgba(168,85,247,0.4)',
    backgroundColor: 'rgba(168,85,247,0.06)',
  },
  templateRadio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: T.textHint,
    marginTop: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  templateRadioActive: { borderColor: T.primary },
  templateRadioDot:    { width: 7, height: 7, borderRadius: 4, backgroundColor: T.primary },
  templateText:        { flex: 1, fontSize: 12, color: T.textHint, lineHeight: 18 },
  templateTextActive:  { color: T.textPrimary },

  // Skills / chips (copied from profile.tsx)
  skillSegment:       { gap: 10 },
  skillSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  skillSegmentHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  skillSegmentLabel:  { fontSize: 11, fontWeight: '700', color: T.primary, letterSpacing: 0.4 },
  skillDivider:       { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 14 },
  chips:              { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip:               { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: T.surfaceHigh, borderWidth: 1, borderColor: T.border },
  chipHard:           { borderColor: 'rgba(168,85,247,0.35)', backgroundColor: 'rgba(168,85,247,0.09)' },
  chipSoft:           { borderColor: 'rgba(74,222,128,0.3)',  backgroundColor: 'rgba(74,222,128,0.07)' },
  chipText:           { fontSize: 12, fontWeight: '600', color: T.textSub },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.28)',
    backgroundColor: 'rgba(168,85,247,0.08)',
  },
  addBtnText: { fontSize: 11, fontWeight: '700', color: T.primary },
  addBtnPrimary: {
    marginTop: 10,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: T.primary,
  },
  addBtnTextSecondary: { fontSize: 14, fontWeight: '700', color: '#fff' },

  // Skill input
  skillInputRow:          { flexDirection: 'row', gap: 8, marginBottom: 10, alignItems: 'center' },
  skillTypeToggle:        {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: T.border,
    overflow: 'hidden',
    flexShrink: 0,
  },
  skillTypeOpt:           { paddingHorizontal: 10, paddingVertical: 11, backgroundColor: T.surfaceHigh },
  skillTypeOptActiveHard: { backgroundColor: 'rgba(168,85,247,0.12)' },
  skillTypeOptActiveSoft: { backgroundColor: 'rgba(74,222,128,0.12)' },
  skillTypeOptText:       { fontSize: 12, fontWeight: '600', color: T.textHint },
  skillAddBtn:            {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: T.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillEmptyHint: { fontSize: 11, color: T.textHint, marginBottom: 12, lineHeight: 16 },

  // Submit
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: T.primary,
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 16,
  },
  submitBtnDisabled: { opacity: 0.55 },
  submitBtnText:     { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
}); 