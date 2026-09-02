"""
Exercise seed data. youtube_video_id is intentionally left null here —
the exercise library endpoint fetches it from the YouTube Data API on first
view and caches it back into Mongo, so we don't hardcode ids that can go
stale or be wrong.
"""

EXERCISES = [
    # Chest
    {"name": "Barbell bench press", "muscle_group": "chest", "equipment": "barbell", "difficulty": "intermediate",
     "default_sets_reps": "4x8", "posture_tips": [
        "Keep shoulder blades pulled back and down through the whole set",
        "Lower the bar to mid-chest, elbows at roughly 45 degrees to your torso",
        "Keep feet flat on the floor for a stable base"]},
    {"name": "Push-up", "muscle_group": "chest", "equipment": "bodyweight", "difficulty": "beginner",
     "default_sets_reps": "3x15", "posture_tips": [
        "Keep a straight line from head to heels — don't let hips sag",
        "Lower until your chest is close to the floor, elbows at 45 degrees"]},
    {"name": "Dumbbell incline press", "muscle_group": "chest", "equipment": "dumbbell", "difficulty": "intermediate",
     "default_sets_reps": "3x10", "posture_tips": [
        "Set the bench to 30-45 degrees, higher targets more upper chest",
        "Don't let the dumbbells drift forward over your face at the top"]},
    {"name": "Cable chest fly", "muscle_group": "chest", "equipment": "machine", "difficulty": "intermediate",
     "default_sets_reps": "3x12", "posture_tips": [
        "Keep a slight bend in the elbows throughout, don't turn it into a press",
        "Squeeze at the center and control the negative"]},

    # Back
    {"name": "Deadlift", "muscle_group": "back", "equipment": "barbell", "difficulty": "advanced",
     "default_sets_reps": "4x5", "posture_tips": [
        "Keep the bar close to your shins and thighs the whole lift",
        "Brace your core hard before lifting, neutral spine throughout",
        "Drive through the floor with your legs, don't yank with your back"]},
    {"name": "Pull-up", "muscle_group": "back", "equipment": "bodyweight", "difficulty": "intermediate",
     "default_sets_reps": "3x8", "posture_tips": [
        "Start from a full dead hang, avoid kipping unless training for it specifically",
        "Pull your elbows down and back, not just up"]},
    {"name": "Bent-over barbell row", "muscle_group": "back", "equipment": "barbell", "difficulty": "intermediate",
     "default_sets_reps": "4x8", "posture_tips": [
        "Hinge at the hips, keep back flat, roughly 45 degrees to the floor",
        "Pull the bar to your lower ribs, elbows close to the body"]},
    {"name": "Lat pulldown", "muscle_group": "back", "equipment": "machine", "difficulty": "beginner",
     "default_sets_reps": "3x12", "posture_tips": [
        "Lean back slightly and pull the bar to your upper chest",
        "Avoid using momentum — control the weight on the way up too"]},
    {"name": "Single-arm dumbbell row", "muscle_group": "back", "equipment": "dumbbell", "difficulty": "beginner",
     "default_sets_reps": "3x10", "posture_tips": [
        "Keep your back flat, supporting hand and knee on the bench",
        "Pull the elbow up and back rather than just lifting the weight"]},

    # Legs
    {"name": "Barbell back squat", "muscle_group": "legs", "equipment": "barbell", "difficulty": "advanced",
     "default_sets_reps": "4x6", "posture_tips": [
        "Keep your chest up and core braced throughout the descent",
        "Push knees out in line with your toes, don't let them cave in",
        "Descend to at least parallel with control, drive up through the whole foot"]},
    {"name": "Bodyweight squat", "muscle_group": "legs", "equipment": "bodyweight", "difficulty": "beginner",
     "default_sets_reps": "3x20", "posture_tips": [
        "Keep weight through your heels and mid-foot, not just your toes",
        "Go as low as you can with control while keeping your back neutral"]},
    {"name": "Walking lunge", "muscle_group": "legs", "equipment": "dumbbell", "difficulty": "intermediate",
     "default_sets_reps": "3x12 each leg", "posture_tips": [
        "Take a stride long enough that your front knee stays behind your toes",
        "Keep your torso upright, don't lean forward into the lunge"]},
    {"name": "Leg press", "muscle_group": "legs", "equipment": "machine", "difficulty": "beginner",
     "default_sets_reps": "4x10", "posture_tips": [
        "Don't let your lower back round off the pad at the bottom",
        "Avoid locking your knees out hard at the top of each rep"]},
    {"name": "Romanian deadlift", "muscle_group": "legs", "equipment": "barbell", "difficulty": "intermediate",
     "default_sets_reps": "3x10", "posture_tips": [
        "Push your hips back rather than bending your knees to lower the bar",
        "Keep the bar close to your legs, stop when you feel a hamstring stretch"]},

    # Shoulders
    {"name": "Overhead barbell press", "muscle_group": "shoulders", "equipment": "barbell", "difficulty": "intermediate",
     "default_sets_reps": "4x8", "posture_tips": [
        "Brace your core to avoid arching your lower back as you press",
        "Press the bar in a straight line, moving your head back slightly to let it pass"]},
    {"name": "Dumbbell lateral raise", "muscle_group": "shoulders", "equipment": "dumbbell", "difficulty": "beginner",
     "default_sets_reps": "3x15", "posture_tips": [
        "Raise to roughly shoulder height, leading with your elbows",
        "Use a light weight and control the descent — this isn't a heavy-load movement"]},
    {"name": "Face pull", "muscle_group": "shoulders", "equipment": "band", "difficulty": "beginner",
     "default_sets_reps": "3x15", "posture_tips": [
        "Pull towards your face, elbows high, squeezing your rear shoulders",
        "Keep the movement slow and controlled rather than yanking the band"]},
    {"name": "Arnold press", "muscle_group": "shoulders", "equipment": "dumbbell", "difficulty": "intermediate",
     "default_sets_reps": "3x10", "posture_tips": [
        "Rotate your palms from facing you to facing forward as you press",
        "Keep your core tight to avoid arching your back at the top"]},

    # Biceps
    {"name": "Barbell curl", "muscle_group": "biceps", "equipment": "barbell", "difficulty": "beginner",
     "default_sets_reps": "3x12", "posture_tips": [
        "Keep your elbows pinned to your sides throughout the curl",
        "Avoid swinging your torso to help lift the weight"]},
    {"name": "Hammer curl", "muscle_group": "biceps", "equipment": "dumbbell", "difficulty": "beginner",
     "default_sets_reps": "3x12", "posture_tips": [
        "Keep your wrist neutral (thumb up) through the whole movement",
        "Control the lowering phase instead of letting the weight drop"]},
    {"name": "Concentration curl", "muscle_group": "biceps", "equipment": "dumbbell", "difficulty": "beginner",
     "default_sets_reps": "3x12 each arm", "posture_tips": [
        "Brace your elbow against your inner thigh to remove momentum",
        "Squeeze at the top rather than just lifting to the same height each rep"]},
    {"name": "Preacher curl", "muscle_group": "biceps", "equipment": "barbell", "difficulty": "intermediate",
     "default_sets_reps": "3x10", "posture_tips": [
        "Keep your upper arm flush against the pad the whole set",
        "Don't fully lock out at the bottom — keep slight tension on the bicep"]},

    # Triceps
    {"name": "Triceps rope pushdown", "muscle_group": "triceps", "equipment": "machine", "difficulty": "beginner",
     "default_sets_reps": "3x15", "posture_tips": [
        "Keep your elbows tucked and stationary at your sides",
        "Split the rope apart at the bottom for a full triceps squeeze"]},
    {"name": "Dips", "muscle_group": "triceps", "equipment": "bodyweight", "difficulty": "intermediate",
     "default_sets_reps": "3x10", "posture_tips": [
        "Stay upright rather than leaning forward to keep the emphasis on triceps",
        "Don't drop so low that your shoulders round forward excessively"]},
    {"name": "Skull crusher", "muscle_group": "triceps", "equipment": "barbell", "difficulty": "intermediate",
     "default_sets_reps": "3x10", "posture_tips": [
        "Keep your upper arms fixed and vertical, only the forearms move",
        "Lower the bar toward your forehead with control, don't let it drift back"]},
    {"name": "Overhead triceps extension", "muscle_group": "triceps", "equipment": "dumbbell", "difficulty": "beginner",
     "default_sets_reps": "3x12", "posture_tips": [
        "Keep your elbows pointed forward and close to your head",
        "Lower until you feel a stretch, don't let your elbows flare outward"]},

    # Core
    {"name": "Plank", "muscle_group": "core", "equipment": "bodyweight", "difficulty": "beginner",
     "default_sets_reps": "3x45s", "posture_tips": [
        "Keep a straight line from shoulders to heels, don't let hips sag or pike up",
        "Squeeze your glutes and brace your abs like you're about to be poked"]},
    {"name": "Hanging leg raise", "muscle_group": "core", "equipment": "bodyweight", "difficulty": "advanced",
     "default_sets_reps": "3x12", "posture_tips": [
        "Curl your pelvis up rather than just swinging your legs forward",
        "Avoid using momentum — control both the raise and the lowering"]},
    {"name": "Cable woodchopper", "muscle_group": "core", "equipment": "machine", "difficulty": "intermediate",
     "default_sets_reps": "3x12 each side", "posture_tips": [
        "Rotate through your torso, not just your arms",
        "Keep a slight bend in your knees and pivot your back foot as you turn"]},
    {"name": "Russian twist", "muscle_group": "core", "equipment": "bodyweight", "difficulty": "beginner",
     "default_sets_reps": "3x20", "posture_tips": [
        "Keep your chest up and back flat rather than rounding forward",
        "Move slowly — speed is easy to fake with momentum here"]},

    # Full body
    {"name": "Kettlebell swing", "muscle_group": "full_body", "equipment": "dumbbell", "difficulty": "intermediate",
     "default_sets_reps": "3x20", "posture_tips": [
        "This is a hip hinge, not a squat — power comes from snapping your hips forward",
        "Keep your arms relaxed, they're just guiding the weight, not lifting it"]},
    {"name": "Burpee", "muscle_group": "full_body", "equipment": "bodyweight", "difficulty": "intermediate",
     "default_sets_reps": "3x15", "posture_tips": [
        "Keep your core braced as you kick your feet back to plank position",
        "Land softly on the jump rather than slamming your heels down"]},
    {"name": "Clean and press", "muscle_group": "full_body", "equipment": "barbell", "difficulty": "advanced",
     "default_sets_reps": "4x5", "posture_tips": [
        "Keep the bar close to your body throughout the pull",
        "Catch the bar on your shoulders with elbows high before pressing overhead"]},
]
