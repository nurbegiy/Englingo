// Demo/mock dataset — mirrors the Supabase schema shape so the app is fully
// browsable without live credentials. See supabase/schema.sql for the real schema.

export const XP_BY_LEVEL = { A1: 10, A2: 10, B1: 15, B2: 20, C1: 20, C2: 25 }
export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export let branches = [
  { id: 'b1', name: 'Samarkand Center', status: 'active', created_at: '2025-01-10' },
  { id: 'b2', name: 'Registan Center', status: 'active', created_at: '2025-02-14' },
  { id: 'b3', name: 'Siyob Center', status: 'active', created_at: '2025-03-02' },
  { id: 'b4', name: 'Urgut Center', status: 'active', created_at: '2025-04-20' },
]

export let groups = [
  { id: 'g1', name: 'A2 — 14:00', branch_id: 'b1', teacher_id: 't1', code: 'A2X72K', level: 'A2' },
  { id: 'g2', name: 'B1 — 16:30', branch_id: 'b1', teacher_id: 't1', code: 'B1K90P', level: 'B1' },
  { id: 'g3', name: 'A1 — 10:00', branch_id: 'b2', teacher_id: 't2', code: 'A1M41Q', level: 'A1' },
]

export let profiles = [
  {
    id: 'u1', role: 'student', display_name: 'Ali Karimov', username: 'ali_k', branch_id: 'b1',
    group_id: 'g1', level: 'A2', xp: 2450, streak_current: 7, streak_best: 21, avatar_seed: 'ali',
    status: 'active', badges: ['first_week', 'grammar_star'],
  },
  {
    id: 'u2', role: 'student', display_name: 'Aziz Yusupov', username: 'aziz_y', branch_id: 'b1',
    group_id: 'g1', level: 'A2', xp: 2120, streak_current: 3, streak_best: 15, avatar_seed: 'aziz',
    status: 'active', badges: ['first_week'],
  },
  {
    id: 'u3', role: 'student', display_name: 'Muhammad Tosh', username: 'muhammad_t', branch_id: 'b1',
    group_id: 'g1', level: 'A1', xp: 1980, streak_current: 12, streak_best: 30, avatar_seed: 'muhammad',
    status: 'active', badges: ['streak_30', 'vocab_master'],
  },
  {
    id: 'u4', role: 'student', display_name: 'Dilnoza Rashidova', username: 'dilnoza_r', branch_id: 'b2',
    group_id: 'g3', level: 'B1', xp: 3210, streak_current: 5, streak_best: 40, avatar_seed: 'dilnoza',
    status: 'active', badges: ['streak_30', 'reading_pro', 'grammar_star'],
  },
  {
    id: 'demo-student', role: 'student', display_name: 'Siz (Demo)', username: 'demo_student', branch_id: 'b1',
    group_id: 'g1', level: 'A2', xp: 640, streak_current: 4, streak_best: 9, avatar_seed: 'demo',
    status: 'active', badges: ['first_week'],
  },
  { id: 't1', role: 'teacher', display_name: 'Nodira Egamova', username: 'nodira_t', branch_id: 'b1', status: 'active' },
  { id: 't2', role: 'teacher', display_name: 'Sardor Aliyev', username: 'sardor_t', branch_id: 'b2', status: 'active' },
  { id: 'admin1', role: 'admin', display_name: 'Super Admin', username: 'super_admin', status: 'active' },
]

export let follows = [
  { follower_id: 'demo-student', following_id: 'u1' },
  { follower_id: 'u2', following_id: 'demo-student' },
]

// ---- Learning content ----
export const lessons = {
  vocabulary: {
    A1: [
      { id: 'v-a1-1', type: 'choose_meaning', prompt: 'What does "happy" mean?', options: ['sad', 'feeling joy', 'tired', 'angry'], answer: 1 },
      { id: 'v-a1-2', type: 'match', prompt: 'Choose the correct word: I ___ a student.', options: ['am', 'is', 'are', 'be'], answer: 0 },
      { id: 'v-a1-3', type: 'choose_meaning', prompt: 'What does "big" mean?', options: ['small', 'large', 'quick', 'quiet'], answer: 1 },
      { id: 'v-a1-4', type: 'choose_meaning', prompt: 'What does "friend" mean?', options: ['a stranger', 'a person you like and trust', 'a teacher', 'a relative'], answer: 1 },
      { id: 'v-a1-5', type: 'sentence', prompt: 'Complete: This is ___ book.', options: ['my', 'me', 'I', 'mine is'], answer: 0 },
      { id: 'v-a1-6', type: 'choose_meaning', prompt: 'What does "cold" mean?', options: ['low temperature', 'high temperature', 'bright', 'loud'], answer: 0 },
    ],
    A2: [
      { id: 'v-a2-1', type: 'choose_meaning', prompt: 'What does "borrow" mean?', options: ['to give away', 'to take and return later', 'to buy', 'to lose'], answer: 1 },
      { id: 'v-a2-2', type: 'sentence', prompt: 'Complete: Can I ___ your pen for a minute?', options: ['borrow', 'lend', 'owe', 'rent'], answer: 0 },
      { id: 'v-a2-3', type: 'choose_meaning', prompt: 'What does "arrive" mean?', options: ['to leave', 'to reach a place', 'to plan', 'to wait'], answer: 1 },
      { id: 'v-a2-4', type: 'choose_meaning', prompt: 'What does "exhausted" mean?', options: ['very tired', 'very happy', 'very hungry', 'very fast'], answer: 0 },
      { id: 'v-a2-5', type: 'sentence', prompt: 'Complete: She is good ___ playing the piano.', options: ['at', 'in', 'on', 'for'], answer: 0 },
      { id: 'v-a2-6', type: 'choose_meaning', prompt: 'What does "rarely" mean?', options: ['often', 'never', 'not often', 'always'], answer: 2 },
    ],
    B1: [
      { id: 'v-b1-1', type: 'choose_meaning', prompt: 'What does "achieve" mean?', options: ['reach a goal', 'leave a place', 'buy something', 'forget something'], answer: 0 },
      { id: 'v-b1-2', type: 'sentence', prompt: 'Complete: She ___ her goals through hard work.', options: ['achieves', 'achieve', 'achieving', 'achievement'], answer: 0 },
      { id: 'v-b1-3', type: 'choose_meaning', prompt: 'What does "postpone" mean?', options: ['to cancel', 'to delay to a later time', 'to finish early', 'to repeat'], answer: 1 },
      { id: 'v-b1-4', type: 'choose_meaning', prompt: 'What does "reliable" mean?', options: ['can be trusted', 'expensive', 'complicated', 'temporary'], answer: 0 },
      { id: 'v-b1-5', type: 'sentence', prompt: 'Complete: The manager ___ the meeting until Friday.', options: ['postponed', 'postpone', 'postponing', 'postponement'], answer: 0 },
    ],
    B2: [
      { id: 'v-b2-1', type: 'choose_meaning', prompt: 'What does "reluctant" mean?', options: ['eager', 'unwilling', 'careful', 'confident'], answer: 1 },
      { id: 'v-b2-2', type: 'choose_meaning', prompt: 'What does "consequently" mean?', options: ['as a result', 'previously', 'occasionally', 'similarly'], answer: 0 },
      { id: 'v-b2-3', type: 'choose_meaning', prompt: 'What does "substantial" mean?', options: ['tiny', 'large in amount', 'imaginary', 'temporary'], answer: 1 },
      { id: 'v-b2-4', type: 'choose_meaning', prompt: 'What does "inevitable" mean?', options: ['avoidable', 'impossible', 'certain to happen', 'unlikely'], answer: 2 },
    ],
    C1: [
      { id: 'v-c1-1', type: 'choose_meaning', prompt: 'What does "ambiguous" mean?', options: ['clear', 'having more than one meaning', 'friendly', 'quick'], answer: 1 },
      { id: 'v-c1-2', type: 'choose_meaning', prompt: 'What does "meticulous" mean?', options: ['careless', 'very careful and precise', 'fast', 'expensive'], answer: 1 },
      { id: 'v-c1-3', type: 'choose_meaning', prompt: 'What does "candid" mean?', options: ['honest and direct', 'dishonest', 'shy', 'confused'], answer: 0 },
    ],
    C2: [
      { id: 'v-c2-1', type: 'choose_meaning', prompt: 'What does "ephemeral" mean?', options: ['lasting a very short time', 'permanent', 'expensive', 'complicated'], answer: 0 },
      { id: 'v-c2-2', type: 'choose_meaning', prompt: 'What does "ubiquitous" mean?', options: ['rare', 'present everywhere', 'hidden', 'ancient'], answer: 1 },
      { id: 'v-c2-3', type: 'choose_meaning', prompt: 'What does "pragmatic" mean?', options: ['dealing with things sensibly', 'idealistic', 'emotional', 'careless'], answer: 0 },
    ],
  },
  grammar: {
    A1: [
      { id: 'g-a1-1', type: 'fill', prompt: 'She ___ to school every day.', options: ['go', 'goes', 'going', 'gone'], answer: 1 },
      { id: 'g-a1-2', type: 'fill', prompt: 'They ___ from Uzbekistan.', options: ['is', 'am', 'are', 'be'], answer: 2 },
      { id: 'g-a1-3', type: 'fill', prompt: 'I ___ two brothers.', options: ['have', 'has', 'having', 'had'], answer: 0 },
      { id: 'g-a1-4', type: 'fill', prompt: '___ you a teacher?', options: ['Do', 'Is', 'Are', 'Am'], answer: 2 },
      { id: 'g-a1-5', type: 'fill', prompt: 'This is ___ apple.', options: ['a', 'an', 'the', 'some'], answer: 1 },
    ],
    A2: [
      { id: 'g-a2-1', type: 'fill', prompt: 'I ___ my homework yesterday.', options: ['do', 'did', 'done', 'doing'], answer: 1 },
      { id: 'g-a2-2', type: 'mistake', prompt: 'Find the mistake: "She don\'t like coffee."', options: ['She', "don't", 'like', 'coffee'], answer: 1 },
      { id: 'g-a2-3', type: 'fill', prompt: 'We ___ watching a film right now.', options: ['are', 'is', 'was', 'be'], answer: 0 },
      { id: 'g-a2-4', type: 'fill', prompt: 'There ___ some milk in the fridge.', options: ['is', 'are', 'be', 'am'], answer: 0 },
      { id: 'g-a2-5', type: 'fill', prompt: 'He is ___ than his brother.', options: ['tall', 'taller', 'tallest', 'more tall'], answer: 1 },
    ],
    B1: [
      { id: 'g-b1-1', type: 'fill', prompt: 'By next year, I ___ my studies.', options: ['will finish', 'will have finished', 'finish', 'finished'], answer: 1 },
      { id: 'g-b1-2', type: 'fill', prompt: 'If it rains, we ___ at home.', options: ['stay', 'will stay', 'stayed', 'staying'], answer: 1 },
      { id: 'g-b1-3', type: 'mistake', prompt: 'Find the mistake: "I have been to Paris last year."', options: ['I', 'have been', 'to Paris', 'last year'], answer: 1 },
      { id: 'g-b1-4', type: 'fill', prompt: 'The book ___ by millions of people.', options: ['read', 'has read', 'has been read', 'reads'], answer: 2 },
    ],
    B2: [
      { id: 'g-b2-1', type: 'fill', prompt: 'If I ___ known, I would have helped.', options: ['have', 'had', 'has', 'having'], answer: 1 },
      { id: 'g-b2-2', type: 'fill', prompt: 'She suggested ___ earlier next time.', options: ['to leave', 'leaving', 'left', 'leave'], answer: 1 },
      { id: 'g-b2-3', type: 'fill', prompt: 'I wish I ___ more time to prepare.', options: ['have', 'had', 'has', 'having'], answer: 1 },
    ],
    C1: [
      { id: 'g-c1-1', type: 'fill', prompt: 'Rarely ___ such dedication.', options: ['I have seen', 'have I seen', 'I saw', 'did I see'], answer: 1 },
      { id: 'g-c1-2', type: 'fill', prompt: 'Were it not for his support, the project ___ failed.', options: ['would', 'will', 'would have', 'has'], answer: 2 },
      { id: 'g-c1-3', type: 'fill', prompt: 'Not only ___ late, but he also forgot the documents.', options: ['he was', 'was he', 'he is', 'is he'], answer: 1 },
    ],
    C2: [
      { id: 'g-c2-1', type: 'fill', prompt: 'Had it not been for his help, the project ___ failed.', options: ['would', 'would have', 'will have', 'had'], answer: 1 },
      { id: 'g-c2-2', type: 'fill', prompt: 'So absorbed ___ in her work that she missed the call.', options: ['she was', 'was she', 'she is', 'is she'], answer: 1 },
    ],
  },
  listening: {
    A1: [
      { id: 'l-a1-1', audioText: '"Hello, my name is Tom. I am a teacher."', prompt: 'What is Tom\'s job?', options: ['Student', 'Teacher', 'Doctor', 'Driver'], answer: 1 },
      { id: 'l-a1-2', audioText: '"My sister has a red bag. She takes it to school every day."', prompt: 'What color is the bag?', options: ['Blue', 'Red', 'Green', 'Black'], answer: 1 },
      { id: 'l-a1-3', audioText: '"We usually eat breakfast at seven in the morning."', prompt: 'When do they eat breakfast?', options: ['Six', 'Seven', 'Eight', 'Nine'], answer: 1 },
      { id: 'l-a1-4', audioText: '"There are three cats in the garden."', prompt: 'How many cats are in the garden?', options: ['Two', 'Three', 'Four', 'Five'], answer: 1 },
    ],
    A2: [
      { id: 'l-a2-1', audioText: '"The train leaves at 9 o\'clock from platform 3."', prompt: 'What platform does the train leave from?', options: ['1', '2', '3', '4'], answer: 2 },
      { id: 'l-a2-2', audioText: '"I usually go to the gym after work, but yesterday I was too tired."', prompt: 'Did the speaker go to the gym yesterday?', options: ['Yes', 'No'], answer: 1 },
      { id: 'l-a2-3', audioText: '"The shop closes at six, but on Sundays it closes at four."', prompt: 'When does the shop close on Sundays?', options: ['Four', 'Five', 'Six', 'Seven'], answer: 0 },
    ],
    B1: [
      { id: 'l-b1-1', audioText: '"Despite the rain, the match continued as planned."', prompt: 'Did the match stop because of rain?', options: ['Yes', 'No'], answer: 1 },
      { id: 'l-b1-2', audioText: '"She used to live in London, but she moved to Berlin two years ago."', prompt: 'Where does she live now?', options: ['London', 'Berlin', 'Paris', 'Rome'], answer: 1 },
      { id: 'l-b1-3', audioText: '"The flight was delayed by two hours because of bad weather."', prompt: 'Why was the flight delayed?', options: ['Bad weather', 'A technical fault', 'A strike', 'No pilots'], answer: 0 },
    ],
    B2: [
      { id: 'l-b2-1', audioText: '"The committee postponed the decision until further data was available."', prompt: 'What did the committee do?', options: ['Made a decision', 'Delayed the decision', 'Cancelled the meeting', 'Approved the budget'], answer: 1 },
      { id: 'l-b2-2', audioText: '"Although the proposal was well received, funding remains uncertain."', prompt: 'What is uncertain?', options: ['The proposal\'s quality', 'The funding', 'The audience', 'The deadline'], answer: 1 },
    ],
    C1: [
      { id: 'l-c1-1', audioText: '"Notwithstanding the criticism, she remained resolute in her approach."', prompt: 'How did she react to criticism?', options: ['She changed her mind', 'She stayed firm', 'She gave up', 'She got angry'], answer: 1 },
      { id: 'l-c1-2', audioText: '"The findings, while preliminary, suggest a significant shift in consumer behaviour."', prompt: 'What do the findings suggest?', options: ['Nothing has changed', 'A major change in behaviour', 'The study failed', 'Consumers stopped buying'], answer: 1 },
    ],
    C2: [
      { id: 'l-c2-1', audioText: '"The nuanced argument eluded most of the audience."', prompt: 'Did most people understand the argument?', options: ['Yes', 'No'], answer: 1 },
      { id: 'l-c2-2', audioText: '"Her reticence was often mistaken for indifference, though nothing could be further from the truth."', prompt: 'Was she actually indifferent?', options: ['Yes', 'No'], answer: 1 },
    ],
  },
  reading: {
    A1: [
      { id: 'r-a1-1', text: 'Anna has a small dog. The dog is white and likes to play in the park every morning.', prompt: 'What color is the dog?', options: ['Black', 'White', 'Brown', 'Grey'], answer: 1 },
      { id: 'r-a1-2', text: 'Bobur wakes up at seven. He eats breakfast and then goes to school by bus.', prompt: 'How does Bobur get to school?', options: ['On foot', 'By bus', 'By car', 'By bike'], answer: 1 },
      { id: 'r-a1-3', text: 'My mother is a doctor. She works at a big hospital in the city.', prompt: "What is the mother's job?", options: ['Teacher', 'Doctor', 'Nurse', 'Driver'], answer: 1 },
      { id: 'r-a1-4', text: 'The weather today is sunny and warm. We are going to the park with our friends.', prompt: 'What is the weather like today?', options: ['Rainy', 'Cold', 'Sunny and warm', 'Snowy'], answer: 2 },
    ],
    A2: [
      { id: 'r-a2-1', text: 'Last summer, my family and I visited Bukhara. We stayed for three days and saw many old buildings.', prompt: 'How many days did they stay?', options: ['Two', 'Three', 'Four', 'A week'], answer: 1 },
      { id: 'r-a2-2', text: 'Nilufar loves reading books. Every weekend, she visits the library and borrows two or three new books.', prompt: 'How many books does Nilufar usually borrow?', options: ['One', 'Two or three', 'Five', 'Ten'], answer: 1 },
      { id: 'r-a2-3', text: 'The new cafe near our school serves coffee, tea, and fresh juice. It opens at eight and closes at nine in the evening.', prompt: 'What time does the cafe close?', options: ['Eight', 'Nine in the evening', 'Ten', 'Midnight'], answer: 1 },
    ],
    B1: [
      { id: 'r-b1-1', text: 'Remote work has changed how companies think about office space. Many businesses now offer flexible schedules.', prompt: 'What has changed for many businesses?', options: ['Salaries', 'Office space and schedules', 'Company names', 'Working days only'], answer: 1 },
      { id: 'r-b1-2', text: 'Recycling programs have grown quickly in the last decade, though many cities still struggle with plastic waste.', prompt: 'What do many cities still struggle with?', options: ['Recycling growth', 'Plastic waste', 'Lack of programs', 'Lower costs'], answer: 1 },
      { id: 'r-b1-3', text: 'Learning a new language takes practice and patience, but daily short sessions work better than rare long ones.', prompt: 'What works better for language learning?', options: ['Rare long sessions', 'Daily short sessions', 'No practice', 'Only reading'], answer: 1 },
    ],
    B2: [
      { id: 'r-b2-1', text: 'While automation increases efficiency, it also raises concerns about job displacement across several industries.', prompt: 'What concern is mentioned?', options: ['Higher taxes', 'Job displacement', 'Lower efficiency', 'Slower internet'], answer: 1 },
      { id: 'r-b2-2', text: 'Urban green spaces have been shown to reduce stress, yet city budgets rarely prioritize their expansion.', prompt: 'What do city budgets rarely prioritize?', options: ['Roads', 'Expanding green spaces', 'Reducing stress', 'Housing'], answer: 1 },
    ],
    C1: [
      { id: 'r-c1-1', text: 'The argument, though compelling on the surface, rests on assumptions that few economists would accept without scrutiny.', prompt: 'How do economists likely view the assumptions?', options: ['Fully accepted', 'Requiring scrutiny', 'Irrelevant', 'Universally agreed'], answer: 1 },
      { id: 'r-c1-2', text: 'Critics argue that the policy, despite its good intentions, fails to address the structural causes of inequality.', prompt: 'What do critics say the policy fails to address?', options: ['Good intentions', 'Structural causes of inequality', 'Short-term costs', 'Public opinion'], answer: 1 },
    ],
    C2: [
      { id: 'r-c2-1', text: 'Her prose, dense with allusion, rewards the patient reader while alienating those seeking immediacy.', prompt: 'Who does the prose reward?', options: ['Impatient readers', 'Patient readers', 'New readers', 'No one'], answer: 1 },
      { id: 'r-c2-2', text: 'The treatise, for all its erudition, remains curiously silent on the very question it purports to answer.', prompt: 'What is the treatise silent on?', options: ['Its own erudition', 'The question it claims to answer', 'The author\'s identity', 'Its length'], answer: 1 },
    ],
  },
}

// Placement test — mixed pool across skills/levels
export const placementQuestions = [
  { id: 'p1', level: 'A1', prompt: 'She ___ a teacher.', options: ['am', 'is', 'are', 'be'], answer: 1 },
  { id: 'p2', level: 'A1', prompt: 'What does "big" mean?', options: ['small', 'large', 'fast', 'slow'], answer: 1 },
  { id: 'p3', level: 'A2', prompt: 'I ___ my homework yesterday.', options: ['do', 'did', 'done', 'doing'], answer: 1 },
  { id: 'p4', level: 'A2', prompt: 'Can I ___ your pen?', options: ['borrow', 'lend', 'owe', 'rent'], answer: 0 },
  { id: 'p5', level: 'B1', prompt: 'By next year, I ___ my studies.', options: ['will finish', 'will have finished', 'finish', 'finished'], answer: 1 },
  { id: 'p6', level: 'B1', prompt: 'What does "achieve" mean?', options: ['reach a goal', 'leave a place', 'buy something', 'forget'], answer: 0 },
  { id: 'p7', level: 'B2', prompt: 'If I ___ known, I would have helped.', options: ['have', 'had', 'has', 'having'], answer: 1 },
  { id: 'p8', level: 'B2', prompt: 'What does "reluctant" mean?', options: ['eager', 'unwilling', 'careful', 'confident'], answer: 1 },
  { id: 'p9', level: 'C1', prompt: 'Rarely ___ such dedication.', options: ['I have seen', 'have I seen', 'I saw', 'did I see'], answer: 1 },
  { id: 'p10', level: 'C1', prompt: 'What does "ambiguous" mean?', options: ['clear', 'having more than one meaning', 'friendly', 'quick'], answer: 1 },
  { id: 'p11', level: 'C2', prompt: 'Had it not been for his help, the project ___ failed.', options: ['would', 'would have', 'will have', 'had'], answer: 1 },
  { id: 'p12', level: 'C2', prompt: 'What does "ephemeral" mean?', options: ['lasting a very short time', 'permanent', 'expensive', 'complicated'], answer: 0 },
]

export let shopItems = [
  { id: 's1', name: 'Golden Frame', category: 'frame', price: 1000, description: 'A shining gold border for your avatar.' },
  { id: 's2', name: 'Silver Frame', category: 'frame', price: 500, description: 'A polished silver border.' },
  { id: 's3', name: 'Streak Shield', category: 'streak', price: 300, description: 'Protects your streak for one missed day.' },
  { id: 's4', name: 'Night Owl Badge', category: 'badge', price: 200, description: 'For late-night learners.' },
  { id: 's5', name: 'Bookworm Badge', category: 'badge', price: 250, description: 'Awarded to avid readers.' },
  { id: 's6', name: 'Confetti Burst', category: 'cosmetic', price: 400, description: 'Celebrate every level-up in style.' },
]

export let shopPurchases = [
  { id: 'sp1', user_id: 'demo-student', item_id: 's4', purchased_at: '2026-08-10' },
]

export let challenges = [
  { id: 'c1', group_id: 'g1', title: "Bugungi maqsad: 3 ta mashq bajaring", target: 3, type: 'practices', created_by: 't1' },
]

export let xpTransactions = []
export let quizAttempts = []
export let wrongAnswers = []

export const platformSettings = {
  name: 'Lingua Track',
  logo_url: null,
  accent_color: 'emerald',
  default_language: 'uz',
}

export const TEACHER_CODE = 'TEACH-2026-SMD'
