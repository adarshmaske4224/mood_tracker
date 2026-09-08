package com.example.DailyMoodStressTracker.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;

/**
 * AI-powered stress analyzer that calculates stress levels from student text input.
 * Uses NLP techniques: keyword matching, sentiment analysis, intensity detection,
 * and contextual pattern recognition to generate a stress score (1-10).
 */
@Service
public class StressAnalyzerService {

    // High-stress keywords with their weight (1-3)
    private static final Map<String, Integer> STRESS_KEYWORDS = new LinkedHashMap<>();
    private static final Map<String, Integer> POSITIVE_KEYWORDS = new LinkedHashMap<>();
    private static final List<Pattern> CRISIS_PATTERNS = new ArrayList<>();
    private static final List<Pattern> INTENSITY_PATTERNS = new ArrayList<>();

    static {
        // === STRESS / NEGATIVE KEYWORDS ===
        // Severe (weight 3)
        STRESS_KEYWORDS.put("suicidal", 3);
        STRESS_KEYWORDS.put("suicide", 3);
        STRESS_KEYWORDS.put("kill myself", 3);
        STRESS_KEYWORDS.put("end it all", 3);
        STRESS_KEYWORDS.put("self harm", 3);
        STRESS_KEYWORDS.put("self-harm", 3);
        STRESS_KEYWORDS.put("hopeless", 3);
        STRESS_KEYWORDS.put("worthless", 3);
        STRESS_KEYWORDS.put("panic attack", 3);
        STRESS_KEYWORDS.put("breakdown", 3);
        STRESS_KEYWORDS.put("breaking down", 3);

        // High (weight 2)
        STRESS_KEYWORDS.put("depressed", 2);
        STRESS_KEYWORDS.put("depression", 2);
        STRESS_KEYWORDS.put("anxious", 2);
        STRESS_KEYWORDS.put("anxiety", 2);
        STRESS_KEYWORDS.put("overwhelmed", 2);
        STRESS_KEYWORDS.put("exhausted", 2);
        STRESS_KEYWORDS.put("can't sleep", 2);
        STRESS_KEYWORDS.put("cannot sleep", 2);
        STRESS_KEYWORDS.put("insomnia", 2);
        STRESS_KEYWORDS.put("crying", 2);
        STRESS_KEYWORDS.put("lonely", 2);
        STRESS_KEYWORDS.put("isolated", 2);
        STRESS_KEYWORDS.put("burnout", 2);
        STRESS_KEYWORDS.put("burned out", 2);
        STRESS_KEYWORDS.put("failing", 2);
        STRESS_KEYWORDS.put("failed", 2);
        STRESS_KEYWORDS.put("terrible", 2);
        STRESS_KEYWORDS.put("miserable", 2);
        STRESS_KEYWORDS.put("hate myself", 2);
        STRESS_KEYWORDS.put("can't cope", 2);
        STRESS_KEYWORDS.put("cannot cope", 2);
        STRESS_KEYWORDS.put("no motivation", 2);
        STRESS_KEYWORDS.put("give up", 2);
        STRESS_KEYWORDS.put("giving up", 2);
        STRESS_KEYWORDS.put("nightmare", 2);
        STRESS_KEYWORDS.put("trauma", 2);

        // Moderate (weight 1)
        STRESS_KEYWORDS.put("stressed", 1);
        STRESS_KEYWORDS.put("stress", 1);
        STRESS_KEYWORDS.put("worried", 1);
        STRESS_KEYWORDS.put("nervous", 1);
        STRESS_KEYWORDS.put("pressure", 1);
        STRESS_KEYWORDS.put("tense", 1);
        STRESS_KEYWORDS.put("frustrated", 1);
        STRESS_KEYWORDS.put("angry", 1);
        STRESS_KEYWORDS.put("upset", 1);
        STRESS_KEYWORDS.put("sad", 1);
        STRESS_KEYWORDS.put("tired", 1);
        STRESS_KEYWORDS.put("confused", 1);
        STRESS_KEYWORDS.put("struggling", 1);
        STRESS_KEYWORDS.put("difficult", 1);
        STRESS_KEYWORDS.put("hard time", 1);
        STRESS_KEYWORDS.put("bad day", 1);
        STRESS_KEYWORDS.put("rough day", 1);
        STRESS_KEYWORDS.put("headache", 1);
        STRESS_KEYWORDS.put("sick", 1);
        STRESS_KEYWORDS.put("scared", 1);
        STRESS_KEYWORDS.put("afraid", 1);
        STRESS_KEYWORDS.put("annoyed", 1);
        STRESS_KEYWORDS.put("irritated", 1);
        STRESS_KEYWORDS.put("bored", 1);
        STRESS_KEYWORDS.put("unmotivated", 1);
        STRESS_KEYWORDS.put("distracted", 1);
        STRESS_KEYWORDS.put("procrastinating", 1);
        STRESS_KEYWORDS.put("exam", 1);
        STRESS_KEYWORDS.put("deadline", 1);
        STRESS_KEYWORDS.put("assignment", 1);
        STRESS_KEYWORDS.put("backlog", 1);

        // === POSITIVE KEYWORDS (reduce stress score) ===
        POSITIVE_KEYWORDS.put("happy", 2);
        POSITIVE_KEYWORDS.put("great", 2);
        POSITIVE_KEYWORDS.put("amazing", 2);
        POSITIVE_KEYWORDS.put("wonderful", 2);
        POSITIVE_KEYWORDS.put("fantastic", 2);
        POSITIVE_KEYWORDS.put("excellent", 2);
        POSITIVE_KEYWORDS.put("blessed", 2);
        POSITIVE_KEYWORDS.put("grateful", 2);
        POSITIVE_KEYWORDS.put("thankful", 2);
        POSITIVE_KEYWORDS.put("joyful", 2);
        POSITIVE_KEYWORDS.put("excited", 2);
        POSITIVE_KEYWORDS.put("good", 1);
        POSITIVE_KEYWORDS.put("fine", 1);
        POSITIVE_KEYWORDS.put("okay", 1);
        POSITIVE_KEYWORDS.put("better", 1);
        POSITIVE_KEYWORDS.put("relaxed", 1);
        POSITIVE_KEYWORDS.put("calm", 1);
        POSITIVE_KEYWORDS.put("peaceful", 1);
        POSITIVE_KEYWORDS.put("content", 1);
        POSITIVE_KEYWORDS.put("motivated", 1);
        POSITIVE_KEYWORDS.put("productive", 1);
        POSITIVE_KEYWORDS.put("confident", 1);
        POSITIVE_KEYWORDS.put("hopeful", 1);
        POSITIVE_KEYWORDS.put("energetic", 1);
        POSITIVE_KEYWORDS.put("fun", 1);
        POSITIVE_KEYWORDS.put("enjoyed", 1);
        POSITIVE_KEYWORDS.put("love", 1);

        // === CRISIS PATTERNS (immediate high score) ===
        CRISIS_PATTERNS.add(Pattern.compile("(?i)want\\s+to\\s+die"));
        CRISIS_PATTERNS.add(Pattern.compile("(?i)don'?t\\s+want\\s+to\\s+live"));
        CRISIS_PATTERNS.add(Pattern.compile("(?i)no\\s+reason\\s+to\\s+live"));
        CRISIS_PATTERNS.add(Pattern.compile("(?i)better\\s+off\\s+dead"));
        CRISIS_PATTERNS.add(Pattern.compile("(?i)can'?t\\s+go\\s+on"));
        CRISIS_PATTERNS.add(Pattern.compile("(?i)end\\s+my\\s+life"));

        // === INTENSITY AMPLIFIERS ===
        INTENSITY_PATTERNS.add(Pattern.compile("(?i)\\b(very|really|extremely|so|too|incredibly|absolutely|completely|totally)\\b"));
        INTENSITY_PATTERNS.add(Pattern.compile("(?i)\\b(always|never|every\\s*day|constantly|continuously)\\b"));
        INTENSITY_PATTERNS.add(Pattern.compile("(?i)(!{2,})"));
    }

    /**
     * Analyzes student text and returns a stress result.
     */
    public StressResult analyzeStress(String text, int moodRating) {
        if (text == null || text.trim().isEmpty()) {
            // If no text, derive stress purely from mood rating
            int stressFromMood = Math.max(1, 11 - (moodRating * 2));
            return new StressResult(
                    Math.min(stressFromMood, 10),
                    "Stress level estimated from mood rating. Consider writing about how you feel for a more accurate assessment.",
                    List.of()
            );
        }

        String lowerText = text.toLowerCase().trim();

        // Check for crisis patterns first
        for (Pattern pattern : CRISIS_PATTERNS) {
            if (pattern.matcher(lowerText).find()) {
                return new StressResult(
                        10,
                        "⚠️ CRITICAL: The text indicates severe emotional distress. Immediate support is strongly recommended. " +
                                "Detected crisis-level language suggesting the student may be in danger.",
                        List.of("crisis-language", "immediate-attention-needed")
                );
            }
        }

        // Calculate keyword scores
        double stressScore = 0;
        double positiveScore = 0;
        List<String> detectedIndicators = new ArrayList<>();

        for (Map.Entry<String, Integer> entry : STRESS_KEYWORDS.entrySet()) {
            if (lowerText.contains(entry.getKey())) {
                stressScore += entry.getValue();
                detectedIndicators.add(entry.getKey());
            }
        }

        for (Map.Entry<String, Integer> entry : POSITIVE_KEYWORDS.entrySet()) {
            if (lowerText.contains(entry.getKey())) {
                positiveScore += entry.getValue();
            }
        }

        // Check intensity amplifiers
        int intensityCount = 0;
        for (Pattern pattern : INTENSITY_PATTERNS) {
            var matcher = pattern.matcher(lowerText);
            while (matcher.find()) {
                intensityCount++;
            }
        }

        // Apply intensity multiplier
        if (intensityCount > 0 && stressScore > 0) {
            stressScore *= (1 + (intensityCount * 0.15));
        }

        // Factor in mood rating (1=Awful to 5=Great)
        // Lower mood increases stress contribution
        double moodFactor = (6 - moodRating) * 0.8;
        stressScore += moodFactor;

        // Subtract positive score
        stressScore -= positiveScore * 0.5;

        // Analyze text length and punctuation
        long exclamationCount = text.chars().filter(c -> c == '!').count();
        long capsWords = Arrays.stream(text.split("\\s+"))
                .filter(w -> w.length() > 2 && w.equals(w.toUpperCase()) && w.matches(".*[A-Z].*"))
                .count();

        stressScore += exclamationCount * 0.2;
        stressScore += capsWords * 0.3;

        // Normalize to 1-10 scale
        int finalScore = (int) Math.round(Math.max(1, Math.min(10, stressScore)));

        // Generate analysis summary
        String analysis = generateAnalysis(finalScore, detectedIndicators, moodRating);

        return new StressResult(finalScore, analysis, detectedIndicators);
    }

    private String generateAnalysis(int score, List<String> indicators, int mood) {
        StringBuilder sb = new StringBuilder();

        if (score >= 8) {
            sb.append("🔴 HIGH STRESS DETECTED. ");
            sb.append("The student's input shows significant signs of emotional distress. ");
        } else if (score >= 5) {
            sb.append("🟡 MODERATE STRESS DETECTED. ");
            sb.append("The student appears to be experiencing notable stress. ");
        } else if (score >= 3) {
            sb.append("🟢 MILD STRESS. ");
            sb.append("The student shows some minor stress indicators. ");
        } else {
            sb.append("✅ LOW STRESS. ");
            sb.append("The student appears to be in a positive state. ");
        }

        if (!indicators.isEmpty()) {
            sb.append("Key indicators detected: ");
            sb.append(String.join(", ", indicators.subList(0, Math.min(5, indicators.size()))));
            sb.append(". ");
        }

        String[] moodLabels = {"", "Awful", "Low", "Okay", "Good", "Great"};
        sb.append("Self-reported mood: ").append(moodLabels[mood]).append(".");

        return sb.toString();
    }

    /**
     * Result of AI stress analysis.
     */
    public record StressResult(
            int stressLevel,
            String analysis,
            List<String> detectedIndicators
    ) {}
}
