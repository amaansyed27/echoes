import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useTranslations } from '../services/translations';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import {
  generateTripPlan,
  TripPlan,
  TripStop
} from '../services/geminiService';
import { geocodeLocation } from '../services/geocodingService';

interface TravelGuideProps {
  userLocation?: { latitude: number; longitude: number } | null;
  userProfile?: any;
  activeAdventure?: any;
  onCreateAdventure?: (destination: string) => void;
}

interface LiveGuideFeature {
  id: string;
  icon: string;
  title: string;
  description: string;
  isActive: boolean;
}

const TravelGuide: React.FC<TravelGuideProps> = ({
  userLocation,
  userProfile,
  activeAdventure,
  onCreateAdventure
}) => {
  const { selectedLanguage } = useLanguage();
  const t = useTranslations(selectedLanguage.code);
  
  // Speech functionality
  const speechRecognition = useSpeechRecognition(selectedLanguage.code === 'hi' ? 'hi-IN' : 'en-US');
  const speechSynthesis = useSpeechSynthesis(selectedLanguage.code);
  
  const [activeMode, setActiveMode] = useState<'plan' | 'guide' | 'edit'>('plan');
  const [tripPlans, setTripPlans] = useState<TripPlan[]>(() => {
    const saved = localStorage.getItem('tripPlans');
    return saved ? JSON.parse(saved) : [];
  });
  const [activePlan, setActivePlan] = useState<TripPlan | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [currentInstruction, setCurrentInstruction] = useState('');
  const [newDestination, setNewDestination] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);
  const [selectedMood, setSelectedMood] = useState<TripPlan['preferences']['mood']>('adventurous');

  // Enhanced trip editing state
  const [editingPlan, setEditingPlan] = useState<TripPlan | null>(null);
  const [recommendedStops, setRecommendedStops] = useState<TripStop[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [newStopName, setNewStopName] = useState('');
  const [isAddingStop, setIsAddingStop] = useState(false);
  const [tripDuration, setTripDuration] = useState(3);
  const [budget, setBudget] = useState<'low' | 'medium' | 'high'>('medium');

  // Live Guide Mode
  const [currentStop, setCurrentStop] = useState<TripStop | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognizedObjects, setRecognizedObjects] = useState<string[]>([]);
  const [showCameraView, setShowCameraView] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Live AI Assistant
  const [aiResponse, setAiResponse] = useState<string>('');
  const [aiQuestion, setAiQuestion] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Update AI welcome message when language changes
  useEffect(() => {
    if (activePlan && activeMode === 'guide') {
      const welcomeMsg = t.ai.welcomeMessage.replace('{destination}', activePlan.destination);
      setAiResponse(welcomeMsg);
    }
  }, [selectedLanguage.code, activePlan, activeMode, t.ai.welcomeMessage]);

  // Handle speech recognition results
  useEffect(() => {
    if (speechRecognition.finalTranscript) {
      const spokenText = speechRecognition.finalTranscript.trim();
      if (spokenText) {
        // Set the spoken text as the question and process it
        setAiQuestion(spokenText);
        setCurrentInstruction(selectedLanguage.code === 'hi' 
          ? `🎤 मैंने सुना: "${spokenText}"` 
          : `🎤 I heard: "${spokenText}"`);
        
        // Auto-process the spoken question
        setTimeout(() => {
          handleAiQuestionWithText(spokenText);
        }, 1000);
      } else {
        // No text detected
        setCurrentInstruction(selectedLanguage.code === 'hi' 
          ? '🔇 कुछ नहीं सुना गया, कृपया फिर से कोशिश करें' 
          : '🔇 Nothing heard, please try again');
      }
      speechRecognition.resetTranscript();
      setIsListening(false);
    }
  }, [speechRecognition.finalTranscript, selectedLanguage.code]);

  // Handle speech recognition errors
  useEffect(() => {
    if (speechRecognition.error) {
      let errorMessage = '';
      switch (speechRecognition.error) {
        case 'not-allowed':
          errorMessage = selectedLanguage.code === 'hi' 
            ? '🎤 कृपया माइक्रोफोन की अनुमति दें' 
            : '🎤 Please allow microphone access';
          break;
        case 'no-speech':
          errorMessage = selectedLanguage.code === 'hi' 
            ? '🔇 कोई आवाज़ नहीं सुनी गई, कृपया फिर से कोशिश करें' 
            : '🔇 No speech detected, please try again';
          break;
        case 'aborted':
          errorMessage = selectedLanguage.code === 'hi' 
            ? '⏹️ वॉइस रिकग्निशन रद्द कर दिया गया' 
            : '⏹️ Voice recognition was cancelled';
          break;
        case 'network':
          errorMessage = selectedLanguage.code === 'hi' 
            ? '🌐 नेटवर्क त्रुटि, कृपया फिर से कोशिश करें' 
            : '🌐 Network error, please try again';
          break;
        default:
          errorMessage = selectedLanguage.code === 'hi' 
            ? `❌ वॉइस त्रुटि: ${speechRecognition.error}` 
            : `❌ Speech error: ${speechRecognition.error}`;
      }
      setCurrentInstruction(errorMessage);
      setIsListening(false);
      
      // Clear error after 3 seconds
      setTimeout(() => {
        setCurrentInstruction('');
      }, 3000);
    }
  }, [speechRecognition.error, selectedLanguage.code]);

  // Update listening state from speech recognition
  useEffect(() => {
    setIsListening(speechRecognition.isListening);
  }, [speechRecognition.isListening]);

  // Enhanced Live Guide Features
  const liveGuideFeatures: LiveGuideFeature[] = [
    {
      id: 'camera-recognition',
      icon: '📷',
      title: 'Camera Recognition',
      description: 'AI identifies landmarks and objects',
      isActive: isRecognizing
    },
    {
      id: 'audio-guide',
      icon: '🎧',
      title: 'Audio Guide',
      description: 'Museum-quality narration',
      isActive: isPlayingAudio
    },
    {
      id: 'voice-assistant',
      icon: '🗣️',
      title: 'Voice Assistant',
      description: 'Ask questions about locations',
      isActive: isListening
    },
    {
      id: 'location-context',
      icon: '📍',
      title: 'Location Context',
      description: 'Real-time historical information',
      isActive: !!userLocation
    },
    {
      id: 'ar-overlay',
      icon: '🥽',
      title: 'AR Overlay',
      description: 'Augmented reality information',
      isActive: false
    },
    {
      id: 'multilingual',
      icon: '🌐',
      title: 'Multilingual',
      description: `Active: ${selectedLanguage.nativeName}`,
      isActive: true
    }
  ];

  const startCameraRecognition = async () => {
    setIsRecognizing(true);
    setShowCameraView(true);
    setCurrentInstruction(t.ai.cameraStarted);
    
    try {
      // Request camera access with live preview
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      setCameraStream(stream);
      
      // Display live preview
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      setCurrentInstruction(selectedLanguage.code === 'hi' 
        ? '📸 कैमरा तैयार है! "कैप्चर" बटन दबाएं' 
        : '📸 Camera ready! Tap "Capture" to analyze');
      
    } catch (error) {
      console.error('Camera access error:', error);
      setCurrentInstruction(selectedLanguage.code === 'hi' 
        ? '❌ कैमरा एक्सेस नहीं मिला। कृपया अनुमति दें और फिर कोशिश करें।' 
        : '❌ Camera access denied. Please allow camera permission and try again.');
      setIsRecognizing(false);
      setShowCameraView(false);
    }
  };

  const captureAndAnalyze = async () => {
    if (!cameraStream || !videoRef.current) return;
    
    setCurrentInstruction(selectedLanguage.code === 'hi' 
      ? '🤖 छवि का विश्लेषण कर रहे हैं...' 
      : '🤖 Analyzing image...');
    
    // Create canvas to capture frame
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    if (context) {
      context.drawImage(videoRef.current, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      try {
        // Import and use Gemini vision analysis
        const { analyzeImageWithGemini } = await import('../services/geminiService');
        
        const analysis = await analyzeImageWithGemini(imageData, 
          userLocation ? { latitude: userLocation.latitude, longitude: userLocation.longitude } : undefined);
        
        // Extract key objects/features from analysis for display
        const features = extractKeyFeatures(analysis);
        setRecognizedObjects(features);
        setCurrentInstruction(`🏛️ ${analysis}`);
        
        // Stop camera after analysis
        stopCamera();
        
      } catch (error) {
        console.error('Vision analysis error:', error);
        setCurrentInstruction(selectedLanguage.code === 'hi' 
          ? '❌ विश्लेषण में त्रुटि। कृपया फिर से कोशिश करें।' 
          : '❌ Analysis failed. Please try again.');
      }
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCameraView(false);
    setIsRecognizing(false);
  };

  // Helper function to extract key features for visual display
  const extractKeyFeatures = (analysis: string): string[] => {
    const features: string[] = [];
    const text = analysis.toLowerCase();
    
    // Common architectural and cultural terms to extract
    const keywords = [
      'architecture', 'building', 'monument', 'temple', 'church', 'palace',
      'historic', 'cultural', 'heritage', 'landmark', 'sculpture', 'art',
      'colonial', 'modern', 'traditional', 'ancient', 'classical', 'baroque',
      'garden', 'park', 'fountain', 'statue', 'tower', 'dome', 'arch'
    ];
    
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        features.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
      }
    });
    
    return features.slice(0, 5); // Return max 5 features
  };

  const playAudioGuide = (stop: TripStop) => {
    setIsPlayingAudio(true);
    const message = t.ai.audioPlaying.replace('{name}', stop.name).replace('{info}', stop.historicalInfo || 'Enjoy the immersive narration about this amazing location.');
    setCurrentInstruction(message);
    
    // Speak the audio guide using text-to-speech
    if (speechSynthesis.isSupported) {
      const audioContent = `${stop.name}. ${stop.historicalInfo || 'This is an amazing location with rich history and cultural significance. Take your time to explore and appreciate the unique features of this place.'}`;
      
      speechSynthesis.speak({
        text: audioContent,
        onEnd: () => {
          setIsPlayingAudio(false);
          setCurrentInstruction('🎧 Audio guide completed. Would you like to hear about nearby attractions?');
        }
      });
    } else {
      // Fallback to simulation if TTS not available
      setTimeout(() => {
        setIsPlayingAudio(false);
        setCurrentInstruction('🎧 Audio guide completed. Would you like to hear about nearby attractions?');
      }, 5000);
    }
  };

  const startVoiceAssistant = async () => {
    if (!speechRecognition.isSupported) {
      setCurrentInstruction(t.voice.voiceRecognitionNotSupported);
      return;
    }

    if (speechRecognition.isListening) {
      speechRecognition.stopListening();
      setCurrentInstruction(selectedLanguage.code === 'hi' ? '⏹️ वॉइस असिस्टेंट बंद किया गया' : '⏹️ Voice assistant stopped');
      return;
    }

    // Check for microphone permission first
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
    } catch (permissionError) {
      setCurrentInstruction(selectedLanguage.code === 'hi' 
        ? '🎤 माइक्रोफोन की अनुमति आवश्यक है। कृपया ब्राउज़र सेटिंग्स में माइक्रोफोन की अनुमति दें।'
        : '🎤 Microphone permission required. Please allow microphone access in browser settings.');
      return;
    }

    setIsListening(true);
    setCurrentInstruction(selectedLanguage.code === 'hi' 
      ? '🎤 बोलें... मैं सुन रहा हूं' 
      : '🎤 Speak now... I\'m listening');
    
    // Start listening with improved configuration
    speechRecognition.startListening({
      continuous: false,
      interimResults: false, // Changed to false to reduce noise
      lang: selectedLanguage.code === 'hi' ? 'hi-IN' : 'en-US'
    });

    // Auto-stop after 10 seconds to prevent hanging
    setTimeout(() => {
      if (speechRecognition.isListening) {
        speechRecognition.stopListening();
        setCurrentInstruction(selectedLanguage.code === 'hi' 
          ? '⏰ समय समाप्त - कृपया फिर से कोशिश करें' 
          : '⏰ Timeout - please try again');
        setIsListening(false);
      }
    }, 10000);
  };

  const handleAiQuestion = async () => {
    if (!aiQuestion.trim()) return;
    await handleAiQuestionWithText(aiQuestion);
  };

  // Separate function to handle AI questions with spoken text
  const handleAiQuestionWithText = async (questionText: string) => {
    if (!questionText.trim()) return;

    setIsLoadingAi(true);
    try {
      // Analyze question and provide response in selected language
      let response = '';
      const question = questionText.toLowerCase();
      
      if (question.includes('history') || question.includes('historical') || question.includes('इतिहास')) {
        response = currentStop 
          ? t.ai.historyResponse.replace('{info}', currentStop.historicalInfo || `${currentStop.name} has a rich history dating back centuries. This location has been significant for its cultural and architectural importance.`)
          : t.ai.historyResponse.replace('{info}', 'This area has fascinating historical significance. Enable location services or select a stop to get specific historical information.');
      } else if (question.includes('food') || question.includes('restaurant') || question.includes('खाना') || question.includes('रेस्तराँ')) {
        response = t.ai.foodResponse;
      } else if (question.includes('direction') || question.includes('how to get') || question.includes('दिशा') || question.includes('कैसे जाएं')) {
        response = t.ai.directionResponse;
      } else if (question.includes('culture') || question.includes('tradition') || question.includes('संस्कृति') || question.includes('परंपरा')) {
        response = t.ai.cultureResponse;
      } else {
        response = t.ai.generalResponse.replace('{question}', questionText);
      }

      setAiResponse(response);
      
      // Speak the response using text-to-speech
      if (speechSynthesis.isSupported) {
        speechSynthesis.speak({
          text: response,
          onEnd: () => {
            console.log('AI response spoken');
          }
        });
      }
      
      setAiQuestion('');
    } catch (error) {
      console.error('AI question error:', error);
      const errorMsg = t.ai.errorMessage;
      setAiResponse(errorMsg);
      
      // Speak error message
      if (speechSynthesis.isSupported) {
        speechSynthesis.speak({
          text: errorMsg,
          onEnd: () => console.log('Error message spoken')
        });
      }
    } finally {
      setIsLoadingAi(false);
    }
  };

  const createNewTrip = async () => {
    if (!newDestination.trim()) return;

    setIsGenerating(true);
    setCurrentInstruction(`🤖 ${t.common.loading} Generating your personalized trip plan...`);

    try {
      // Generate AI-powered trip plan
      const aiTripPlan = await generateTripPlan(
        newDestination,
        {
          mood: selectedMood,
          pace: 'moderate',
          interests: userProfile?.interests || [],
          budget: budget,
          duration: tripDuration
        },
        userLocation ? { latitude: userLocation.latitude, longitude: userLocation.longitude } : undefined,
        selectedLanguage.code
      );

      const newTrip: TripPlan = {
        id: Date.now().toString(),
        name: aiTripPlan.name,
        destination: newDestination,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        stops: aiTripPlan.stops,
        status: 'planning',
        preferences: aiTripPlan.preferences
      };

      const updatedPlans = [...tripPlans, newTrip];
      setTripPlans(updatedPlans);
      localStorage.setItem('tripPlans', JSON.stringify(updatedPlans));
      setNewDestination('');
      setShowPreferences(false);
      setCurrentInstruction(`✅ Trip plan created! Found ${aiTripPlan.stops.length} amazing stops for your ${selectedMood} adventure.`);
    } catch (error) {
      console.error('Failed to create AI trip plan:', error);
      setCurrentInstruction('❌ Failed to generate trip plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Enhanced trip editing functions
  const startEditingTrip = async (plan: TripPlan) => {
    setEditingPlan(plan);
    setActiveMode('edit');
    await loadRecommendedStops(plan.destination);
  };

  const loadRecommendedStops = async (destination: string) => {
    setIsLoadingRecommendations(true);
    try {
      // Mock recommendations for now
      const mockRecommendations: TripStop[] = [
        {
          id: `mock-${Date.now()}-1`,
          name: `Popular attraction in ${destination}`,
          address: `Main area, ${destination}`,
          latitude: 0,
          longitude: 0,
          type: 'attraction',
          estimatedTime: 120,
          notes: 'AI-recommended must-visit attraction',
          visited: false,
          historicalInfo: 'Rich historical significance and cultural importance'
        },
        {
          id: `mock-${Date.now()}-2`,
          name: `Local restaurant in ${destination}`,
          address: `Food district, ${destination}`,
          latitude: 0,
          longitude: 0,
          type: 'restaurant',
          estimatedTime: 90,
          notes: 'Highly recommended local cuisine',
          visited: false
        },
        {
          id: `mock-${Date.now()}-3`,
          name: `Cultural site in ${destination}`,
          address: `Cultural quarter, ${destination}`,
          latitude: 0,
          longitude: 0,
          type: 'attraction',
          estimatedTime: 150,
          notes: 'Experience local culture and traditions',
          visited: false,
          historicalInfo: 'Important cultural landmark with centuries of history'
        }
      ];
      
      setRecommendedStops(mockRecommendations);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      setCurrentInstruction('❌ Failed to load recommendations. Please try again.');
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const addRecommendedStop = (stop: TripStop) => {
    if (!editingPlan) return;

    const updatedPlan = {
      ...editingPlan,
      stops: [...editingPlan.stops, { ...stop, id: Date.now().toString() }]
    };
    
    setEditingPlan(updatedPlan);
    updateTripPlan(updatedPlan);
    setCurrentInstruction(`✅ Added ${stop.name} to your trip!`);
  };

  const addCustomStop = async () => {
    if (!newStopName.trim() || !editingPlan) return;

    setIsAddingStop(true);
    try {
      setCurrentInstruction('🔍 Looking up location coordinates...');
      
      // Try to get real coordinates for the location
      const geocodedLocation = await geocodeLocation(newStopName, editingPlan.destination);
      
      const customStop: TripStop = {
        id: Date.now().toString(),
        name: newStopName,
        type: 'attraction',
        address: geocodedLocation?.formattedAddress || `${newStopName}, ${editingPlan.destination}`,
        latitude: geocodedLocation?.latitude || 0,
        longitude: geocodedLocation?.longitude || 0,
        estimatedTime: 60,
        notes: `Visit ${newStopName}`,
        visited: false
      };
      
      addRecommendedStop(customStop);
      
      if (geocodedLocation) {
        setCurrentInstruction(`✅ Added ${newStopName} to your trip with coordinates!`);
      } else {
        setCurrentInstruction(`✅ Added ${newStopName} to your trip (coordinates may need manual update)`);
      }
      
      setNewStopName('');
    } catch (error) {
      console.error('Failed to add custom stop:', error);
      setCurrentInstruction('❌ Failed to add stop. Please try again.');
    } finally {
      setIsAddingStop(false);
    }
  };

  const removeStop = (stopId: string) => {
    if (!editingPlan) return;

    const updatedPlan = {
      ...editingPlan,
      stops: editingPlan.stops.filter(stop => stop.id !== stopId)
    };
    
    setEditingPlan(updatedPlan);
    updateTripPlan(updatedPlan);
    setCurrentInstruction('🗑️ Stop removed from your trip.');
  };

  const updateTripPlan = (updatedPlan: TripPlan) => {
    const updatedPlans = tripPlans.map(p => 
      p.id === updatedPlan.id ? updatedPlan : p
    );
    setTripPlans(updatedPlans);
    localStorage.setItem('tripPlans', JSON.stringify(updatedPlans));
  };

  const finishEditing = () => {
    setActiveMode('plan');
    setEditingPlan(null);
    setRecommendedStops([]);
    setNewStopName('');
    setCurrentInstruction('');
  };

  const createAdventureFromTrip = (destination: string) => {
    if (onCreateAdventure) {
      onCreateAdventure(destination);
    }
  };

  const createAdventureFromStop = (stop: TripStop) => {
    if (onCreateAdventure) {
      // Create adventure with stop name and location info
      const adventureDestination = `${stop.name}, ${activePlan?.destination || ''}`;
      onCreateAdventure(adventureDestination);
      
      // Show confirmation message
      setCurrentInstruction(selectedLanguage.code === 'hi' 
        ? `🎯 ${stop.name} के लिए एडवेंचर बनाया गया!` 
        : `🎯 Adventure created for ${stop.name}!`);
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setCurrentInstruction('');
      }, 3000);
    }
  };

  const moodOptions = [
    { value: 'relaxed', emoji: '😌', label: 'Relaxed', description: 'Calm, peaceful experiences' },
    { value: 'adventurous', emoji: '🚀', label: 'Adventurous', description: 'Exciting, active exploration' },
    { value: 'cultural', emoji: '🎭', label: 'Cultural', description: 'Museums, history, arts' },
    { value: 'romantic', emoji: '💕', label: 'Romantic', description: 'Intimate, scenic spots' },
    { value: 'family', emoji: '👨‍👩‍👧‍👦', label: 'Family', description: 'Kid-friendly activities' },
    { value: 'solo', emoji: '🧘', label: 'Solo', description: 'Personal discovery journey' }
  ] as const;

  const startGuideMode = (plan: TripPlan) => {
    setActivePlan(plan);
    setActiveMode('guide');
    setCurrentStop(plan.stops[0] || null);
    
    // Set welcome message for AI assistant in selected language
    const welcomeMsg = t.ai.welcomeMessage.replace('{destination}', plan.destination);
    setAiResponse(welcomeMsg);
    
    // Update plan status to active
    const updatedPlans = tripPlans.map(p => 
      p.id === plan.id ? { ...p, status: 'active' as const } : p
    );
    setTripPlans(updatedPlans);
    localStorage.setItem('tripPlans', JSON.stringify(updatedPlans));
  };

  const getDirectionsToStop = (stop: TripStop) => {
    // Check if the stop has valid coordinates
    if (!stop.latitude || !stop.longitude || (stop.latitude === 0 && stop.longitude === 0)) {
      alert(`❌ No coordinates available for ${stop.name}. Please update the location coordinates first.`);
      return;
    }

    if (userLocation) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${stop.latitude},${stop.longitude}&travelmode=walking`;
      window.open(url, '_blank');
    } else {
      // If no user location, just open the destination on maps
      const url = `https://www.google.com/maps/search/?api=1&query=${stop.latitude},${stop.longitude}`;
      window.open(url, '_blank');
    }
  };

  const markStopVisited = (stopId: string) => {
    if (!activePlan) return;

    const updatedStops = activePlan.stops.map(stop => 
      stop.id === stopId ? { ...stop, visited: true } : stop
    );
    
    const updatedPlan = { ...activePlan, stops: updatedStops };
    setActivePlan(updatedPlan);

    // Move to next unvisited stop
    const nextStop = updatedStops.find(stop => !stop.visited);
    setCurrentStop(nextStop || null);

    // Update in storage
    const updatedPlans = tripPlans.map(p => 
      p.id === activePlan.id ? updatedPlan : p
    );
    setTripPlans(updatedPlans);
    localStorage.setItem('tripPlans', JSON.stringify(updatedPlans));
  };

  const getStopIcon = (type: string) => {
    switch (type) {
      case 'restaurant': return '🍽️';
      case 'attraction': return '🏛️';
      case 'hotel': return '🏨';
      case 'activity': return '🎯';
      case 'transport': return '🚇';
      default: return '📍';
    }
  };

  // Trip Edit Mode UI
  if (activeMode === 'edit' && editingPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-6 pb-24 max-w-4xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <button
              onClick={finishEditing}
              className="flex items-center space-x-2 text-blue-600 font-medium self-start"
            >
              <span>←</span>
              <span>Back</span>
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 text-center flex-1">
              Edit Trip: {editingPlan.name}
            </h1>
            <button
              onClick={finishEditing}
              className="bg-green-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-600 transition-colors"
            >
              ✅ Done Editing
            </button>
          </div>

          {/* Add Custom Stop */}
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Your Own Stop</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newStopName}
                onChange={(e) => setNewStopName(e.target.value)}
                placeholder="Enter place name (e.g., 'Red Fort', 'Local restaurant', 'Shopping market')"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && addCustomStop()}
              />
              <button
                onClick={addCustomStop}
                disabled={!newStopName.trim() || isAddingStop}
                className="bg-blue-500 text-white px-6 py-3 font-medium hover:bg-blue-600 transition-colors rounded-xl disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isAddingStop ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <span>➕</span>
                    <span>Add Stop</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Current Stops */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Your Trip Stops ({editingPlan.stops.length})
            </h2>
            
            {editingPlan.stops.length > 0 ? (
              <div className="space-y-3">
                {editingPlan.stops.map((stop, index) => (
                  <div key={stop.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl">
                    <span className="text-sm font-medium text-gray-500 w-8">#{index + 1}</span>
                    <span className="text-xl">{getStopIcon(stop.type)}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{stop.name}</h3>
                      <p className="text-sm text-gray-600 truncate">{stop.address}</p>
                    </div>
                    <button
                      onClick={() => removeStop(stop.id)}
                      className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📍</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No stops added yet</h3>
                <p className="text-gray-600">Add stops to start planning your trip</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (activeMode === 'guide' && activePlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-6 pb-24 max-w-4xl">
          {/* Header - Responsive */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <button
              onClick={() => setActiveMode('plan')}
              className="flex items-center space-x-2 text-blue-600 font-medium self-start"
            >
              <span>←</span>
              <span>Back</span>
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 text-center flex-1">{activePlan.name}</h1>
            <div className="w-0 sm:w-20"></div>
          </div>

          {/* Live Guide Mode Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold mb-2">🚀 Live Guide Mode</h2>
                <p className="text-blue-100 text-sm">Museum-quality guidance powered by AI</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Active</span>
              </div>
            </div>
          </div>

          {/* Live AI Assistant - Simplified Interface */}
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-lg">🤖</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{t.voice.liveAssistant}</h3>
                <p className="text-sm text-gray-600">{t.ai.askAnything}</p>
                {!speechRecognition.isSupported && (
                  <p className="text-xs text-amber-600 mt-1">⚠️ {t.voice.voiceRecognitionNotSupported}</p>
                )}
                {speechRecognition.isSupported && (
                  <p className="text-xs text-blue-600 mt-1">
                    💡 {selectedLanguage.code === 'hi' 
                      ? 'वॉइस चैट बटन दबाकर बोलें या टेक्स्ट टाइप करें' 
                      : 'Press Voice Chat button to speak or type your question'}
                  </p>
                )}
              </div>
              <div className="ml-auto flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600 font-medium">{t.ai.online}</span>
              </div>
            </div>

            {/* AI Chat Interface */}
            <div className="space-y-4">
              {/* Current Instruction/Status */}
              {currentInstruction && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <p className="text-blue-800 text-sm font-medium">{currentInstruction}</p>
                </div>
              )}

              {/* Assistant Response Area */}
              {aiResponse && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm">
                      AI
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 text-sm leading-relaxed">{aiResponse}</p>
                      {speechSynthesis.isSpeaking && (
                        <div className="mt-2 flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                          <span className="text-xs text-purple-600">
                            {selectedLanguage.code === 'hi' ? 'बोल रहे हैं...' : 'Speaking...'}
                          </span>
                          <button
                            onClick={() => speechSynthesis.cancel()}
                            className="text-xs text-purple-600 hover:text-purple-800 underline"
                          >
                            {selectedLanguage.code === 'hi' ? 'रोकें' : 'Stop'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Action Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={startCameraRecognition}
                  className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl p-3 transition-colors text-center"
                >
                  <div className="text-lg mb-1">📷</div>
                  <span className="text-xs text-blue-700 font-medium">{t.ai.scanObject}</span>
                </button>

                <button
                  onClick={() => currentStop && playAudioGuide(currentStop)}
                  className={`bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl p-3 transition-colors text-center ${
                    isPlayingAudio ? 'bg-green-200 animate-pulse' : ''
                  }`}
                  disabled={!currentStop}
                >
                  <div className="text-lg mb-1">{isPlayingAudio ? '🔊' : '🎧'}</div>
                  <span className="text-xs text-green-700 font-medium">
                    {isPlayingAudio ? (selectedLanguage.code === 'hi' ? 'चल रहा है...' : 'Playing...') : t.ai.audioGuide}
                  </span>
                </button>

                <button
                  onClick={startVoiceAssistant}
                  className={`bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl p-3 transition-colors text-center ${
                    isListening ? 'bg-purple-200 animate-pulse border-purple-400' : ''
                  }`}
                  disabled={isLoadingAi}
                >
                  <div className="text-lg mb-1">
                    {isListening ? '🎤' : speechRecognition.isSupported ? '🗣️' : '❌'}
                  </div>
                  <span className="text-xs text-purple-700 font-medium">
                    {isListening 
                      ? (selectedLanguage.code === 'hi' ? 'सुन रहे हैं...' : 'Listening...') 
                      : speechRecognition.isSupported 
                        ? t.ai.voiceChat 
                        : (selectedLanguage.code === 'hi' ? 'समर्थित नहीं' : 'Not supported')
                    }
                  </span>
                </button>

                <button
                  onClick={() => {
                    if (userLocation) {
                      const message = t.ai.currentLocationInfo
                        .replace('{lat}', userLocation.latitude.toFixed(4))
                        .replace('{lng}', userLocation.longitude.toFixed(4));
                      setAiResponse(message);
                    } else {
                      setAiResponse(t.ai.enableLocationServices);
                    }
                  }}
                  className="bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl p-3 transition-colors text-center"
                >
                  <div className="text-lg mb-1">🌍</div>
                  <span className="text-xs text-orange-700 font-medium">{t.ai.locationInfo}</span>
                </button>
              </div>

              {/* Camera Preview Modal */}
              {showCameraView && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl w-full max-w-md mx-auto overflow-hidden shadow-xl">
                    <div className="relative">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-64 object-cover bg-black"
                      />
                      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                        <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                          {selectedLanguage.code === 'hi' ? '📷 लाइव कैमरा' : '📷 Live Camera'}
                        </span>
                        <button
                          onClick={stopCamera}
                          className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-3">
                      <div className="flex space-x-3">
                        <button
                          onClick={captureAndAnalyze}
                          className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors"
                        >
                          📸 {selectedLanguage.code === 'hi' ? 'कैप्चर और विश्लेषण करें' : 'Capture & Analyze'}
                        </button>
                        <button
                          onClick={stopCamera}
                          className="px-6 bg-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                        >
                          {selectedLanguage.code === 'hi' ? 'रद्द करें' : 'Cancel'}
                        </button>
                      </div>
                      
                      <p className="text-sm text-gray-600 text-center">
                        {selectedLanguage.code === 'hi' 
                          ? 'वस्तु को फ्रेम में लाएं और कैप्चर बटन दबाएं' 
                          : 'Frame the object and tap capture button'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Text Input for Questions */}
              <div className="flex space-x-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    placeholder={t.ai.placeholder}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && handleAiQuestion()}
                  />
                </div>
                <button
                  onClick={handleAiQuestion}
                  disabled={!aiQuestion.trim() || isLoadingAi}
                  className="bg-purple-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoadingAi ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <span>{t.ai.send}</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Current Location & Context - Enhanced */}
          {currentStop ? (
            <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Location Info */}
                <div className="flex-1">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                      {getStopIcon(currentStop.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-lg mb-1">{currentStop.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{currentStop.address}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs">
                          📍 {currentStop.type}
                        </span>
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs">
                          ⏱️ {currentStop.estimatedTime} min
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Historical Context */}
                  {currentStop.historicalInfo && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-amber-800 mb-2">📚 Historical Context</h4>
                      <p className="text-amber-700 text-sm">{currentStop.historicalInfo}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons - Responsive Stack */}
                <div className="lg:w-64 space-y-3">
                  <button
                    onClick={() => getDirectionsToStop(currentStop)}
                    className="w-full bg-blue-500 text-white px-4 py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>🧭</span>
                    <span>Get Directions</span>
                  </button>
                  
                  <button
                    onClick={() => playAudioGuide(currentStop)}
                    className="w-full bg-purple-500 text-white px-4 py-3 rounded-xl font-medium hover:bg-purple-600 transition-colors flex items-center justify-center space-x-2"
                    disabled={isPlayingAudio}
                  >
                    <span>🎧</span>
                    <span>{isPlayingAudio ? 'Playing...' : 'Play Audio Guide'}</span>
                  </button>
                  
                  <button
                    onClick={() => markStopVisited(currentStop.id)}
                    className="w-full bg-green-500 text-white px-4 py-3 rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>✅</span>
                    <span>Mark Visited</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Trip Completed!</h3>
              <p className="text-gray-600">You've visited all planned stops.</p>
            </div>
          )}

          {/* AI Assistant Response */}
          {currentInstruction && (
            <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  AI
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Your Smart Guide</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">{currentInstruction}</p>
                  {recognizedObjects.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {recognizedObjects.map((object, index) => (
                        <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs">
                          {object}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Trip Progress - Responsive */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Trip Progress</h3>
            <div className="space-y-3">
              {activePlan.stops.map((stop) => (
                <div
                  key={stop.id}
                  className={`flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 p-4 rounded-xl border-2 transition-all ${
                    stop.visited 
                      ? 'bg-green-50 border-green-200' 
                      : currentStop?.id === stop.id
                      ? 'bg-blue-50 border-blue-200'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <span className="text-lg flex-shrink-0">{getStopIcon(stop.type)}</span>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-gray-900 truncate">{stop.name}</h4>
                      <p className="text-sm text-gray-600 truncate">{stop.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end space-x-2 flex-wrap gap-2">
                    <button
                      onClick={() => createAdventureFromStop(stop)}
                      className="px-3 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-md flex items-center space-x-1 hover:scale-105 transform"
                      title={selectedLanguage.code === 'hi' ? 'इस स्थान के लिए एडवेंचर शुरू करें' : 'Start adventure for this place'}
                    >
                      <span>🎯</span>
                      <span className="hidden sm:inline">{selectedLanguage.code === 'hi' ? 'एडवेंचर' : 'Adventure'}</span>
                    </button>
                    <div className="flex items-center space-x-2">
                      {stop.visited && <span className="text-green-500 text-lg">✅</span>}
                      {currentStop?.id === stop.id && !stop.visited && (
                        <span className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-medium animate-pulse">
                          {selectedLanguage.code === 'hi' ? 'वर्तमान' : 'Current'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-6 pb-24 max-w-4xl">
        {/* Enhanced Header */}
        <div className="text-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-purple-50 to-green-100 rounded-3xl transform -rotate-1"></div>
            <div className="relative bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl">🗺️</span>
                </div>
                <div className="text-left">
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {t.nav.travelGuide}
                  </h1>
                  <p className="text-sm text-gray-500 font-medium">AI-Powered Trip Planning</p>
                </div>
              </div>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed mb-4">
                Plan comprehensive multi-stop trips with AI recommendations and museum-quality live guidance.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4">
                <p className="text-blue-700 text-sm font-medium">
                  💡 Unlike Adventures (single places), Travel Guide plans complete multi-day trips with multiple stops
                </p>
              </div>
              <div className="flex items-center justify-center space-x-6">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span>AI-Powered</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                  <span>Live Guidance</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
                  <span>10+ Languages</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create New Trip */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl transform rotate-1 opacity-10"></div>
          <div className="relative bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-gray-100">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl">✨</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Plan New Trip</h2>
                <p className="text-sm text-gray-600">Enter a destination and let AI create your perfect itinerary</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-lg">🌍</span>
                  </div>
                  <input
                    type="text"
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value)}
                    placeholder="Enter a city or destination (e.g., 'Paris', 'Tokyo', 'New Delhi')"
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-all text-lg placeholder-gray-400 shadow-lg"
                  />
                </div>
                <button
                  onClick={createNewTrip}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 font-bold hover:from-blue-600 hover:to-purple-700 transition-all rounded-2xl disabled:opacity-50 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                  disabled={!newDestination.trim() || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg">✨</span>
                      <span>Create Trip</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Trip Plans */}
        <div className="space-y-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-lg">📋</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Your Trip Plans</h2>
          </div>
          
          {tripPlans.length > 0 ? (
            <div className="space-y-4">
              {tripPlans.map(plan => (
                <div key={plan.id} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{plan.destination}</p>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded-lg">🎭 {plan.preferences.mood}</span>
                        <span className="bg-gray-100 px-2 py-1 rounded-lg">💰 {plan.preferences.budget}</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => startEditingTrip(plan)}
                        className="bg-purple-500 text-white px-4 py-2 text-sm font-medium hover:bg-purple-600 transition-colors rounded-xl"
                      >
                        ✏️ Edit Trip
                      </button>
                      <button
                        onClick={() => startGuideMode(plan)}
                        className="bg-blue-500 text-white px-4 py-2 text-sm font-medium hover:bg-blue-600 transition-colors rounded-xl"
                      >
                        🚀 Start Guide
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Stops: {plan.stops.length}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="text-6xl mb-4">🗺️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No trip plans yet</h3>
              <p className="text-gray-600">Create your first trip above to get started</p>
            </div>
          )}
        </div>

        {/* Enhanced Features */}
        <div className="relative mt-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-3xl transform rotate-1"></div>
          <div className="relative bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Smart Features
              </h3>
              <p className="text-gray-600">Museum-quality technology for modern travelers</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 hover:shadow-xl transition-all transform hover:scale-105">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg mb-4">
                  <span className="text-2xl">📷</span>
                </div>
                <h4 className="font-bold text-blue-900 mb-2">Camera Recognition</h4>
                <p className="text-blue-800 text-sm">AI identifies landmarks in real-time</p>
              </div>
              
              <div className="group bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 hover:shadow-xl transition-all transform hover:scale-105">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg mb-4">
                  <span className="text-2xl">🎧</span>
                </div>
                <h4 className="font-bold text-purple-900 mb-2">Audio Guide</h4>
                <p className="text-purple-800 text-sm">Museum-quality narration</p>
              </div>
              
              <div className="group bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 hover:shadow-xl transition-all transform hover:scale-105">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg mb-4">
                  <span className="text-2xl">🌐</span>
                </div>
                <h4 className="font-bold text-green-900 mb-2">Multilingual</h4>
                <p className="text-green-800 text-sm">10+ languages supported</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelGuide;
