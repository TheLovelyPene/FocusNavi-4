package com.accessiblemaps.service;

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.AccessibilityServiceInfo;
import android.content.Intent;
import android.graphics.PixelFormat;
import android.os.Build;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.speech.tts.TextToSpeech;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.WindowManager;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import java.util.ArrayList;
import java.util.Locale;

public class GoogleMapsAccessibilityService extends AccessibilityService 
    implements TextToSpeech.OnInitListener, RecognitionListener {
    
    private static final String GOOGLE_MAPS_PACKAGE = "com.google.android.apps.maps";
    private static final String TAG = "AccessibilityService";
    
    private WindowManager windowManager;
    private View overlayView;
    private TextToSpeech textToSpeech;
    private SpeechRecognizer speechRecognizer;
    private boolean isListening = false;
    private boolean isGoogleMapsActive = false;
    
    // UI Components
    private LinearLayout accessibilityPanel;
    private Button voiceCommandButton;
    private Button readDirectionsButton;
    private Button describeLocationButton;
    private TextView statusText;
    
    @Override
    public void onServiceConnected() {
        super.onServiceConnected();
        
        // Configure accessibility service
        AccessibilityServiceInfo info = new AccessibilityServiceInfo();
        info.eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED | 
                         AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED;
        info.feedbackType = AccessibilityServiceInfo.FEEDBACK_SPOKEN;
        info.flags = AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS;
        info.packageNames = new String[]{GOOGLE_MAPS_PACKAGE};
        setServiceInfo(info);
        
        // Initialize components
        initializeTextToSpeech();
        initializeSpeechRecognizer();
        createOverlayInterface();
        
        Toast.makeText(this, "Accessible Maps Service Started", Toast.LENGTH_SHORT).show();
    }
    
    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event.getPackageName() == null) return;
        
        String packageName = event.getPackageName().toString();
        
        // Detect Google Maps activation
        if (GOOGLE_MAPS_PACKAGE.equals(packageName)) {
            if (!isGoogleMapsActive) {
                isGoogleMapsActive = true;
                showAccessibilityOverlay();
                announceActivation();
            }
            
            // Process Google Maps content changes
            if (event.getEventType() == AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED) {
                processGoogleMapsContent(event);
            }
        } else {
            if (isGoogleMapsActive) {
                isGoogleMapsActive = false;
                hideAccessibilityOverlay();
            }
        }
    }
    
    private void initializeTextToSpeech() {
        textToSpeech = new TextToSpeech(this, this);
    }
    
    private void initializeSpeechRecognizer() {
        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this);
        speechRecognizer.setRecognitionListener(this);
    }
    
    private void createOverlayInterface() {
        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);
        
        // Create overlay layout
        LayoutInflater inflater = LayoutInflater.from(this);
        overlayView = inflater.inflate(R.layout.accessibility_overlay, null);
        
        // Initialize UI components
        accessibilityPanel = overlayView.findViewById(R.id.accessibility_panel);
        voiceCommandButton = overlayView.findViewById(R.id.voice_command_button);
        readDirectionsButton = overlayView.findViewById(R.id.read_directions_button);
        describeLocationButton = overlayView.findViewById(R.id.describe_location_button);
        statusText = overlayView.findViewById(R.id.status_text);
        
        // Set up button listeners
        voiceCommandButton.setOnClickListener(v -> toggleVoiceRecognition());
        readDirectionsButton.setOnClickListener(v -> readCurrentDirections());
        describeLocationButton.setOnClickListener(v -> describeCurrentLocation());
        
        // Configure overlay window parameters
        WindowManager.LayoutParams params = new WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.O 
                ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                : WindowManager.LayoutParams.TYPE_PHONE,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE |
            WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
            PixelFormat.TRANSLUCENT
        );
        
        params.gravity = Gravity.TOP | Gravity.RIGHT;
        params.x = 20;
        params.y = 100;
        
        overlayView.setLayoutParams(params);
    }
    
    private void showAccessibilityOverlay() {
        if (overlayView != null && overlayView.getParent() == null) {
            try {
                windowManager.addView(overlayView, overlayView.getLayoutParams());
                updateStatusText("Accessibility Active");
            } catch (Exception e) {
                // Handle overlay permission issues
                Toast.makeText(this, "Overlay permission required", Toast.LENGTH_LONG).show();
            }
        }
    }
    
    private void hideAccessibilityOverlay() {
        if (overlayView != null && overlayView.getParent() != null) {
            windowManager.removeView(overlayView);
        }
    }
    
    private void announceActivation() {
        speak("Accessible Maps activated. Voice commands available.");
    }
    
    private void processGoogleMapsContent(AccessibilityEvent event) {
        AccessibilityNodeInfo source = event.getSource();
        if (source == null) return;
        
        // Look for navigation instructions
        String navigationText = extractNavigationInstructions(source);
        if (navigationText != null && !navigationText.isEmpty()) {
            // Auto-announce new directions if enabled
            // This would be configurable in settings
        }
        
        source.recycle();
    }
    
    private String extractNavigationInstructions(AccessibilityNodeInfo node) {
        // Search for navigation-related content in Google Maps
        // This requires analyzing the Google Maps UI structure
        
        if (node == null) return null;
        
        // Look for specific UI elements that contain directions
        String[] navigationKeywords = {
            "Turn", "Continue", "Head", "Take", "Exit", "Arrive", "Destination"
        };
        
        String nodeText = getNodeText(node);
        if (nodeText != null) {
            for (String keyword : navigationKeywords) {
                if (nodeText.contains(keyword)) {
                    return nodeText;
                }
            }
        }
        
        // Recursively search child nodes
        for (int i = 0; i < node.getChildCount(); i++) {
            AccessibilityNodeInfo child = node.getChild(i);
            if (child != null) {
                String childResult = extractNavigationInstructions(child);
                if (childResult != null) {
                    child.recycle();
                    return childResult;
                }
                child.recycle();
            }
        }
        
        return null;
    }
    
    private String getNodeText(AccessibilityNodeInfo node) {
        if (node.getText() != null) {
            return node.getText().toString();
        }
        if (node.getContentDescription() != null) {
            return node.getContentDescription().toString();
        }
        return null;
    }
    
    private void toggleVoiceRecognition() {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }
    
    private void startListening() {
        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, 
                       RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault());
        intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
        
        try {
            speechRecognizer.startListening(intent);
            isListening = true;
            updateStatusText("Listening...");
            voiceCommandButton.setText("Stop");
        } catch (Exception e) {
            speak("Voice recognition not available");
        }
    }
    
    private void stopListening() {
        speechRecognizer.stopListening();
        isListening = false;
        updateStatusText("Voice Ready");
        voiceCommandButton.setText("Voice");
    }
    
    private void readCurrentDirections() {
        AccessibilityNodeInfo rootNode = getRootInActiveWindow();
        if (rootNode != null) {
            String directions = extractNavigationInstructions(rootNode);
            if (directions != null && !directions.isEmpty()) {
                speak("Current direction: " + directions);
            } else {
                speak("No navigation directions found. Please start navigation in Google Maps.");
            }
            rootNode.recycle();
        } else {
            speak("Unable to read directions. Please ensure Google Maps is active.");
        }
    }
    
    private void describeCurrentLocation() {
        // This would extract location information from Google Maps UI
        AccessibilityNodeInfo rootNode = getRootInActiveWindow();
        if (rootNode != null) {
            String locationInfo = extractLocationInformation(rootNode);
            if (locationInfo != null && !locationInfo.isEmpty()) {
                speak("Current location: " + locationInfo);
            } else {
                speak("Location information not available.");
            }
            rootNode.recycle();
        } else {
            speak("Unable to determine location.");
        }
    }
    
    private String extractLocationInformation(AccessibilityNodeInfo node) {
        // Extract current location or search information from Google Maps
        // This would analyze the search bar, place names, or current location indicators
        
        if (node == null) return null;
        
        // Look for search box content or place information
        String nodeText = getNodeText(node);
        if (nodeText != null && nodeText.length() > 0 && !nodeText.equals("Search here")) {
            // Filter out common UI elements
            String[] uiElements = {"Menu", "Search", "Directions", "More", "Share"};
            boolean isUIElement = false;
            for (String element : uiElements) {
                if (nodeText.equals(element)) {
                    isUIElement = true;
                    break;
                }
            }
            if (!isUIElement && nodeText.length() > 3) {
                return nodeText;
            }
        }
        
        // Search child nodes
        for (int i = 0; i < node.getChildCount(); i++) {
            AccessibilityNodeInfo child = node.getChild(i);
            if (child != null) {
                String childResult = extractLocationInformation(child);
                if (childResult != null) {
                    child.recycle();
                    return childResult;
                }
                child.recycle();
            }
        }
        
        return null;
    }
    
    private void processVoiceCommand(String command) {
        command = command.toLowerCase().trim();
        
        if (command.contains("directions") || command.contains("navigate")) {
            readCurrentDirections();
        } else if (command.contains("where am i") || command.contains("location")) {
            describeCurrentLocation();
        } else if (command.contains("zoom in")) {
            performGlobalAction(GLOBAL_ACTION_ZOOM_IN);
            speak("Zooming in");
        } else if (command.contains("zoom out")) {
            performGlobalAction(GLOBAL_ACTION_ZOOM_OUT);
            speak("Zooming out");
        } else if (command.contains("repeat")) {
            readCurrentDirections();
        } else if (command.contains("help")) {
            speak("Available commands: read directions, where am I, zoom in, zoom out, repeat");
        } else {
            speak("Command not recognized. Say 'help' for available commands.");
        }
    }
    
    private void updateStatusText(String status) {
        if (statusText != null) {
            statusText.setText(status);
        }
    }
    
    private void speak(String text) {
        if (textToSpeech != null) {
            textToSpeech.speak(text, TextToSpeech.QUEUE_FLUSH, null, null);
        }
    }
    
    // TextToSpeech.OnInitListener implementation
    @Override
    public void onInit(int status) {
        if (status == TextToSpeech.SUCCESS) {
            int result = textToSpeech.setLanguage(Locale.getDefault());
            if (result == TextToSpeech.LANG_MISSING_DATA || 
                result == TextToSpeech.LANG_NOT_SUPPORTED) {
                // Fallback to English
                textToSpeech.setLanguage(Locale.ENGLISH);
            }
        }
    }
    
    // RecognitionListener implementation
    @Override
    public void onReadyForSpeech(Bundle params) {
        updateStatusText("Speak now...");
    }
    
    @Override
    public void onBeginningOfSpeech() {
        updateStatusText("Listening...");
    }
    
    @Override
    public void onRmsChanged(float rmsdB) {
        // Audio level indicator could be added here
    }
    
    @Override
    public void onBufferReceived(byte[] buffer) {
        // Not used
    }
    
    @Override
    public void onEndOfSpeech() {
        updateStatusText("Processing...");
    }
    
    @Override
    public void onError(int error) {
        String errorMessage = "Voice recognition error";
        switch (error) {
            case SpeechRecognizer.ERROR_AUDIO:
                errorMessage = "Audio recording error";
                break;
            case SpeechRecognizer.ERROR_CLIENT:
                errorMessage = "Client side error";
                break;
            case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS:
                errorMessage = "Insufficient permissions";
                break;
            case SpeechRecognizer.ERROR_NETWORK:
                errorMessage = "Network error";
                break;
            case SpeechRecognizer.ERROR_NETWORK_TIMEOUT:
                errorMessage = "Network timeout";
                break;
            case SpeechRecognizer.ERROR_NO_MATCH:
                errorMessage = "No speech input matched";
                break;
            case SpeechRecognizer.ERROR_RECOGNIZER_BUSY:
                errorMessage = "Recognition service busy";
                break;
            case SpeechRecognizer.ERROR_SERVER:
                errorMessage = "Server error";
                break;
            case SpeechRecognizer.ERROR_SPEECH_TIMEOUT:
                errorMessage = "No speech input";
                break;
        }
        
        speak(errorMessage);
        stopListening();
    }
    
    @Override
    public void onResults(Bundle results) {
        ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
        if (matches != null && !matches.isEmpty()) {
            String command = matches.get(0);
            processVoiceCommand(command);
        }
        stopListening();
    }
    
    @Override
    public void onPartialResults(Bundle partialResults) {
        // Could show partial results in UI
    }
    
    @Override
    public void onEvent(int eventType, Bundle params) {
        // Not used
    }
    
    @Override
    public void onInterrupt() {
        // Service interrupted
        if (textToSpeech != null) {
            textToSpeech.stop();
        }
        if (speechRecognizer != null) {
            speechRecognizer.cancel();
        }
    }
    
    @Override
    public void onDestroy() {
        super.onDestroy();
        
        // Clean up resources
        if (overlayView != null && overlayView.getParent() != null) {
            windowManager.removeView(overlayView);
        }
        
        if (textToSpeech != null) {
            textToSpeech.stop();
            textToSpeech.shutdown();
        }
        
        if (speechRecognizer != null) {
            speechRecognizer.destroy();
        }
    }
}
