// Translation keys and values for multilingual support
export interface Translations {
  // Navigation
  nav: {
    home: string;
    adventures: string;
    travelGuide: string;
    memories: string;
    profile: string;
  };
  
  // Home page
  home: {
    welcome: string;
    readyForAdventure: string;
    startAdventure: string;
    discoverPlaces: string;
    travelGuide: string;
    getLiveGuidance: string;
    memories: string;
    viewMemories: string;
    adventuresCompleted: string;
    activeAdventures: string;
    questsCompleted: string;
    tripPlans: string;
    recentActivity: string;
    currentLevel: string;
    totalPoints: string;
    badgesEarned: string;
  };
  
  // Adventures
  adventures: {
    startYourAdventure: string;
    whereToExplore: string;
    enterLocation: string;
    nearbyAdventures: string;
    noAdventuresFound: string;
    tryLargerRadius: string;
    createAdventure: string;
    continueAdventure: string;
    completed: string;
    progress: string;
    inProgress: string;
    planned: string;
    memories: string;
    continueYourJourney: string;
    plannedAdventures: string;
    recentMemories: string;
    readyToExplore: string;
    startFirstAdventure: string;
    discoverAmazingPlaces: string;
  };
  
  // Travel Guide
  travelGuide: {
    planNewTrip: string;
    enterDestination: string;
    createTrip: string;
    yourTripPlans: string;
    travelMood: string;
    continueCurrentAdventure: string;
    setMoodAndPreferences: string;
    moodHelpsUs: string;
    noTripPlans: string;
    createFirstTrip: string;
    planning: string;
    active: string;
    completed: string;
    stops: string;
    visited: string;
    startGuide: string;
    pace: string;
    budget: string;
    mood: string;
    cameraRecognition: string;
    cameraRecognitionDesc: string;
    audioGuide: string;
    audioGuideDesc: string;
    voiceAssistantDesc: string;
    locationContext: string;
    locationContextDesc: string;
    arOverlay: string;
    arOverlayDesc: string;
    multilingualDesc: string;
    liveGuideMode: string;
    smartFeatures: string;
    startCameraRecognition: string;
    playAudioGuide: string;
    askAboutLocation: string;
    getCurrentContext: string;
    enableAR: string;
    switchLanguage: string;
  };
  
  // Moods
  moods: {
    relaxed: { label: string; description: string };
    adventurous: { label: string; description: string };
    cultural: { label: string; description: string };
    romantic: { label: string; description: string };
    family: { label: string; description: string };
    solo: { label: string; description: string };
  };
  
  // Voice & AI
  voice: {
    listening: string;
    processing: string;
    askYourGuide: string;
    talkWithAssistant: string;
    voiceRecognitionNotSupported: string;
    questAssistant: string;
    liveAssistant: string;
    giveHint: string;
    whereToGo: string;
    whatAmILookingFor: string;
    tellMeAboutPlace: string;
    whatsNearby: string;
    askForHelp: string;
  };

  // AI Assistant
  ai: {
    online: string;
    askAnything: string;
    welcomeMessage: string;
    historyResponse: string;
    foodResponse: string;
    directionResponse: string;
    cultureResponse: string;
    generalResponse: string;
    errorMessage: string;
    send: string;
    placeholder: string;
    scanObject: string;
    audioGuide: string;
    voiceChat: string;
    locationInfo: string;
    cameraStarted: string;
    audioPlaying: string;
    voiceActivated: string;
    currentLocationInfo: string;
    enableLocationServices: string;
  };
  
  // Common UI
  common: {
    go: string;
    cancel: string;
    save: string;
    close: string;
    back: string;
    next: string;
    done: string;
    loading: string;
    error: string;
    retry: string;
    language: string;
    settings: string;
    continue: string;
    completed: string;
    planned: string;
    level: string;
    directions: string;
  };
  
  // Distance options
  distance: {
    walking: string;
    cycling: string;
    driving: string;
    train: string;
    flight: string;
  };
}

export const translations: Record<string, Translations> = {
  en: {
    nav: {
      home: 'Home',
      adventures: 'Adventures',
      travelGuide: 'Travel Guide',
      memories: 'Memories',
      profile: 'Profile'
    },
    home: {
      welcome: 'Welcome back',
      readyForAdventure: 'Ready for your next adventure?',
      startAdventure: 'Start Adventure',
      discoverPlaces: 'Discover new places and stories',
      travelGuide: 'Travel Guide',
      getLiveGuidance: 'Get live guidance for your trips',
      memories: 'Memories',
      viewMemories: 'View your travel memories',
      adventuresCompleted: 'Adventures Completed',
      activeAdventures: 'Active Adventures',
      questsCompleted: 'Quests Completed',
      tripPlans: 'Trip Plans',
      recentActivity: 'Recent Activity',
      currentLevel: 'Current Level',
      totalPoints: 'Total Points',
      badgesEarned: 'Badges Earned'
    },
    adventures: {
      startYourAdventure: 'Start Your Adventure',
      whereToExplore: 'Where would you like to explore today?',
      enterLocation: 'Enter city or landmark...',
      nearbyAdventures: 'Nearby Adventures',
      noAdventuresFound: 'No adventures found within',
      tryLargerRadius: 'Try a larger radius',
      createAdventure: 'Create Adventure',
      continueAdventure: 'Continue Adventure',
      completed: 'Completed',
      progress: 'Progress',
      inProgress: 'In Progress',
      planned: 'Planned',
      memories: 'memories',
      continueYourJourney: 'Continue Your Journey',
      plannedAdventures: 'Planned Adventures',
      recentMemories: 'Recent Memories',
      readyToExplore: 'Ready to Explore?',
      startFirstAdventure: 'Start your first adventure',
      discoverAmazingPlaces: 'and discover amazing places!'
    },
    travelGuide: {
      planNewTrip: 'Plan New Trip',
      enterDestination: 'Enter destination (e.g., Paris, Tokyo, New York)',
      createTrip: 'Create Trip',
      yourTripPlans: 'Your Trip Plans',
      travelMood: 'What\'s your travel mood today?',
      continueCurrentAdventure: 'Continue Current Adventure',
      setMoodAndPreferences: 'Set your travel mood and preferences',
      moodHelpsUs: 'Your mood helps us suggest the perfect activities and pace for your trip',
      noTripPlans: 'No Trip Plans Yet',
      createFirstTrip: 'Create your first trip plan to get started!',
      planning: 'Planning',
      active: 'Active',
      completed: 'Completed',
      stops: 'Stops',
      visited: 'Visited',
      startGuide: 'Start Guide',
      pace: 'pace',
      budget: 'budget',
      mood: 'mood',
      cameraRecognition: 'Camera Recognition',
      cameraRecognitionDesc: 'AI-powered object and landmark recognition',
      audioGuide: 'Audio Guide',
      audioGuideDesc: 'Museum-quality narration for every location',
      voiceAssistantDesc: 'Ask questions about what you see',
      locationContext: 'Location Context',
      locationContextDesc: 'Real-time historical and cultural info',
      arOverlay: 'AR Information',
      arOverlayDesc: 'Augmented reality information overlay',
      multilingualDesc: 'Native language audio and text',
      liveGuideMode: 'Live Guide Mode',
      smartFeatures: 'Smart Guide Features',
      startCameraRecognition: 'Start Camera Recognition',
      playAudioGuide: 'Play Audio Guide',
      askAboutLocation: 'Ask About Location',
      getCurrentContext: 'Get Current Context',
      enableAR: 'Enable AR View',
      switchLanguage: 'Switch Language'
    },
    moods: {
      relaxed: { label: 'Relaxed', description: 'Calm, peaceful experiences' },
      adventurous: { label: 'Adventurous', description: 'Exciting, active exploration' },
      cultural: { label: 'Cultural', description: 'Museums, history, arts' },
      romantic: { label: 'Romantic', description: 'Intimate, scenic spots' },
      family: { label: 'Family', description: 'Kid-friendly activities' },
      solo: { label: 'Solo', description: 'Personal discovery journey' }
    },
    voice: {
      listening: 'Listening...',
      processing: 'Processing...',
      askYourGuide: 'Ask Your Guide',
      talkWithAssistant: 'Press the microphone to talk with your assistant',
      voiceRecognitionNotSupported: 'Voice recognition is not supported in your browser',
      questAssistant: 'Quest Assistant',
      liveAssistant: 'Live Assistant',
      giveHint: 'Give me a hint',
      whereToGo: 'Where should I go?',
      whatAmILookingFor: 'What am I looking for?',
      tellMeAboutPlace: 'Tell me about this place',
      whatsNearby: 'What\'s nearby?',
      askForHelp: 'Ask for help...'
    },
    ai: {
      online: 'Online',
      askAnything: 'Ask me anything about your location',
      welcomeMessage: 'Hello! I\'m Echoes, your AI travel assistant. How can I help you explore today?',
      historyResponse: '{info}',
      foodResponse: 'Based on your location, I recommend trying local specialties at nearby restaurants.',
      directionResponse: 'I can help you navigate! Select a destination and click "Get Directions".',
      cultureResponse: 'This region has rich cultural traditions including local festivals and arts.',
      generalResponse: 'I can help with history, culture, directions, attractions, and travel tips. What would you like to know?',
      errorMessage: 'Sorry, I encountered an error. Please try asking your question again.',
      send: 'Send',
      placeholder: 'Ask me about history, directions, culture, or anything...',
      scanObject: 'Scan Object',
      audioGuide: 'Audio Guide',
      voiceChat: 'Voice Chat',
      locationInfo: 'Location Info',
      cameraStarted: 'Camera recognition started. Point your camera at landmarks or objects.',
      audioPlaying: 'Playing audio guide for {name}. {info}',
      voiceActivated: 'Voice assistant activated. You can ask me questions about this area.',
      currentLocationInfo: 'You\'re currently at coordinates: {lat}, {lng}.',
      enableLocationServices: 'I need location access to provide context-aware assistance.'
    },
    common: {
      go: 'Go',
      cancel: 'Cancel',
      save: 'Save',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      done: 'Done',
      loading: 'Loading...',
      error: 'Error',
      retry: 'Retry',
      language: 'Language',
      settings: 'Settings',
      continue: 'Continue',
      completed: 'Completed',
      planned: 'Planned',
      level: 'Level',
      directions: 'Get Directions'
    },
    distance: {
      walking: 'Walking',
      cycling: 'Cycling',
      driving: 'Driving',
      train: 'Train',
      flight: 'Flight'
    }
  },
  
  hi: {
    nav: {
      home: 'घर',
      adventures: 'रोमांच',
      travelGuide: 'यात्रा गाइड',
      memories: 'यादें',
      profile: 'प्रोफ़ाइल'
    },
    home: {
      welcome: 'वापस स्वागत है',
      readyForAdventure: 'अपने अगले रोमांच के लिए तैयार हैं?',
      startAdventure: 'रोमांच शुरू करें',
      discoverPlaces: 'नई जगहों और कहानियों की खोज करें',
      travelGuide: 'यात्रा गाइड',
      getLiveGuidance: 'अपनी यात्राओं के लिए लाइव गाइडेंस प्राप्त करें',
      memories: 'यादें',
      viewMemories: 'अपनी यात्रा की यादें देखें',
      adventuresCompleted: 'पूरे किए गए रोमांच',
      activeAdventures: 'सक्रिय रोमांच',
      questsCompleted: 'पूरे किए गए क्वेस्ट',
      tripPlans: 'यात्रा योजनाएं',
      recentActivity: 'हाल की गतिविधि',
      currentLevel: 'वर्तमान स्तर',
      totalPoints: 'कुल अंक',
      badgesEarned: 'अर्जित बैज'
    },
    adventures: {
      startYourAdventure: 'अपना रोमांच शुरू करें',
      whereToExplore: 'आज आप कहाँ घूमना चाहेंगे?',
      enterLocation: 'शहर या स्थल दर्ज करें...',
      nearbyAdventures: 'आस-पास के रोमांच',
      noAdventuresFound: 'कोई रोमांच नहीं मिला',
      tryLargerRadius: 'बड़ा दायरा आज़माएं',
      createAdventure: 'रोमांच बनाएं',
      continueAdventure: 'रोमांच जारी रखें',
      completed: 'पूर्ण',
      progress: 'प्रगति',
      inProgress: 'चल रहा है',
      planned: 'योजनाबद्ध',
      memories: 'यादें',
      continueYourJourney: 'अपनी यात्रा जारी रखें',
      plannedAdventures: 'योजनाबद्ध रोमांच',
      recentMemories: 'हालिया यादें',
      readyToExplore: 'घूमने के लिए तैयार?',
      startFirstAdventure: 'अपना पहला रोमांच शुरू करें',
      discoverAmazingPlaces: 'और अद्भुत जगहों की खोज करें!'
    },
    travelGuide: {
      planNewTrip: 'नई यात्रा की योजना बनाएं',
      enterDestination: 'गंतव्य दर्ज करें (जैसे, पेरिस, टोक्यो, न्यूयॉर्क)',
      createTrip: 'यात्रा बनाएं',
      yourTripPlans: 'आपकी यात्रा योजनाएं',
      travelMood: 'आज आपका यात्रा मूड क्या है?',
      continueCurrentAdventure: 'वर्तमान रोमांच जारी रखें',
      setMoodAndPreferences: 'अपना यात्रा मूड और प्राथमिकताएं सेट करें',
      moodHelpsUs: 'आपका मूड हमें आपकी यात्रा के लिए सही गतिविधियां सुझाने में मदद करता है',
      noTripPlans: 'अभी तक कोई यात्रा योजना नहीं',
      createFirstTrip: 'शुरुआत करने के लिए अपनी पहली यात्रा योजना बनाएं!',
      planning: 'योजना बना रहे हैं',
      active: 'सक्रिय',
      completed: 'पूर्ण',
      stops: 'स्टॉप',
      visited: 'देखा गया',
      startGuide: 'गाइड शुरू करें',
      pace: 'गति',
      budget: 'बजट',
      mood: 'मूड',
      cameraRecognition: 'कैमरा पहचान',
      cameraRecognitionDesc: 'AI-संचालित वस्तु और स्थल पहचान',
      audioGuide: 'ऑडियो गाइड',
      audioGuideDesc: 'हर स्थान के लिए संग्रहालय गुणवत्ता की कथा',
      voiceAssistantDesc: 'जो आप देखते हैं उसके बारे में प्रश्न पूछें',
      locationContext: 'स्थान संदर्भ',
      locationContextDesc: 'वास्तविक समय ऐतिहासिक और सांस्कृतिक जानकारी',
      arOverlay: 'AR जानकारी',
      arOverlayDesc: 'संवर्धित वास्तविकता जानकारी परत',
      multilingualDesc: 'मूल भाषा ऑडियो और टेक्स्ट',
      liveGuideMode: 'लाइव गाइड मोड',
      smartFeatures: 'स्मार्ट गाइड सुविधाएं',
      startCameraRecognition: 'कैमरा पहचान शुरू करें',
      playAudioGuide: 'ऑडियो गाइड चलाएं',
      askAboutLocation: 'स्थान के बारे में पूछें',
      getCurrentContext: 'वर्तमान संदर्भ प्राप्त करें',
      enableAR: 'AR दृश्य सक्षम करें',
      switchLanguage: 'भाषा बदलें'
    },
    moods: {
      relaxed: { label: 'आरामदायक', description: 'शांत, शांतिपूर्ण अनुभव' },
      adventurous: { label: 'रोमांचक', description: 'रोमांचक, सक्रिय अन्वेषण' },
      cultural: { label: 'सांस्कृतिक', description: 'संग्रहालय, इतिहास, कला' },
      romantic: { label: 'रोमांटिक', description: 'अंतरंग, सुंदर स्थान' },
      family: { label: 'पारिवारिक', description: 'बच्चों के अनुकूल गतिविधियां' },
      solo: { label: 'अकेले', description: 'व्यक्तिगत खोज यात्रा' }
    },
    voice: {
      listening: 'सुन रहे हैं...',
      processing: 'प्रक्रिया कर रहे हैं...',
      askYourGuide: 'अपने गाइड से पूछें',
      talkWithAssistant: 'अपने सहायक से बात करने के लिए माइक्रोफोन दबाएं',
      voiceRecognitionNotSupported: 'आपके ब्राउज़र में वॉइस रिकग्निशन समर्थित नहीं है',
      questAssistant: 'क्वेस्ट सहायक',
      liveAssistant: 'लाइव सहायक',
      giveHint: 'मुझे संकेत दें',
      whereToGo: 'मुझे कहाँ जाना चाहिए?',
      whatAmILookingFor: 'मैं क्या खोज रहा हूँ?',
      tellMeAboutPlace: 'मुझे इस जगह के बारे में बताएं',
      whatsNearby: 'आस-पास क्या है?',
      askForHelp: 'मदद के लिए पूछें...'
    },
    ai: {
      online: 'ऑनलाइन',
      askAnything: 'अपने स्थान के बारे में मुझसे कुछ भी पूछें',
      welcomeMessage: 'नमस्ते! मैं Echoes, आपका AI यात्रा सहायक हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ?',
      historyResponse: '{info}',
      foodResponse: 'आपके स्थान के आधार पर, मैं आस-पास के रेस्तराँ में स्थानीय विशेषताओं की सिफारिश करता हूँ।',
      directionResponse: 'मैं आपको नेविगेट करने में मदद कर सकता हूँ! एक गंतव्य चुनें और "दिशा प्राप्त करें" पर क्लिक करें।',
      cultureResponse: 'इस क्षेत्र में समृद्ध सांस्कृतिक परंपराएं हैं जिनमें स्थानीय त्योहार और कलाएं शामिल हैं।',
      generalResponse: 'मैं इतिहास, संस्कृति, दिशा-निर्देश, आकर्षण और यात्रा सुझावों में मदद कर सकता हूँ। आप क्या जानना चाहेंगे?',
      errorMessage: 'खुशी है, मुझे एक त्रुटि का सामना करना पड़ा। कृपया अपना प्रश्न फिर से पूछने का प्रयास करें।',
      send: 'भेजें',
      placeholder: 'मुझसे इतिहास, दिशा-निर्देश, संस्कृति, या कुछ भी पूछें...',
      scanObject: 'ऑब्जेक्ट स्कैन करें',
      audioGuide: 'ऑडियो गाइड',
      voiceChat: 'वॉइस चैट',
      locationInfo: 'स्थान जानकारी',
      cameraStarted: 'कैमरा पहचान शुरू हुई। अपने कैमरे को स्थलचिह्न या वस्तुओं पर पॉइंट करें।',
      audioPlaying: '{name} के लिए ऑडियो गाइड चल रहा है। {info}',
      voiceActivated: 'वॉइस असिस्टेंट सक्रिय हो गया। आप मुझसे इस क्षेत्र के बारे में प्रश्न पूछ सकते हैं।',
      currentLocationInfo: 'आप वर्तमान में निर्देशांक पर हैं: {lat}, {lng}।',
      enableLocationServices: 'मुझे संदर्भ-जागरूक सहायता प्रदान करने के लिए स्थान पहुंच की आवश्यकता है।'
    },
    common: {
      go: 'जाएं',
      cancel: 'रद्द करें',
      save: 'सहेजें',
      close: 'बंद करें',
      back: 'वापस',
      next: 'अगला',
      done: 'हो गया',
      loading: 'लोड हो रहा है...',
      error: 'त्रुटि',
      retry: 'पुनः प्रयास करें',
      language: 'भाषा',
      settings: 'सेटिंग्स',
      continue: 'जारी रखें',
      completed: 'पूर्ण',
      planned: 'योजनाबद्ध',
      level: 'स्तर',
      directions: 'दिशा प्राप्त करें'
    },
    distance: {
      walking: 'पैदल',
      cycling: 'साइकिल',
      driving: 'ड्राइविंग',
      train: 'ट्रेन',
      flight: 'फ्लाइट'
    }
  }
};

export const useTranslations = (language: string) => {
  // For languages without full translations, fall back to English
  // Currently fully supported: English (en), Hindi (hi)  
  // Other languages (es, fr, de, ja, ko, pt, ar, zh) fall back to English
  return translations[language] || translations.en;
};
